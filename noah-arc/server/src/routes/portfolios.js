const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/init');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Browse / search portfolios (public)
router.get('/', (req, res) => {
  const { q, speciality } = req.query;
  let sql = `
    SELECT p.*, u.name as creative_name, u.speciality as creative_speciality, u.avatar_url as creative_avatar
    FROM portfolios p JOIN users u ON u.id = p.creative_id
    WHERE p.status = 'published'
  `;
  const params = [];
  if (q) {
    sql += ' AND (p.title LIKE ? OR p.description LIKE ? OR u.name LIKE ?)';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (speciality) {
    sql += ' AND u.speciality LIKE ?';
    params.push(`%${speciality}%`);
  }
  sql += ' ORDER BY p.created_at DESC';
  const rows = db.prepare(sql).all(...params);
  res.json({ portfolios: rows });
});

router.get('/mine', requireAuth, requireRole('creative'), (req, res) => {
  const rows = db.prepare('SELECT * FROM portfolios WHERE creative_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ portfolios: rows });
});

router.get('/creative/:creativeId', (req, res) => {
  const creative = db.prepare('SELECT id, name, bio, speciality, avatar_url, created_at FROM users WHERE id = ? AND role = ?').get(req.params.creativeId, 'creative');
  if (!creative) return res.status(404).json({ error: 'Creative not found' });
  const portfolios = db.prepare("SELECT * FROM portfolios WHERE creative_id = ? AND status = 'published' ORDER BY created_at DESC").all(req.params.creativeId);
  const reviews = db.prepare('SELECT * FROM reviews WHERE creative_id = ? ORDER BY created_at DESC').all(req.params.creativeId);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
  res.json({ creative, portfolios, reviews, avgRating });
});

router.post('/', requireAuth, requireRole('creative'), (req, res) => {
  const { title, description, imageUrl } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  const id = uuidv4();
  db.prepare(`
    INSERT INTO portfolios (id, creative_id, title, description, image_url) VALUES (?, ?, ?, ?, ?)
  `).run(id, req.user.id, title, description || '', imageUrl || '');
  const portfolio = db.prepare('SELECT * FROM portfolios WHERE id = ?').get(id);
  res.status(201).json({ portfolio });
});

router.put('/:id', requireAuth, requireRole('creative'), (req, res) => {
  const item = db.prepare('SELECT * FROM portfolios WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Portfolio item not found' });
  if (item.creative_id !== req.user.id) return res.status(403).json({ error: 'Not your portfolio item' });
  const { title, description, imageUrl, status } = req.body;
  db.prepare(`
    UPDATE portfolios SET title = ?, description = ?, image_url = ?, status = ? WHERE id = ?
  `).run(title ?? item.title, description ?? item.description, imageUrl ?? item.image_url, status ?? item.status, item.id);
  res.json({ portfolio: db.prepare('SELECT * FROM portfolios WHERE id = ?').get(item.id) });
});

router.delete('/:id', requireAuth, requireRole('creative'), (req, res) => {
  const item = db.prepare('SELECT * FROM portfolios WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Portfolio item not found' });
  if (item.creative_id !== req.user.id) return res.status(403).json({ error: 'Not your portfolio item' });
  db.prepare('DELETE FROM portfolios WHERE id = ?').run(item.id);
  res.json({ success: true });
});

module.exports = router;
