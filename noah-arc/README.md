# Noah Arc — Creative Networking Platform

A full-stack web app connecting African creatives (designers, photographers,
videographers, artists, musicians) with clients and job opportunities.
Built to match the attached SRS: portfolios, job board, bookings, direct
messaging, reviews, and an admin moderation panel.

## Stack

- **Backend:** Node.js, Express, SQLite (`better-sqlite3`), JWT auth, bcrypt — `/server`
- **Frontend:** React 18, Vite, React Router — `/client`
- In production the backend serves the built frontend as static files, so the
  whole app is **one deployable service with one public URL**.

## Features (mapped to the SRS)

| SRS requirement | Where it lives |
|---|---|
| User registration / login (creative, client, admin) | `/server/src/routes/auth.js`, `Login.jsx`, `Signup.jsx` |
| Portfolio uploads | `/server/src/routes/portfolios.js`, `MyPortfolio.jsx` |
| Browse / search creatives | `Browse.jsx`, `CreativeProfile.jsx` |
| Job posting & applications | `/server/src/routes/jobs.js`, `PostJob.jsx`, `JobBoard.jsx`, `MyJobs.jsx`, `MyApplications.jsx` |
| Booking system | `/server/src/routes/bookings.js`, `Bookings.jsx` |
| Messaging | `/server/src/routes/messages.js`, `Messages.jsx` |
| Ratings & reviews | `/server/src/routes/reviews.js` |
| Admin: manage users, moderate content | `/server/src/routes/admin.js`, `Admin.jsx` |

## Run it locally

You'll need [Node.js 18+](https://nodejs.org) installed.

```bash
# 1. Install dependencies for both server and client
npm run install:all

# 2. Start the backend API (port 5000)
npm run dev:server

# 3. In a second terminal, start the frontend (port 5173, proxies /api to the backend)
npm run dev:client
```

Open **https://noah-arc-3.onrender.com** in your browser.

On first boot, the server automatically creates an admin account:

- Email: `admin@noaharc.africa`
- Password: `ChangeMe123!`

Log in at `/login` with those credentials to reach `/admin`. **Change this
password** (or set `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars before first boot —
see `server/.env.example`).

## Building for production (single service)

From the project root:

```bash
npm run build   # builds the React app and copies it into server/public
npm start       # builds (if needed) then starts the Express server, which now serves the UI too
```

The whole app is now available at whatever port the server runs on — no
separate frontend host required.

## Deploying to get a public URL

The simplest path is **Render** (free tier, no credit card needed for a basic web service):

1. Push this project to a **public GitHub repository**.
2. Go to [render.com](https://render.com) → **New** → **Web Service** → connect your GitHub repo.
3. Configure:
   - **Build Command:** `npm run install:all && npm run build`
   - **Start Command:** `npm start --prefix server`
   - **Environment variables:** add `JWT_SECRET` (any long random string), and
     optionally `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
4. Deploy. Render gives you a public URL like `https://noah-arc.onrender.com` —
   that's your submission link.

**Alternative (Railway):** same idea — connect the GitHub repo, set the build
command to `npm run install:all && npm run build`, the start command to
`npm start --prefix server`, add the same environment variables, and deploy.
Railway also gives you a public URL.

> Note on the database: this project uses SQLite, a file on disk
> (`server/data/noah-arc.db`). Render's and Railway's free web services use
> **ephemeral disks** — data can be wiped on redeploy/restart. That's fine for
> a class demo. If you need data to persist long-term, either add a paid
> persistent disk on your host, or swap `better-sqlite3` for a hosted
> Postgres database (e.g. Render Postgres, Supabase, Neon) — the SQL in
> `server/src/db/init.js` is close to standard SQL and a good starting point
> for that migration.

## Project structure

```
noah-arc/
├── server/                # Express API (+ serves built frontend in production)
│   ├── src/
│   │   ├── db/init.js     # SQLite schema
│   │   ├── middleware/auth.js
│   │   ├── routes/        # auth, portfolios, jobs, bookings, messages, reviews, admin
│   │   └── index.js       # app entry point
│   └── .env.example
├── client/                # React (Vite) frontend
│   └── src/
│       ├── pages/         # one file per screen
│       ├── components/    # Layout, route guards
│       ├── api/client.js  # fetch wrapper with JWT handling
│       └── styles/theme.css
├── scripts/copy-frontend.js
└── package.json           # root convenience scripts
```

## Demo accounts for your presentation video

Create one creative account and one client account through `/signup` before
recording, so you can demo: portfolio upload → browse/search → job posting →
apply → accept application → booking → messaging → review → admin moderation.
The seeded admin account above covers the admin side.

## Known limitations / honest notes for your writeup

- Portfolio images are added by URL (paste a link) rather than direct file
  upload, to keep deployment simple with no cloud storage dependency.
- Payments are out of scope for this build (the SRS lists local payment
  support as a unique feature aspiration, not a functional requirement).
- SQLite is used for simplicity; see the note above on persistence if you
  need the database to survive redeploys.
