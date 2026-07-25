// Copies client/dist -> server/public so the Express server can serve the
// built React app as static files. This lets the whole platform (API + UI)
// deploy as a single service with a single public URL.
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'client', 'dist');
const dest = path.join(__dirname, '..', 'server', 'public');

if (!fs.existsSync(src)) {
  console.error('client/dist not found — run "npm run build --prefix client" first.');
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log(`Copied ${src} -> ${dest}`);
