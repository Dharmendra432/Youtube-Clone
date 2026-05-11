# YouTube Clone (MERN)

A full-stack **YouTube-style** video platform built for a capstone-style MERN assignment: **MongoDB**, **Express** (ES modules), **React** (Vite), and **Node.js**, with **JWT** authentication and REST APIs for users, channels, videos, and comments.

---

## What this project includes

| Area | Stack |
|------|--------|
| **Frontend** | React 19, Vite 8, React Router, Axios |
| **Backend** | Node.js, Express 4, Mongoose, JWT, bcrypt, express-validator |
| **Database** | MongoDB (Atlas or local) |

The UI mimics a familiar YouTube layout: top bar (logo, search, sign-in / profile), left navigation, category chips, and a responsive video grid. The watch page supports **direct video file URLs** (`.mp4`, `.webm`) and **YouTube links** (embedded player).

---

## Repository layout

```
Youtube/
├── client/                 # Vite + React SPA
│   ├── src/
│   │   ├── api/            # Axios instance
│   │   ├── components/   # Header, Sidebar, Layout, VideoCard, …
│   │   ├── context/      # Auth (JWT in localStorage)
│   │   ├── pages/        # Home, Watch, Login, Register, Channel, My Channel
│   │   └── utils/        # Helpers (e.g. YouTube URL parsing)
│   ├── vite.config.js    # Dev proxy: /api → backend
│   └── .env.example
├── server/                 # Express API
│   ├── src/
│   │   ├── config/       # DB connection
│   │   ├── models/       # User, Channel, Video, Comment
│   │   ├── routes/       # auth, videos, channels
│   │   ├── middleware/   # JWT auth
│   │   ├── index.js      # App entry + routes
│   │   └── seed.js       # Sample users, channels, videos
│   └── .env.example
├── requirement.md          # Original assignment notes (if present)
└── README.md
```

---

## Prerequisites

- **Node.js** 18 or newer  
- **MongoDB** — local install, Docker, or [MongoDB Atlas](https://www.mongodb.com/atlas)  
- Two terminal windows (or tabs) for **API** + **client** during development  

---

## Quick start (development)

### 1. Backend

```bash
cd server
cp .env.example .env
```

Edit **`server/.env`**:

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | Connection string, e.g. `mongodb://127.0.0.1:27017/youtube-clone` |
| `JWT_SECRET` | Long random string used to sign tokens |
| `PORT` | API port (default **5000**) |
| `CLIENT_ORIGIN` | Allowed browser origin for CORS (default `http://localhost:5173`) |

Install dependencies, seed the database, then start the API:

```bash
npm install
npm run seed
npm run dev
```

- **`npm run dev`** — runs the server with **`node --watch`** (restarts on file changes).  
- **`npm start`** — runs once without watch (good for demos).  

You should see: `MongoDB connected` and `API listening on http://localhost:5000`.

Health check:

```bash
curl http://localhost:5000/api/health
```

Expected: `{"ok":true}`

### 2. Frontend

In a **second** terminal:

```bash
cd client
npm install
npm run dev
```

Open the URL Vite prints (usually **`http://localhost:5173/`**).  
The Vite dev server **proxies** requests from `/api` to **`http://localhost:5000`**, so you normally do **not** need `VITE_API_URL` locally.

**Optional:** If the API runs elsewhere, create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

(Leave empty to use same-origin `/api` with the proxy.)

---

## Seed data and demo accounts

`npm run seed` in **`server/`** clears and repopulates:

- Users, channels, sample videos, and at least one sample comment.

**Demo login (after seed):**

- Email: **`john@example.com`**  
- Password: **`password123`**

(Jane’s account is also seeded; see `server/src/seed.js` for emails.)

Re-run **`npm run seed`** whenever you want a clean database (this **wipes** existing app data in those collections).

---

## Features (how to use the app)

### Home

- **Search** — header search filters videos by **title** (query sent to the API).  
- **Category chips** — at least six categories plus **All**; filters by `category` stored on each video. Categories also load from **`GET /api/meta/categories`** when the API is available.  
- **Video grid** — thumbnails, duration, channel name, views, responsive columns.  
- **Sidebar** — Home, Shorts/Subscriptions placeholders, Explore-style links; signed-in users see “Your channel” and related entries.  
- **Hamburger** — toggles sidebar width (full vs icon-only on desktop; drawer on small screens).

### Authentication

- **`/register`** — username, email, password (validated server-side). On success you are redirected to **login**.  
- **`/login`** — email + password; JWT stored in **`localStorage`** and sent as `Authorization: Bearer <token>`.  
- **`/api/auth/me`** — used on load to restore the session.  
- Header shows **Sign in** when logged out, or **avatar / username** and **Sign out** when logged in.

### Watch (`/watch/:id`)

- **Video** — if `videoUrl` is a **YouTube** watch / shorts / youtu.be link, an **iframe embed** is used. If it looks like a **direct** `.mp4` / `.webm` URL, the HTML5 **`<video>`** element is used.  
- **Views** — incremented when the watch page loads (via API).  
- **Likes / dislikes** — require sign-in; toggles and persists per user.  
- **Comments** — list, add; **edit / delete** only for the comment author.

### Channels

- **`/my-channel`** (protected) — create a channel; list links to your channels.  
- **`/channel/:id`** — public channel banner, description, subscriber count, and video list.  
- **Owner only** — upload form (title, description, video URL, thumbnail URL, category, duration), **edit** and **delete** videos. Use **“Use dummy URL”** on the upload form for a working sample MP4, or paste a **direct** file URL / **YouTube** link as described above.

---

## API reference (summary)

Base URL in dev (via proxy): **`/api`**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create user |
| POST | `/api/auth/login` | No | Returns JWT + user |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/videos` | Optional | List videos; query: `search`, `category` |
| GET | `/api/videos/:id` | Optional | Single video (+ view increment) |
| POST | `/api/videos` | Yes | Create video (body includes `channelId`) |
| PUT | `/api/videos/:id` | Yes | Update own video |
| DELETE | `/api/videos/:id` | Yes | Delete own video |
| POST | `/api/videos/:id/reaction` | Yes | Body: `{ "type": "like" \| "dislike" \| "none" }` |
| GET | `/api/videos/:videoId/comments` | No | List comments |
| POST | `/api/videos/:videoId/comments` | Yes | Add comment |
| PUT | `/api/videos/:videoId/comments/:commentId` | Yes | Edit own comment |
| DELETE | `/api/videos/:videoId/comments/:commentId` | Yes | Delete own comment |
| POST | `/api/channels` | Yes | Create channel |
| GET | `/api/channels/mine` | Yes | List my channels |
| GET | `/api/channels/:id` | No | Channel + videos |
| PUT | `/api/channels/:id` | Yes | Update own channel |
| GET | `/api/meta/categories` | No | `["All", ...distinct categories]` |
| GET | `/api/health` | No | `{ "ok": true }` |

---

## Production build (frontend)

```bash
cd client
npm run build
```

Static output is in **`client/dist/`**. Serve it with any static file host (nginx, Netlify, Vercel, etc.).

**Important:** Set the backend **`CLIENT_ORIGIN`** to your real frontend origin (scheme + host + port if any), and ensure the production frontend calls the API (same host reverse-proxy, or `VITE_API_URL` set at **build** time if you use a separate API domain).

---

## Troubleshooting

| Symptom | Likely cause | What to try |
|---------|----------------|-------------|
| Vite **`ECONNREFUSED`** on `/api/...` | API not running or wrong port | Start `server` first; confirm `http://localhost:5000/api/health` |
| **`CORS`** errors | `CLIENT_ORIGIN` mismatch | Set `CLIENT_ORIGIN` in `server/.env` to the exact Vite URL (e.g. `http://localhost:5173`) |
| **`Missing MONGODB_URI` / `JWT_SECRET`** | `.env` missing or incomplete | Copy `server/.env.example` → `.env` and fill values |
| Mongo **connection refused** | MongoDB not running / wrong URI | Start local Mongo or fix Atlas string + IP allowlist |
| Video **does not play** | Non-direct URL in `<video>` | Use a direct `.mp4`/`.webm` link, or a **YouTube** URL for embed mode |
| Empty home after seed | Wrong DB / seed not run | Run `npm run seed` from **`server/`** against the same `MONGODB_URI` |

---

## Scripts cheat sheet

| Location | Command | Purpose |
|----------|---------|---------|
| `server/` | `npm install` | Install dependencies |
| `server/` | `npm run seed` | Reset + seed MongoDB |
| `server/` | `npm run dev` | API with auto-restart |
| `server/` | `npm start` | API without watch |
| `client/` | `npm install` | Install dependencies |
| `client/` | `npm run dev` | Vite dev server |
| `client/` | `npm run build` | Production bundle |
| `client/` | `npm run preview` | Preview production build locally |

---

