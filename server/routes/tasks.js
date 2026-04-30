const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticate = require('../middleware/auth');

const allowedPriorities = ['low', 'medium', 'high'];
const allowedStatuses = ['todo', 'in_progress', 'done'];

const normalizeOptional = (value) => {
  if (value === undefined || value === null || value === '') return null;
  return value;
};

const userCanManageProject = async (projectId, user) => {
  if (user.role === 'admin') return true;

  const membership = await pool.query(
    'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
    [projectId, user.id]
  );

  return membership.rows[0]?.role === 'admin';
};

const userIsProjectMember = async (projectId, user) => {
  if (user.role === 'admin') return true;

  const membership = await pool.query(
    'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
    [projectId, user.id]
  );

  return membership.rows.length > 0;
};

const assignedUserBelongsToProject = async (projectId, assignedTo) => {
  if (!assignedTo) return true;

  const membership = await pool.query(
    'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
    [projectId, assignedTo]
  );

  return membership.rows.length > 0;
};

// GET dashboard stats
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM tasks WHERE assigned_to = $1', [req.user.id]);
    const completed = await pool.query(
      'SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND status = $2',
      [req.user.id, 'done']
    );
    const overdue = await pool.query(
      'SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND due_date < CURRENT_DATE AND status != $2',
      [req.user.id, 'done']
    );

    res.json({
      total: Number(total.rows[0].count),
      completed: Number(completed.rows[0].count),
      overdue: Number(overdue.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET my tasks
router.get('/my-tasks', authenticate, async (req, res) => {
  try {
    const tasks = await pool.query(
      `SELECT t.*, u.name as assigned_to_name, p.name as project_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.assigned_to = $1
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );
    res.json(tasks.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all tasks for a project
router.get('/project/:project_id', authenticate, async (req, res) => {
  try {
    if (!(await userIsProjectMember(req.params.project_id, req.user))) {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }

    const tasks = await pool.query(
      `SELECT t.*, u.name as assigned_to_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.project_id = $1
       ORDER BY t.created_at DESC`,
      [req.params.project_id]
    );
    res.json(tasks.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE a task (project admins only)
router.post('/', authenticate, async (req, res) => {
  const title = req.body.title?.trim();
  const description = req.body.description?.trim() || '';
  const projectId = req.body.project_id;
  const assignedTo = normalizeOptional(req.body.assigned_to);
  const dueDate = normalizeOptional(req.body.due_date);
  const priority = req.body.priority || 'medium';

  if (!title || !projectId) {
    return res.status(400).json({ message: 'Task title and project are required' });
  }

  if (!allowedPriorities.includes(priority)) {
    return res.status(400).json({ message: 'Priority must be low, medium or high' });
  }

  try {
    const project = await pool.query('SELECT id FROM projects WHERE id = $1', [projectId]);
    if (project.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!(await userCanManageProject(projectId, req.user))) {
      return res.status(403).json({ message: 'Only project admins can create tasks' });
    }

    if (!(await assignedUserBelongsToProject(projectId, assignedTo))) {
      return res.status(400).json({ message: 'Assigned user must be a project member' });
    }

    const task = await pool.query(
      `INSERT INTO tasks (title, description, project_id, assigned_to, due_date, priority, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'todo') RETURNING *`,
      [title, description, projectId, assignedTo, dueDate, priority]
    );

    res.status(201).json(task.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE task status (project admins or assigned member)
router.patch('/:id/status', authenticate, async (req, res) => {
  const { status } = req.body;

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Status must be todo, in_progress or done' });
  }

  try {
    const existingTask = await pool.query(
      'SELECT id, project_id, assigned_to FROM tasks WHERE id = $1',
      [req.params.id]
    );

    if (existingTask.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const taskData = existingTask.rows[0];
    const isAssignee = taskData.assigned_to && String(taskData.assigned_to) === String(req.user.id);

    if (!isAssignee && !(await userCanManageProject(taskData.project_id, req.user))) {
      return res.status(403).json({ message: 'You can only update your own task status' });
    }

    const task = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json(task.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE full task (project admins only)
router.put('/:id', authenticate, async (req, res) => {
  const title = req.body.title?.trim();
  const description = req.body.description?.trim() || '';
  const assignedTo = normalizeOptional(req.body.assigned_to);
  const dueDate = normalizeOptional(req.body.due_date);
  const { priority, status } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Task title is required' });
  }

  if (!allowedPriorities.includes(priority) || !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid priority or status' });
  }

  try {
    const existingTask = await pool.query('SELECT id, project_id FROM tasks WHERE id = $1', [req.params.id]);
    if (existingTask.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const projectId = existingTask.rows[0].project_id;
    if (!(await userCanManageProject(projectId, req.user))) {
      return res.status(403).json({ message: 'Only project admins can edit tasks' });
    }

    if (!(await assignedUserBelongsToProject(projectId, assignedTo))) {
      return res.status(400).json({ message: 'Assigned user must be a project member' });
    }

    const task = await pool.query(
      `UPDATE tasks
       SET title=$1, description=$2, assigned_to=$3, due_date=$4, priority=$5, status=$6
       WHERE id=$7 RETURNING *`,
      [title, description, assignedTo, dueDate, priority, status, req.params.id]
    );

    res.json(task.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE task (project admins only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const existingTask = await pool.query('SELECT id, project_id FROM tasks WHERE id = $1', [req.params.id]);
    if (existingTask.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!(await userCanManageProject(existingTask.rows[0].project_id, req.user))) {
      return res.status(403).json({ message: 'Only project admins can delete tasks' });
    }

    await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
