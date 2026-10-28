# AlgoArena 🏟️

> **Real-Time Competitive Coding Platform** — Battle 1v1 with Elo matchmaking, compete in tournaments, practice on a rich problem set, and track your progress on a live dashboard. Built on Next.js 16 with a custom Socket.IO server, MongoDB, Clerk auth, and real Judge0 code execution.

---

## ✨ Feature Highlights

| Module | What it does |
|---|---|
| **1v1 Battle** | Real-time ranked matches via Socket.IO. Elo changes on win/loss. |
| **Tournaments** | Problem setters create timed contests. Dynamic point decay + wrong-answer penalties. Live leaderboard. |
| **Practice** | Full problem set (Easy/Medium/Hard) with Monaco editor, run & submit against hidden test cases. |
| **Dashboard** | Real rating history graph, win streak, solved-problem breakdown by difficulty. |
| **Leaderboard** | Global Elo ranking table, sorted by rating. |
| **Admin Panel** | Manage users (ban/unban, change roles), manage practice & arena problems, send global notifications. |
| **Notifications** | In-app notification dropdown. Admins can broadcast to all users. |
| **Auth** | Clerk-managed sign-up/sign-in with mandatory email verification. Role-based access (USER / PROBLEM_SETTER / ADMIN). |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4, custom glassmorphism design system |
| **Auth** | [Clerk](https://clerk.com) — social/email login, JWT sessions, webhooks, email verification |
| **Database** | [MongoDB](https://mongodb.com) + [Mongoose](https://mongoosejs.com) ODM |
| **Real-Time** | [Socket.IO](https://socket.io) on a custom Node.js HTTP server |
| **Matchmaking Queue** | [Redis](https://redis.io) via [ioredis](https://github.com/luin/ioredis) |
| **Code Execution** | [Judge0](https://judge0.com) (self-hosted via Docker or RapidAPI cloud) |
| **Code Editor** | [Monaco Editor](https://microsoft.github.io/monaco-editor/) |
| **Charts** | [Recharts](https://recharts.org) (lazy-loaded client-side to avoid SSR issues) |
| **Email** | [Resend](https://resend.com) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **State** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **Forms** | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| **Elo Engine** | Custom implementation in `lib/elo.ts` |

---

## 🚀 Local Setup

### Prerequisites

- Node.js 20+
- MongoDB instance (local or Atlas)
- Redis server (local or cloud)
- Judge0 (see below)
- A [Clerk](https://clerk.com) account (free tier works)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in your values — see `.env.example` for all required keys.

### 3. Seed the problem database

```bash
# Seeds basic practice problems into MongoDB
npx tsx scripts/seed.ts

# Seeds the full set of 30–40 problems (practice + arena)
npx tsx scripts/seed-problems.ts
```

### 4. Start Judge0 (code execution engine)

The project ships with a `judge0-local/` directory containing a ready-made `docker-compose.yml`:

```bash
cd judge0-local
docker-compose up -d
# Judge0 will be available at http://localhost:2358
```

Or use the RapidAPI cloud Judge0 endpoint — set `JUDGE0_API_URL` and `JUDGE0_API_KEY` accordingly in `.env`.

### 5. Run the dev server

```bash
npm run dev
```

This starts a **custom Node.js HTTP server** (`server.ts`) that bundles Next.js + Socket.IO on the same port (default `3000`).

> Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Admin & Roles

Users can have one of three roles: `USER` (default), `PROBLEM_SETTER`, `ADMIN`.

To promote a user to admin via the CLI:

```bash
# Edit scripts/make-admin.ts — change the filter to target a specific clerkId/email
npx tsx scripts/make-admin.ts
```

Alternatively, admins can change roles directly from the **Admin → Manage Users** panel in the app.

**Role capabilities:**
- `USER` — battle, practice, join tournaments
- `PROBLEM_SETTER` — all of the above + create/edit problems + create/manage tournaments
- `ADMIN` — full access including ban/unban users, send notifications, manage all content

---

## 📁 Project Structure

```
algoarena/
├── app/
│   ├── (app)/                  # Authenticated app shell
│   │   ├── admin/              # Admin panel (users, problems, notifications)
│   │   ├── battle/             # Matchmaking queue + live 1v1 battle room
│   │   ├── dashboard/          # Personal stats, rating graph, recent battles
│   │   ├── leaderboard/        # Global Elo ranking
│   │   ├── problems/           # Problem list + Monaco editor workspace
│   │   └── tournaments/        # Tournament list, detail, problem workspace, leaderboard
│   ├── api/
│   │   ├── admin/              # User management & notification endpoints
│   │   ├── battle/             # Matchmaking REST endpoints
│   │   ├── execute/            # Code submission → Judge0 → result + tournament scoring
│   │   ├── notifications/      # Notification fetch endpoint
│   │   ├── problems/           # Problem CRUD
│   │   ├── user/               # /api/user/me — current user profile
│   │   └── webhooks/           # Clerk webhook handler (user sync)
│   ├── sign-in/                # Clerk sign-in page
│   ├── sign-up/                # Clerk sign-up page (with email verification)
│   ├── layout.tsx              # Root layout with Clerk provider
│   └── page.tsx                # Landing page
├── components/
│   ├── GlobalNotifier.tsx      # Real-time in-app notifications (Socket.IO)
│   ├── NotificationDropdown.tsx
│   ├── navbar.tsx              # Responsive top nav with role-aware links
│   └── ui/                     # Badge, Button, shared UI primitives
├── lib/
│   ├── constants.ts            # LANGUAGES list, STARTER_CODE templates
│   ├── elo.ts                  # Elo rating calculation engine
│   ├── judge0.ts               # Judge0 API client + verdict mapping
│   ├── mail.ts                 # Resend email helper
│   ├── matchmaking.ts          # Redis-based matchmaking queue logic
│   ├── models.ts               # Mongoose schemas: User, Problem, Battle, Submission, Tournament, TournamentParticipant, Notification
│   ├── mongodb.ts              # Mongoose connection singleton
│   ├── redis.ts                # ioredis singleton with graceful fallback
│   ├── socket-server.ts        # Socket.IO server — battle events, matchmaking, notifications
│   ├── sync-user.ts            # Clerk → MongoDB user sync (getOrSyncUser)
│   └── utils.ts                # cn(), timeAgo(), getRankFromRating(), calculateWinRate(), formatRating()
├── scripts/
│   ├── seed.ts                 # Seeds basic problems into MongoDB
│   ├── seed-problems.ts        # Seeds the full 30–40 problem library
│   └── make-admin.ts           # CLI helper to promote a user to ADMIN
├── judge0-local/               # Docker Compose stack for self-hosted Judge0
├── server.ts                   # Custom HTTP server: Next.js + Socket.IO on one port
├── proxy.ts                    # Dev proxy helper (used internally)
├── .env.example                # All required environment variables documented
└── tailwind.config.ts          # Custom design tokens (dark palette, brand colors, glassmorphism)
```

---

## 🏗 Architecture

```
Browser
 └── Next.js App Router (React Server + Client Components)
      ├── Server Components  →  MongoDB queries via Mongoose (server-side only)
      ├── Client Components  →  UI interactivity, Recharts, Monaco Editor
      └── API Routes         →  REST endpoints under /api/

Real-Time Layer (same process as Next.js)
 ├── Socket.IO server  →  battle events, matchmaking signals, notifications
 └── Redis             →  matchmaking queue, pub/sub between users

Code Execution Pipeline
 └── POST /api/execute
      ├── Fetches problem + test cases from MongoDB
      ├── Sends code → Judge0 (self-hosted Docker or RapidAPI)
      ├── Receives verdict per test case
      ├── Stores Submission to MongoDB
      └── (If tournament) applies time-decay scoring + penalty logic
```

---

## 🎯 Tournament Scoring

Points for each problem decay linearly over the tournament duration:

```
score = maxScore × (1 − elapsed/duration × 0.70)
      − wrongAttempts × (maxScore × 0.10)
      (floor: 10% of maxScore)
```

- Compile errors do **not** count as wrong attempts
- `totalScore` is recalculated from scratch on every accept to prevent accumulation bugs
- Tiebreaker: fewer total wrong attempts wins

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Next.js + Socket.IO) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npx tsx scripts/seed.ts` | Seed basic problems |
| `npx tsx scripts/seed-problems.ts` | Seed full problem library |
| `npx tsx scripts/make-admin.ts` | Promote user(s) to ADMIN |
