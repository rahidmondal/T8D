# T8D Backend (Sync Server)

The backend powers T8D's secure sync, auth, and realtime features. It exposes REST + Socket.IO endpoints backed by PostgreSQL/Prisma and is packaged for both pnpm workspaces and Docker deployments.

## Table of Contents

1. [Overview](#overview)
2. [Stack & Capabilities](#stack--capabilities)
3. [Directory Layout](#directory-layout)
4. [Scripts](#scripts)
5. [Environment Variables](#environment-variables)
6. [Local Setup (TL;DR)](#local-setup-tldr)
7. [Running & Hot Reload](#running--hot-reload)
8. [Database & Prisma](#database--prisma)
9. [Testing & Quality](#testing--quality)
10. [Docker & Deployments](#docker--deployments)
11. [Reference Docs](#reference-docs)

## Overview

- Package name: `t8d-sync-server`
- Runtime: Node 20 (ESM)
- Framework: Express 5 with modular routers for auth, sync, and realtime channels
- Storage: PostgreSQL via Prisma ORM
- Distribution: `tsup` bundles to `dist/app.js` and Docker image ships with an entrypoint that auto-runs migrations before booting

## Stack & Capabilities

- **Auth**: Passport + JWT with bcrypt password hashing and zxcvbn strength checks
- **Sync**: `/api/v1/sync` endpoints merge task lists + tasks and broadcast via Socket.IO
- **Validation**: Zod schemas guard every payload
- **Realtime**: Socket.IO namespace handles broadcast + presence for task events
- **Safety**: Centralized error handler, AppError helper, rate-limited CORS origins from env

## Directory Layout

```
backend/
├── src/
│   ├── routes/          # Auth, user, sync routers
│   ├── auth/            # Passport strategy + controllers
│   ├── realtime/        # Socket.IO bootstrap + middleware
│   ├── middleware/      # Error handling, CORS
│   ├── db/              # Prisma client wrapper + queries
│   └── utils/           # AppError, helpers
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Generated SQL migrations
├── tests/               # Vitest suites (routes + utils)
├── Dockerfile           # Multi-stage build
├── docker-entrypoint.sh # Applies migrations on container boot
├── README.md            # This overview
└── SETUP.md             # In-depth guide (installation, prod hardening)
```

## Scripts

| Script                   | Description                                      |
| ------------------------ | ------------------------------------------------ |
| `pnpm dev`               | Run the server in watch mode with `tsx`          |
| `pnpm build`             | Bundle TypeScript using `tsup`                   |
| `pnpm start`             | Launch the compiled build (`dist/app.js`)        |
| `pnpm test`              | Execute Vitest suites                            |
| `pnpm lint` / `lint:fix` | ESLint checks (optionally fixing issues)         |
| `pnpm type-check`        | TypeScript project references with no emit       |
| `pnpm prisma:*`          | Prisma helpers (`generate`, `migrate`, `studio`) |

## Environment Variables

Set these inside `backend/.env` (copy from `.env.example`).

| Variable          | Purpose                        | Example                                                          |
| ----------------- | ------------------------------ | ---------------------------------------------------------------- |
| `DATABASE_URL`    | Prisma connection string       | `postgresql://t8d_user:pass@localhost:5432/t8d_db?schema=public` |
| `JWT_SECRET`      | Signing key for auth tokens    | `openssl rand -base64 32`                                        |
| `SERVER_PORT`     | HTTP port (defaults to 3000)   | `3000`                                                           |
| `NODE_ENV`        | `development` or `production`  | `development`                                                    |
| `ALLOWED_ORIGINS` | Comma-delimited CORS allowlist | `http://localhost:5173,http://localhost:8080`                    |

Additional DB-specific variables (host, port, etc.) can be used if you prefer discrete values over the unified `DATABASE_URL`. See `backend/SETUP.md` for advanced configuration.

## Local Setup (TL;DR)

```bash
# run from repo root
pnpm install
cd backend
cp .env.example .env
# edit DATABASE_URL, JWT_SECRET, ALLOWED_ORIGINS
pnpm prisma migrate deploy   # create tables
pnpm prisma generate         # sync Prisma client
pnpm dev                     # start watch server on :3000
```

API base: http://localhost:3000/api/v1/

## Running & Hot Reload

- `pnpm dev` leverages `tsx watch` for instant restarts.
- `pnpm build && pnpm start` mimics the production Docker container.
- Need both apps simultaneously? From repo root run `pnpm run dev` which orchestrates frontend + backend.

## Database & Prisma

- Apply schema changes: `pnpm prisma migrate dev` (development) or `pnpm prisma migrate deploy` (production/CI).
- Regenerate client after schema edits: `pnpm prisma generate`.
- Explore data safely: `pnpm prisma studio`.
- **Docker note**: `docker-entrypoint.sh` automatically runs `pnpm dlx prisma migrate deploy` every time the container starts, so new migrations apply without manual steps. Check `docker compose logs -f backend` for `[entrypoint]` messages.

## Testing & Quality

```bash
pnpm test         # Vitest suites
pnpm lint         # ESLint health
pnpm type-check   # Strict TS validation
pnpm format       # Prettier write
pnpm check        # Run from repo root to execute lint + format + type-check + tests
```

Route tests rely on `vitest` + `supertest`; see `tests/routes/*.spec.ts` for examples. Shared test helpers live under `tests/setup`.

## Docker & Deployments

- Backend image lives in `backend/Dockerfile` (Node 20-alpine base, pnpm install, Prisma generate, entrypoint for migrations).
- Compose service name: `backend` listening on port `3000` (mapped from container `3000`).
- The service depends on `postgres` and reads env vars defined in the project-level `.env` file consumed by `docker-compose.yaml`.
- Production guidance (reverse proxies, secrets, health checks, backups) is detailed in [`../DOCKER.md`](../DOCKER.md) and the backend [SETUP](SETUP.md) guide.

## Reference Docs

- [`SETUP.md`](SETUP.md) – exhaustive backend installation, database provisioning, production hardening, and troubleshooting.
- [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md) – endpoint reference for auth, sync, and user flows.
- [`../DOCKER.md`](../DOCKER.md) – containerized workflows (dev + prod) with auto-migration details.
- [`../QUICKSTART.md`](../QUICKSTART.md) – repo-wide onboarding paths.

Need more? Reach out via GitHub Issues or Discussions referenced in the root `README.md`.
