const express = require('express');
const db = require('../db/init');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireRole('admin'));

router.get('/stats', (req, res) => {
  const users = db.prepare('SELECT COUNT(*) c FROM users').get().c;
  const creatives = db.prepare("SELECT COUNT(*) c FROM users WHERE role='creative'").get().c;
  const clients = db.prepare("SELECT COUNT(*) c FROM users WHERE role='client'").get().c;
  const jobs = db.prepare('SELECT COUNT(*) c FROM jobs').get().c;
  const portfolios = db.prepare('SELECT COUNT(*) c FROM portfolios').get().c;
  const bookings = db.prepare('SELECT COUNT(*) c FROM bookings').get().c;
  res.json({ users, creatives, clients, jobs, portfolios, bookings });
});

router.get('/users', (req, res) => {
  const rows = db.prepare('SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC').all();
  res.json({ users: rows });
});

router.put('/users/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['active', 'suspended'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.role === 'admin') return res.status(400).json({ error: 'Cannot change status of an admin account' });
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, user.id);
  res.json({ success: true });
});

router.get('/portfolios', (req, res) => {
  const rows = db.prepare(`
    SELECT p.*, u.name as creative_name FROM portfolios p JOIN users u ON u.id = p.creative_id
    ORDER BY p.created_at DESC
  `).all();
  res.json({ portfolios: rows });
});

router.put('/portfolios/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['published', 'hidden'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const item = db.prepare('SELECT * FROM portfolios WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Portfolio item not found' });
  db.prepare('UPDATE portfolios SET status = ? WHERE id = ?').run(status, item.id);
  res.json({ success: true });
});

router.get('/jobs', (req, res) => {
  const rows = db.prepare(`
    SELECT j.*, u.name as client_name FROM jobs j JOIN users u ON u.id = j.client_id ORDER BY j.created_at DESC
  `).all();
  res.json({ jobs: rows });
});

router.put('/jobs/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['open', 'closed'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  db.prepare('UPDATE jobs SET status = ? WHERE id = ?').run(status, job.id);
  res.json({ success: true });
});

module.exports = router;
