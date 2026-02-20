# T8D Frontend

The React + TypeScript PWA that powers T8D's offline-first experience, real-time sync UI, and privacy-first task management.

## Table of Contents

1. [Highlights](#-highlights)
2. [Architecture](#-architecture)
3. [Project Layout](#-project-layout)
4. [Prerequisites](#-prerequisites)
5. [Quick Start](#-quick-start)
6. [Scripts](#-scripts)
7. [State, Data & Sync](#-state-data--sync)
8. [Styling & PWA](#-styling--pwa)
9. [Testing & Quality](#-testing--quality)
10. [Build & Deploy](#-build--deploy)
11. [Troubleshooting](#-troubleshooting)

## ✨ Highlights

- **Offline-first UX** backed by IndexedDB and background sync queues.
- **Optimistic UI + realtime** hooks that reconcile with the backend Socket.IO stream.
- **Installable PWA** with service worker precache, manifest, and `/T8D/` base path routing.
- **Data privacy**—everything stays local until you opt into sync or backups.
- **Keyboard-centric workflow** with quick add, shortcuts, and focus management.

## 🧱 Architecture

- **React 19 + TypeScript** functional components.
- **Context + hooks** for auth, sync, realtime, task list state, and theme.
- **Utility domains** (`utils/api`, `backup`, `database`, `todo`) keep side-effects isolated.
- **Granular components** (sidebar, modals, counters, forms) for composability.
- **Service worker** handles caching; IndexedDB persists task graphs.

## 📂 Project Layout

```
frontend/
├── src/
│   ├── components/          # UI building blocks (Sidebar, TodoList, etc.)
│   ├── context/             # Providers for auth, theme, realtime, sync, lists
│   ├── hooks/               # useTaskLists, useAuth, useSyncState, etc.
│   ├── models/              # Task & TaskList TypeScript types
│   ├── utils/               # API helpers, IndexedDB layer, backup flows
│   ├── assets/              # Static images/icons
│   └── main.tsx             # App bootstrap + providers
├── public/                  # Manifest, icons, robots, etc.
├── tests/                   # Vitest + Testing Library specs
├── tailwind.config.js       # Design tokens + safelist
├── vite.config.ts           # Vite + PWA + tsconfig paths
└── README.md                # This document
```

## ✅ Prerequisites

- Node.js 18+
- pnpm 8+
- Backend running (optional) for realtime sync; see `../backend/README.md` for details.

## 🚀 Quick Start

```bash
cd frontend
pnpm install
pnpm dev

# Open http://localhost:5173/T8D/
```

- The dev server proxies API calls to `http://localhost:3000` (adjust via `src/utils/api` if needed).
- For end-to-end Docker bring-up, follow the root `QUICKSTART.md` or `DOCKER.md`.

## 🛠 Scripts

```bash
pnpm dev            # Vite dev server with HMR
pnpm build          # Production build to dist/
pnpm preview        # Preview the production bundle
pnpm test           # Vitest + Testing Library
pnpm lint           # ESLint (see frontend/eslint.config.js)
pnpm format         # Prettier write
```

These commands run from `frontend/` or via workspace aliases: `pnpm --filter t8d <script>`.

## 🔄 State, Data & Sync

- **AuthContext + AuthProvider** manage JWT state pulled from backend auth routes.
- **TaskListProvider** stores the local task tree, backed by IndexedDB collections defined under `utils/database`.
- **SyncProvider / RealtimeProvider** queue offline writes, replay them when connectivity returns, and subscribe to Socket.IO events for live merges.
- **Backup utilities** allow exporting/importing JSON snapshots, giving users manual control over data portability.
- **API utilities** centralize fetch logic and gracefully degrade to offline mode when network requests fail.

## 🎨 Styling & PWA

- Tailwind CSS drives the utility-first design system (config in `tailwind.config.js`).
- Theme toggles via `ThemeProvider`, reading prefers-color-scheme and persisting to local storage.
- PWA configuration sits in `vite.config.ts` (via `vite-plugin-pwa`) with manifest + icons in `public/`.
- Service worker caches static assets and bootstraps offline shell; future enhancements (push, background sync) are flagged in TODO comments.

## 🧪 Testing & Quality

```bash
pnpm test            # Unit + component tests (Vitest + RTL)
pnpm test --ui       # Optional watch/UI mode
pnpm lint            # ESLint (React hooks, accessibility, imports)
pnpm format:check    # Ensure formatting
pnpm check           # Run from repo root for lint + format + type + tests
```

- Frontend tests live in `frontend/tests` mirroring the `src` structure (`components`, `utils/backup`, etc.).
- `tests/setup/setup.ts` configures the DOM environment, fake IndexedDB, and global mocks.

## 🚢 Build & Deploy

```bash
pnpm build          # Generates dist/ with hashed assets
pnpm preview        # Serves dist/ for smoke checks
```

- The Docker frontend image (see `../frontend/Dockerfile`) runs `pnpm build` and copies artifacts into Nginx served under `/T8D/`.
- When hosting separately, ensure your web server rewrites all SPA routes to `/T8D/index.html` and serves correct `Content-Type` headers.

## 🩹 Troubleshooting

| Issue                       | Fix                                                                                 |
| --------------------------- | ----------------------------------------------------------------------------------- |
| Dev server port conflict    | `pnpm dev -- --port 5174` or edit `vite.config.ts`                                  |
| API calls fail offline      | Expected—writes queue locally; inspect Sync panel or `useSyncState` hook for status |
| Service worker not updating | Clear site data or run `pnpm vite build --force` to invalidate caches               |
| IndexedDB errors in tests   | Ensure `fake-indexeddb/auto` is imported in `tests/setup/setup.ts`                  |

Need the big picture? Jump back to the root [`README.md`](../README.md) or `../QUICKSTART.md` for end-to-end onboarding, and pair this document with `../backend/README.md` when developing full-stack features.
