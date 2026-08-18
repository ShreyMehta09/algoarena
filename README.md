# AlgoArena 🏟️

> **Real-Time Competitive Coding Platform** — Battle coders 1v1 with Elo-based matchmaking, Monaco editor, automated judging, and live leaderboards.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and populate your local credentials.
3. Run `npx prisma generate` and `npx prisma db push`.
4. Start the app with `npm run dev`.

## Product Notes

- Focus on a clean ranked match flow and strong competitive feel before expanding deeper features.
- Prioritize trust, speed, and fair matchmaking in every arena interaction.
- Build a polished demo experience that makes the product feel real without overcommitting on backend complexity.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React, Tailwind CSS, TypeScript |
| Backend | Next.js API Routes, Node.js/Express scaffold |
| Database | PostgreSQL / SQLite + Prisma ORM |
| Auth | NextAuth v5 + bcrypt |
| Editor | Monaco Editor |
| Real-Time | Socket.IO |
| Code Execution | Judge0 API (simulated in dev) |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Animations | Framer Motion |

---

## Features (30% Demo)

- ✅ Landing page with animated hero, features grid, and live stats
- ✅ Auth pages (Login / Register) with OAuth stubs
- ✅ Dashboard with Elo card, rating chart, battle history
- ✅ Problem set with search, filters, and status tracking
- ✅ Problem detail with Monaco Editor (8 languages, run/submit)
- ✅ Battle matchmaking with animated queue search
- ✅ Live battle (split-screen, timer, opponent progress, judge results)
- ✅ Leaderboard with podium, ranked table, streak indicators
- ✅ REST API routes (execute, problems, battle)
- ✅ Prisma schema (User, Problem, Battle, Submission)
- ✅ Database seed with demo data

## Current Demo Status

This build is structured as a polished product demo for a competitive coding platform. The experience focuses on onboarding, battle flow, and a realistic gameplay feel, while the backend execution and matchmaking pieces are intentionally scaffolded for demonstration and future integration.

## Quick Start Notes

Use the demo login flow to explore the product experience quickly. The seeded user is designed to let you test ranking, battles, and profile states without needing a full authentication backend.

## Planned Experience

The next milestones include richer matchmaking logic, persistent competitive sessions, and a more complete coding evaluation pipeline with real-time tournament feedback.

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

### 3. Set up database

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo login:** any email + password (auth is stubbed for demo)

---

## Project Structure

```
algoarena/
├── app/
│   ├── (auth)/           # Login, Register pages
│   ├── (app)/            # Authenticated app pages
│   │   ├── dashboard/    # User dashboard
│   │   ├── problems/     # Problem list + detail with Monaco
│   │   ├── battle/       # Matchmaking + live battle
│   │   └── leaderboard/  # Global leaderboard
│   └── api/
│       ├── execute/      # Code execution endpoint
│       ├── problems/     # Problems REST API
│       └── battle/       # Battle matchmaking API
├── components/
│   ├── navbar.tsx
│   └── ui/               # Badge, Button, etc.
├── lib/
│   ├── utils.ts          # Helpers
│   └── mock-data.ts      # Demo data
└── prisma/
    ├── schema.prisma     # DB schema
    └── seed.ts           # Seed data
```

---

## Architecture Overview

```
Client (Next.js App Router)
├── Server Components → DB queries via Prisma
├── Client Components → UI interactivity
└── API Routes → REST endpoints

Real-Time Layer (planned)
├── Socket.IO server (Express)
├── Redis pub/sub (matchmaking queue)
└── Live battle events

Code Execution (planned)
├── Judge0 API (cloud) or
└── Docker sandbox (self-hosted)
```

---

## Roadmap (Remaining 70%)

- [ ] Full NextAuth integration (JWT sessions, OAuth)
- [ ] Real Socket.IO matchmaking + live battle sync
- [ ] Judge0 API integration for real code execution
- [ ] Redis-based matchmaking queue
- [ ] Full Elo calculation engine
- [ ] User profile pages
- [ ] Battle replay system
- [ ] Admin panel for problem management
- [ ] Email notifications
- [ ] Mobile-responsive battle layout
