# AI Coding Agent Instructions for T8D

Welcome to the T8D codebase! This document provides essential guidelines for AI coding agents to be productive in this project. Follow these instructions to understand the architecture, workflows, and conventions.

---

## 📂 Project Overview

T8D is an offline-first to-do list application with a focus on private task management. It is structured as a **pnpm monorepo** with two main components:

1. **Frontend** (`frontend/`):
   - Built with React, TypeScript, Vite, and Tailwind CSS.
   - Implements offline support using IndexedDB via the `idb` library.
   - Key files:
     - `src/components/`: React components (e.g., `TodoList.tsx`, `Sidebar.tsx`).
     - `src/utils/`: Utility modules for backup, database, and to-do logic.
     - `vite.config.ts`: Vite configuration.

2. **Backend** (`backend/`):
   - Node.js API server (currently stubbed or under development).

---

## 🛠️ Development Workflows

### Install Dependencies

```bash
pnpm install
```

### Start Development Servers

- Run both frontend and backend:
  ```bash
  pnpm run dev:all
  ```
- Or run individually:
  ```bash
  pnpm run frontend:dev
  pnpm run backend:dev
  ```

### Lint, Test, and Build

```bash
pnpm run lint
pnpm run test
pnpm run build
```

---

## 🧑‍💻 Project-Specific Conventions

### Branching Strategy

- **`main`**: Stable, production-ready releases.
- **`dev`**: Active development branch.
- Feature branches:
  - `feature/<name>` for new features.
  - `fix/<name>` for bug fixes.

### Commit Message Format

Use the following structure:

```
<type>(<scope>): <short summary>
```

Examples:

- `feat(auth): add social login support`
- `fix(todo): resolve crash on delete`

### Testing

- Tests are located in `frontend/tests/`.
- Use Vitest and Testing Library for unit and integration tests.
- Example test files:
  - `tests/components/sidebar.test.tsx`
  - `tests/utils/todo/todo.test.ts`

---

## 📚 Key Patterns and Practices

### Component Design

- Components are located in `frontend/src/components/`.
- Follow a modular structure with reusable hooks and context providers.
- Example: `ThemeContext.tsx` manages theme state globally.

### Utility Modules

- Utility functions are grouped by domain in `frontend/src/utils/`.
- Example: `utils/todo/todo.ts` contains core to-do logic.

### Offline Support

- IndexedDB is used for local storage via the `idb` library.
- Backup and restore logic is implemented in `utils/backup/backup.ts`.

---

## 🔗 Integration Points

### External Dependencies

- **Frontend**:
  - `idb`: IndexedDB wrapper for offline storage.
  - `vite-plugin-pwa`: Adds PWA support.
- **Backend**:
  - TBD (Node.js API server under development).

### Cross-Component Communication

- State management is handled via React Context and hooks.
- Example: `ThemeContext.tsx` for theme state.

---

## 🚨 Important Notes

- Always follow the branching and commit conventions outlined in `WORKFLOW.md`.
- Update `CHANGELOG.md` for any changes merged into `main`.
- Refer to `frontend/README.md` and `WORKFLOW.md` for additional details.

---

This guide is a living document. Update it as the project evolves to ensure clarity and consistency.
