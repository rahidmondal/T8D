# T8D

Modern, privacy-first task management that stays fast offline, syncs instantly online, and ships as a progressive web app powered by React, Express, and PostgreSQL.

## Table of Contents

1. [Highlights](#-highlights)
2. [Quick Start](#-quick-start)
3. [Project Overview](#-project-overview)
4. [Development](#-development)
5. [Docker in 60 Seconds](#-docker-in-60-seconds)
6. [Documentation Map](#-documentation-map)
7. [Quality Toolkit](#-quality-toolkit)
8. [Tech Stack](#-tech-stack)
9. [Contributing & Support](#-contributing--support)
10. [License](#-license)

## ✨ Highlights

- **Offline-first core** keeps tasks available even when the network drops.
- **Real-time sync** merges changes across devices through the Express + Prisma backend.
- **Installable PWA** delivers native-like behavior on desktop and mobile.
- **Hierarchical lists** with subtasks, list-level views, and quick counters.
- **Privacy & security** via JWT auth, bcrypt hashing, scoped CORS, and per-user data.

## 🚀 Quick Start

Pick the flow that matches your goal—full instructions live in [QUICKSTART.md](QUICKSTART.md).

### Option A – Docker (fastest full stack)

```bash
git clone https://github.com/rahidmondal/T8D.git
cd T8D
cp .env.example .env  # set JWT + DB secrets
docker compose up --build -d
docker compose logs -f backend  # Prisma migrations run automatically
```

- Frontend: http://localhost:8080/T8D/
- Backend API: http://localhost:3000/api/v1/
- Health: http://localhost:3000/health

### Option B – Local development

```bash
git clone https://github.com/rahidmondal/T8D.git
cd T8D
pnpm install
cd backend && cp .env.example .env && pnpm prisma migrate deploy && cd ..
pnpm run dev  # runs backend + frontend together
```

- Frontend Dev Server: http://localhost:5173/T8D/
- Backend Dev API: http://localhost:3000/api/v1/

## 🧭 Project Overview

T8D is a pnpm workspace with isolated frontend/backend packages and shared automation scripts.

```
T8D/
├── backend/                  # Express sync server (Prisma, Socket.IO)
│   ├── src/                  # API routes, middleware, realtime
│   ├── prisma/               # Schema + migrations
│   ├── tests/                # Vitest suites
│   ├── README.md             # Backend overview
│   └── SETUP.md              # Deep-dive setup & deployment
├── frontend/                 # React PWA client
│   ├── src/                  # Components, hooks, contexts
│   └── README.md             # Frontend-specific notes
├── docker-compose.yaml       # Postgres + backend + frontend stack
├── DOCKER.md                 # Full container guide
├── QUICKSTART.md             # Step-by-step onboarding
├── WORKFLOW.md               # Branching & release process
├── CONTRIBUTING.md           # Contribution guidelines
└── package.json              # Monorepo scripts
```

## 🛠 Development

- **Requirements**: Node.js 18+, pnpm 8+, PostgreSQL 14+ (or Docker), Git.
- **Environment**: copy `backend/.env.example` to `.env`, set `DATABASE_URL`, `JWT_SECRET`, and `ALLOWED_ORIGINS`.
- **Run everything**: `pnpm run dev` spins up both apps concurrently.
- **Run individually**: `pnpm run frontend:dev` and `pnpm run backend:dev`.
- **Database**: apply Prisma migrations with `pnpm --filter t8d-sync-server prisma migrate deploy` and inspect tables via `pnpm --filter t8d-sync-server prisma studio`.
- **Testing**: `pnpm test` (all), or scope with `pnpm frontend:test` / `pnpm backend:test`.

Need the detailed backend workflow? Check `backend/README.md` (overview) and `backend/SETUP.md` (deep guide).

## 🐳 Docker in 60 Seconds

- Compose file launches PostgreSQL 16, the backend (Node 20 + Prisma), and an Nginx-served React build.
- `backend/docker-entrypoint.sh` automatically runs `pnpm dlx prisma migrate deploy` so new migrations apply on each boot.
- Health checks are wired into Postgres; restart order is already managed through `depends_on`.
- Use `docker compose logs -f backend` to watch `[entrypoint]` messages confirming migration status.
- Extended instructions (backups, production overlays, troubleshooting) live in [DOCKER.md](DOCKER.md).

## 📑 Documentation Map

- `QUICKSTART.md` – newcomer-friendly setup paths (Docker, local, frontend-only).
- `DOCKER.md` – production-minded container usage, health checks, backups.
- `backend/README.md` – backend architecture, scripts, environment, and testing.
- `backend/SETUP.md` – exhaustive backend walkthrough, deployment patterns, and troubleshooting.
- `frontend/README.md` – UI architecture, available scripts, and styling conventions.
- `backend/API_DOCUMENTATION.md` – REST + realtime reference.
- `WORKFLOW.md` / `CONTRIBUTING.md` – collaboration, branching, review checklists.

## 🧪 Quality Toolkit

```bash
pnpm run lint           # ESLint across packages
pnpm run test           # Vitest suites (frontend + backend)
pnpm run coverage       # Coverage via Vitest V8
pnpm run type-check     # TypeScript project references
pnpm run format         # Prettier write
pnpm run format:check   # Prettier verify
pnpm run check          # Lint + format:check + type-check + test
```

Package-scoped aliases exist (`frontend:dev`, `backend:test`, etc.)—see `package.json` for the full matrix.

## 🧱 Tech Stack

| Layer    | Technologies                                                                                       |
| -------- | -------------------------------------------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Context, IndexedDB (idb), Vitest + Testing Library |
| Backend  | Node 20, Express 5, Prisma ORM, PostgreSQL, Passport + JWT, Socket.IO, Zod validation              |
| DevOps   | pnpm workspaces, Docker/Compose, ESLint, Prettier, GitHub Actions (planned)                        |

## 🤝 Contributing & Support

- Start with `CONTRIBUTING.md` + `WORKFLOW.md` for coding standards, branching, and review expectations.
- Run `pnpm run check` before opening any PR against `improvement/general-fix-and-refactor` or `dev`.
- Issues: [GitHub Issues](https://github.com/rahidmondal/T8D/issues)
- Discussions: [GitHub Discussions](https://github.com/rahidmondal/T8D/discussions)

If the project helps you, star the repo, open issues, or send PRs—every bit keeps the sync server and PWA sharp.

## 📄 License

Released under the MIT License. See [`LICENSE`](LICENSE) for full terms.

---

Made with ❤️ by the T8D team.
