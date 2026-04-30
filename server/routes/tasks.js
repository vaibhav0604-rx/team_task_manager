const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticate = require('../middleware/auth');

// GET all tasks for a project
router.get('/project/:project_id', authenticate, async (req, res) => {
  try {
    const tasks = await pool.query(
      `SELECT t.*, u.name as assigned_to_name FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.project_id = $1`,
      [req.params.project_id]
    );
    res.json(tasks.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE a task
router.post('/', authenticate, async (req, res) => {
  const { title, description, project_id, assigned_to, due_date, priority } = req.body;
  try {
    const task = await pool.query(
      `INSERT INTO tasks (title, description, project_id, assigned_to, due_date, priority, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'todo') RETURNING *`,
      [title, description, project_id, assigned_to, due_date, priority || 'medium']
    );
    res.status(201).json(task.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE task status
router.patch('/:id/status', authenticate, async (req, res) => {
  const { status } = req.body;
  try {
    const task = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json(task.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE full task (admin)
router.put('/:id', authenticate, async (req, res) => {
  const { title, description, assigned_to, due_date, priority, status } = req.body;
  try {
    const task = await pool.query(
      `UPDATE tasks SET title=$1, description=$2, assigned_to=$3,
       due_date=$4, priority=$5, status=$6 WHERE id=$7 RETURNING *`,
      [title, description, assigned_to, due_date, priority, status, req.params.id]
    );
    res.json(task.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE task
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET dashboard stats
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM tasks WHERE assigned_to = $1', [req.user.id]);
    const completed = await pool.query('SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND status = $2', [req.user.id, 'done']);
    const overdue = await pool.query(
      'SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND due_date < NOW() AND status != $2',
      [req.user.id, 'done']
    );
    res.json({
      total: total.rows[0].count,
      completed: completed.rows[0].count,
      overdue: overdue.rows[0].count
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET my tasks
router.get('/my-tasks', authenticate, async (req, res) => {
  try {
    const tasks = await pool.query(
      `SELECT t.*, u.name as assigned_to_name FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.assigned_to = $1
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );
    res.json(tasks.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;