const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/init');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// list conversations (grouped by other user) for the logged-in user
router.get('/conversations', requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM messages WHERE sender_id = ? OR receiver_id = ? ORDER BY created_at DESC
  `).all(req.user.id, req.user.id);

  const byUser = new Map();
  for (const m of rows) {
    const otherId = m.sender_id === req.user.id ? m.receiver_id : m.sender_id;
    if (!byUser.has(otherId)) {
      byUser.set(otherId, { otherId, lastMessage: m, unread: 0 });
    }
    if (m.receiver_id === req.user.id && !m.read) {
      byUser.get(otherId).unread += 1;
    }
  }
  const conversations = [...byUser.values()].map(c => {
    const other = db.prepare('SELECT id, name, role, avatar_url FROM users WHERE id = ?').get(c.otherId);
    return { ...c, other };
  });
  res.json({ conversations });
});

router.get('/with/:userId', requireAuth, (req, res) => {
  const other = db.prepare('SELECT id, name, role, avatar_url FROM users WHERE id = ?').get(req.params.userId);
  if (!other) return res.status(404).json({ error: 'User not found' });
  const rows = db.prepare(`
    SELECT * FROM messages
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    ORDER BY created_at ASC
  `).all(req.user.id, req.params.userId, req.params.userId, req.user.id);
  db.prepare(`UPDATE messages SET read = 1 WHERE receiver_id = ? AND sender_id = ?`).run(req.user.id, req.params.userId);
  res.json({ other, messages: rows });
});

router.post('/', requireAuth, (req, res) => {
  const { receiverId, content } = req.body;
  if (!receiverId || !content) return res.status(400).json({ error: 'receiverId and content are required' });
  const receiver = db.prepare('SELECT id FROM users WHERE id = ?').get(receiverId);
  if (!receiver) return res.status(404).json({ error: 'Recipient not found' });
  const id = uuidv4();
  db.prepare(`INSERT INTO messages (id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)`)
    .run(id, req.user.id, receiverId, content);
  res.status(201).json({ message: db.prepare('SELECT * FROM messages WHERE id = ?').get(id) });
});

module.exports = router;
