const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/init');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/mine', requireAuth, (req, res) => {
  const col = req.user.role === 'creative' ? 'creative_id' : 'client_id';
  const rows = db.prepare(`
    SELECT b.*, c.name as client_name, cr.name as creative_name, cr.speciality
    FROM bookings b
    JOIN users c ON c.id = b.client_id
    JOIN users cr ON cr.id = b.creative_id
    WHERE b.${col} = ? ORDER BY b.created_at DESC
  `).all(req.user.id);
  res.json({ bookings: rows });
});

router.post('/', requireAuth, requireRole('client'), (req, res) => {
  const { creativeId, details, startDate, endDate } = req.body;
  if (!creativeId) return res.status(400).json({ error: 'creativeId is required' });
  const creative = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'creative'").get(creativeId);
  if (!creative) return res.status(404).json({ error: 'Creative not found' });
  const id = uuidv4();
  db.prepare(`
    INSERT INTO bookings (id, client_id, creative_id, details, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, req.user.id, creativeId, details || '', startDate || '', endDate || '');
  res.status(201).json({ booking: db.prepare('SELECT * FROM bookings WHERE id = ?').get(id) });
});

router.put('/:id', requireAuth, (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  const { status } = req.body;
  const allowed = ['pending', 'accepted', 'rejected', 'completed', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const isCreative = req.user.id === booking.creative_id;
  const isClient = req.user.id === booking.client_id;
  if (!isCreative && !isClient) return res.status(403).json({ error: 'Not part of this booking' });
  if ((status === 'accepted' || status === 'rejected') && !isCreative) {
    return res.status(403).json({ error: 'Only the creative can accept or reject a booking' });
  }
  if (status === 'cancelled' && !isClient) {
    return res.status(403).json({ error: 'Only the client can cancel a booking' });
  }

  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, booking.id);
  res.json({ booking: db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking.id) });
});

module.exports = router;
