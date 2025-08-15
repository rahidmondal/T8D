# T8D Frontend

This is the React + TypeScript client for T8D, built with Vite and Tailwind CSS.

## 🛠️ Tech Stack

- **React** (with hooks)
- **TypeScript**
- **Vite** (fast dev/build)
- **Tailwind CSS** (utility-first styling)
- **PWA** (offline support)
- **IndexedDB** (local storage via `idb`)
- **Testing:** Vitest, Testing Library

## 🚀 Features

- Offline-first to-do management
- Responsive, modern UI
- Fast hot-reload development
- ESLint & Prettier integration
- PWA installable on desktop/mobile

## 📦 Directory Structure

```
frontend/
├── src/         # App source code
├── public/      # Static assets
├── tests/       # Unit/integration tests
├── index.html   # Entry point
├── vite.config.ts
└── ...
```

## 🧑‍💻 Development

1. **Install dependencies:**
   ```sh
   pnpm install
   ```
2. **Start dev server:**
   ```sh
   pnpm run dev
   ```
3. **Build for production:**
   ```sh
   pnpm run build
   ```
4. **Preview production build:**
   ```sh
   pnpm run preview
   ```

## 🧪 Testing & Linting

- **Run tests:**
  ```sh
  pnpm run test
  ```
- **Lint code:**
  ```sh
  pnpm run lint
  ```
- **Format code:**
  ```sh
  pnpm run format
  ```
