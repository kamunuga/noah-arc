const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/init');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/creative/:creativeId', (req, res) => {
  const rows = db.prepare(`
    SELECT r.*, u.name as reviewer_name FROM reviews r JOIN users u ON u.id = r.reviewer_id
    WHERE r.creative_id = ? ORDER BY r.created_at DESC
  `).all(req.params.creativeId);
  res.json({ reviews: rows });
});

router.post('/', requireAuth, requireRole('client'), (req, res) => {
  const { creativeId, rating, comment } = req.body;
  if (!creativeId || !rating) return res.status(400).json({ error: 'creativeId and rating are required' });
  const creative = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'creative'").get(creativeId);
  if (!creative) return res.status(404).json({ error: 'Creative not found' });
  const id = uuidv4();
  db.prepare(`INSERT INTO reviews (id, reviewer_id, creative_id, rating, comment) VALUES (?, ?, ?, ?, ?)`)
    .run(id, req.user.id, creativeId, rating, comment || '');
  res.status(201).json({ review: db.prepare('SELECT * FROM reviews WHERE id = ?').get(id) });
});

module.exports = router;
