# T8D Frontend

The React + TypeScript client application for T8D - an offline-first, private to-do list manager with modern UI and PWA capabilities.

## ✨ Features

### Core Functionality

- **Offline-First Architecture:** Full functionality without internet connectivity
- **Private Task Management:** All data stored locally on your device
- **Progressive Web App:** Installable on desktop and mobile devices
- **Real-time Updates:** Instant UI updates with optimistic rendering

### Task Management

- Create, edit, and delete tasks
- Organize tasks into custom lists
- Subtask support with nested hierarchy
- Task completion tracking
- Quick task creation with keyboard shortcuts

### User Experience

- **Responsive Design:** Works seamlessly on all screen sizes
- **Dark/Light Theme:** Automatic theme switching based on system preference
- **Fast Performance:** Built with Vite for lightning-fast development and builds
- **Accessibility:** WCAG 2.1 compliant interface

### Data Management

- **Local Storage:** IndexedDB for robust offline data persistence
- **Backup & Restore:** Export/import your data as JSON
- **Data Privacy:** No data leaves your device unless you choose to export

## 🛠️ Technical Details

### Tech Stack

- **React 18** with hooks and functional components
- **TypeScript** for type safety and better DX
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for utility-first styling
- **IndexedDB** via `idb` library for local storage
- **PWA** with service worker and web app manifest

### Architecture Patterns

- **Component-Based:** Modular React components with single responsibility
- **Context API:** Global state management for theme and task lists
- **Custom Hooks:** Reusable logic for data fetching and state management
- **Utility-First:** Organized utility functions by domain

## 📂 Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── TodoList.tsx    # Main task list component
│   │   ├── TodoItem.tsx    # Individual task component
│   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   └── ...
│   ├── context/            # React Context providers
│   │   ├── ThemeContext.ts # Theme state management
│   │   └── TaskListContext.ts
│   ├── hooks/              # Custom React hooks
│   │   ├── useTheme.ts     # Theme management
│   │   └── useTaskLists.ts # Task list operations
│   ├── models/             # TypeScript type definitions
│   │   ├── Task.ts         # Task model
│   │   └── TaskList.ts     # Task list model
│   ├── utils/              # Utility functions
│   │   ├── todo/           # Task-related utilities
│   │   ├── database/       # IndexedDB operations
│   │   └── backup/         # Backup/restore logic
│   └── assets/             # Static assets
├── tests/                  # Test files
├── public/                 # Static public assets
└── ...config files
```

## 🚀 Development

### Prerequisites

- Node.js (v18+)
- pnpm (recommended)

### Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Open http://localhost:5173/T8D/ in your browser
```

## 📱 PWA Features

### Installation

- Install as app on desktop/mobile
- Offline functionality
- Native app-like experience

### Service Worker

- Caches static assets
- Background sync (planned)
- Push notifications (planned)

## 🎨 Styling & Theming

### Tailwind CSS

- Utility-first CSS framework
- Responsive design classes
- Custom design system

### Theme System

- Manual theme switching
- CSS custom properties for dynamic theming

### Vite Configuration

See `vite.config.ts` for:

- PWA settings
- Build optimization
- Development server config

## 🚢 Deployment

### Production Build

```bash
pnpm run build
# Outputs to dist/ directory
```

## 🔍 Browser Support

- **Modern Browsers:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **PWA Support:** Chrome, Firefox, Safari (limited), Edge
- **IndexedDB:** All modern browsers

## 🐛 Troubleshooting

### Common Issues

**Development server won't start:**

```bash
# Clear cache and reinstall
rm -rf node_modules .vite
pnpm install
```

**IndexedDB issues:**

- Check browser storage quotas
- Clear application data in DevTools

**PWA not updating:**

- Clear service worker cache
- Force refresh (Ctrl+Shift+R)
- Check network tab for update requests

---

For more information about the overall project structure and contribution guidelines, see the [main README](../README.md) and [WORKFLOW.md](../WORKFLOW.md).
