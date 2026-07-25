require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./db/init');

const authRoutes = require('./routes/auth');
const portfolioRoutes = require('./routes/portfolios');
const jobRoutes = require('./routes/jobs');
const bookingRoutes = require('./routes/bookings');
const messageRoutes = require('./routes/messages');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Seed a default admin account on first boot so the platform is manageable out of the box
function seedAdmin() {
  const existing = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
  if (existing) return;
  const email = process.env.ADMIN_EMAIL || 'admin@noaharc.africa';
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const id = uuidv4();
  const password_hash = bcrypt.hashSync(password, 10);
  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role) VALUES (?, 'Noah Arc Admin', ?, ?, 'admin')
  `).run(id, email.toLowerCase(), password_hash);
  console.log(`Seeded admin account -> email: ${email}  password: ${password} (change this after first login)`);
}
seedAdmin();

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'noah-arc-api' }));

app.use('/api/auth', authRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Serve the built React frontend (client/dist copied here as ../public at build time)
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
if (fs.existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
  });
}

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Noah Arc API listening on port ${PORT}`));
