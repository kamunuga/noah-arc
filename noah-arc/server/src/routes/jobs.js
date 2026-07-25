const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/init');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const { q, status } = req.query;
  let sql = `
    SELECT j.*, u.name as client_name, u.company_name
    FROM jobs j JOIN users u ON u.id = j.client_id WHERE 1=1
  `;
  const params = [];
  if (status) { sql += ' AND j.status = ?'; params.push(status); }
  else { sql += " AND j.status = 'open'"; }
  if (q) { sql += ' AND (j.title LIKE ? OR j.description LIKE ? OR j.category LIKE ?)'; params.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  sql += ' ORDER BY j.created_at DESC';
  res.json({ jobs: db.prepare(sql).all(...params) });
});

router.get('/mine', requireAuth, requireRole('client'), (req, res) => {
  const jobs = db.prepare('SELECT * FROM jobs WHERE client_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ jobs });
});

router.get('/:id', (req, res) => {
  const job = db.prepare(`
    SELECT j.*, u.name as client_name, u.company_name FROM jobs j JOIN users u ON u.id = j.client_id WHERE j.id = ?
  `).get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json({ job });
});

router.get('/:id/applications', requireAuth, (req, res) => {
  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.client_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not your job posting' });
  const apps = db.prepare(`
    SELECT a.*, u.name as creative_name, u.speciality, u.avatar_url
    FROM applications a JOIN users u ON u.id = a.creative_id
    WHERE a.job_id = ? ORDER BY a.created_at DESC
  `).all(req.params.id);
  res.json({ applications: apps });
});

router.post('/', requireAuth, requireRole('client'), (req, res) => {
  const { title, description, budget, category } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  const id = uuidv4();
  db.prepare(`
    INSERT INTO jobs (id, client_id, title, description, budget, category) VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, req.user.id, title, description || '', budget || '', category || '');
  res.status(201).json({ job: db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) });
});

router.put('/:id', requireAuth, requireRole('client'), (req, res) => {
  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.client_id !== req.user.id) return res.status(403).json({ error: 'Not your job posting' });
  const { title, description, budget, category, status } = req.body;
  db.prepare(`
    UPDATE jobs SET title=?, description=?, budget=?, category=?, status=? WHERE id=?
  `).run(title ?? job.title, description ?? job.description, budget ?? job.budget, category ?? job.category, status ?? job.status, job.id);
  res.json({ job: db.prepare('SELECT * FROM jobs WHERE id = ?').get(job.id) });
});

router.post('/:id/apply', requireAuth, requireRole('creative'), (req, res) => {
  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.status !== 'open') return res.status(400).json({ error: 'This job is no longer open' });
  const already = db.prepare('SELECT id FROM applications WHERE job_id = ? AND creative_id = ?').get(job.id, req.user.id);
  if (already) return res.status(409).json({ error: 'You already applied to this job' });
  const id = uuidv4();
  db.prepare(`INSERT INTO applications (id, job_id, creative_id, proposal) VALUES (?, ?, ?, ?)`)
    .run(id, job.id, req.user.id, req.body.proposal || '');
  res.status(201).json({ application: db.prepare('SELECT * FROM applications WHERE id = ?').get(id) });
});

router.put('/applications/:appId', requireAuth, requireRole('client'), (req, res) => {
  const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.appId);
  if (!app) return res.status(404).json({ error: 'Application not found' });
  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(app.job_id);
  if (job.client_id !== req.user.id) return res.status(403).json({ error: 'Not your job posting' });
  const { status } = req.body;
  if (!['accepted', 'rejected', 'pending'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  db.prepare('UPDATE applications SET status = ? WHERE id = ?').run(status, app.id);
  res.json({ application: db.prepare('SELECT * FROM applications WHERE id = ?').get(app.id) });
});

router.get('/applications/mine', requireAuth, requireRole('creative'), (req, res) => {
  const apps = db.prepare(`
    SELECT a.*, j.title as job_title, j.status as job_status, u.name as client_name
    FROM applications a JOIN jobs j ON j.id = a.job_id JOIN users u ON u.id = j.client_id
    WHERE a.creative_id = ? ORDER BY a.created_at DESC
  `).all(req.user.id);
  res.json({ applications: apps });
});

module.exports = router;
