const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticate = require('../middleware/auth');

// GET all projects for logged in user
router.get('/', authenticate, async (req, res) => {
  try {
    const projects = await pool.query(
      `SELECT p.* FROM projects p
       JOIN project_members pm ON p.id = pm.project_id
       WHERE pm.user_id = $1`,
      [req.user.id]
    );
    res.json(projects.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE a project (admin only)
router.post('/', authenticate, async (req, res) => {
  const { name, description } = req.body;
  try {
    const project = await pool.query(
      'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, req.user.id]
    );
    // automatically add creator as member
    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [project.rows[0].id, req.user.id, 'admin']
    );
    res.status(201).json(project.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD member to project (admin only)
router.post('/:id/members', authenticate, async (req, res) => {
  const { user_id, role } = req.body;
  try {
    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [req.params.id, user_id, role || 'member']
    );
    res.json({ message: 'Member added successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single project
router.get('/:id', authenticate, async (req, res) => {
  try {
    const project = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    const members = await pool.query(
      `SELECT u.id, u.name, u.email, pm.role FROM users u
       JOIN project_members pm ON u.id = pm.user_id
       WHERE pm.project_id = $1`,
      [req.params.id]
    );
    res.json({ ...project.rows[0], members: members.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE project (admin only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await pool.query('DELETE FROM projects WHERE id = $1 AND owner_id = $2',
      [req.params.id, req.user.id]);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;