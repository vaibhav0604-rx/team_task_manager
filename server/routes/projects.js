const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticate = require('../middleware/auth');

const allowedMemberRoles = ['admin', 'member'];

const canManageProject = async (projectId, user) => {
  if (user.role === 'admin') return true;

  const membership = await pool.query(
    'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
    [projectId, user.id]
  );

  return membership.rows[0]?.role === 'admin';
};

const isProjectMember = async (projectId, userId) => {
  const membership = await pool.query(
    'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
    [projectId, userId]
  );

  return membership.rows.length > 0;
};

// GET all projects for logged in user
router.get('/', authenticate, async (req, res) => {
  try {
    const projects = await pool.query(
      `SELECT p.*, pm.role AS member_role
       FROM projects p
       JOIN project_members pm ON p.id = pm.project_id
       WHERE pm.user_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(projects.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE a project (global admins only)
router.post('/', authenticate, async (req, res) => {
  const name = req.body.name?.trim();
  const description = req.body.description?.trim() || '';

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can create projects' });
  }

  if (!name) {
    return res.status(400).json({ message: 'Project name is required' });
  }

  try {
    const project = await pool.query(
      'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, req.user.id]
    );

    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [project.rows[0].id, req.user.id, 'admin']
    );

    res.status(201).json(project.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD member to project (project admins only)
router.post('/:id/members', authenticate, async (req, res) => {
  const role = allowedMemberRoles.includes(req.body.role) ? req.body.role : 'member';
  const email = req.body.email?.trim().toLowerCase();
  const userId = req.body.user_id;

  if (!email && !userId) {
    return res.status(400).json({ message: 'Member email or user id is required' });
  }

  try {
    const project = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (project.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!(await canManageProject(req.params.id, req.user))) {
      return res.status(403).json({ message: 'Only project admins can add members' });
    }

    const userQuery = email
      ? await pool.query('SELECT id, name, email FROM users WHERE email = $1', [email])
      : await pool.query('SELECT id, name, email FROM users WHERE id = $1', [userId]);

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ message: 'User not found. Ask them to sign up first.' });
    }

    const member = userQuery.rows[0];
    if (await isProjectMember(req.params.id, member.id)) {
      return res.status(409).json({ message: 'User is already a project member' });
    }

    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [req.params.id, member.id, role]
    );

    res.status(201).json({ message: 'Member added successfully', member: { ...member, role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single project
router.get('/:id', authenticate, async (req, res) => {
  try {
    const project = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (project.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (req.user.role !== 'admin' && !(await isProjectMember(req.params.id, req.user.id))) {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }

    const members = await pool.query(
      `SELECT u.id, u.name, u.email, pm.role
       FROM users u
       JOIN project_members pm ON u.id = pm.user_id
       WHERE pm.project_id = $1
       ORDER BY pm.role, u.name`,
      [req.params.id]
    );

    res.json({ ...project.rows[0], members: members.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE project (project admins only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const project = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (project.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!(await canManageProject(req.params.id, req.user))) {
      return res.status(403).json({ message: 'Only project admins can delete projects' });
    }

    await pool.query('DELETE FROM tasks WHERE project_id = $1', [req.params.id]);
    await pool.query('DELETE FROM project_members WHERE project_id = $1', [req.params.id]);
    await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
