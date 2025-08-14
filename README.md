# T8D

T8D is an offline-first to-do list application focused on private task management.

## 🚀 Features

- Offline-first: Manage tasks without internet connectivity
- Private task management
- Modern UI with React + Tailwind CSS

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, PWA support
- ~~**Backend:** Node.js (see [`backend`](backend/)), TypeScript~~
- **Build Tool:** pnpm (monorepo)
- **Linting & Formatting:** ESLint, Prettier
- **Testing:** Vitest, Testing Library
- **Deployment:** Docker\*, GitHub Pages (frontend)

## 📦 Monorepo Structure

```
/
├── backend/      # Backend API & sync server
├── frontend/     # React client app
├── WORKFLOW.md   # Team workflow, branching, commit, release guide
├── package.json  # Monorepo scripts
└── ...
```

## 🧑‍💻 Development Workflow

See [`WORKFLOW.md`](WORKFLOW.md) for:

- Branch naming conventions
- Commit message format
- Release & changelog process
- PR checklist

## 📄 Getting Started

1. **Install dependencies:**
   ```sh
   pnpm install
   ```
2. **Start development servers:**

   ```sh
   pnpm run dev:all
   ```

   - Or run frontend/backend individually:
     ```sh
     pnpm run frontend:dev
     pnpm run backend:dev
     ```

3. **Lint, test, and build:**
   ```sh
   pnpm run lint
   pnpm run test
   pnpm run build
   ```

## 📚 Documentation

- Frontend: [frontend/README.md](frontend/README.md)
- Backend: See [`backend`](backend/)
- Workflow: [`WORKFLOW.md`](WORKFLOW.md)
