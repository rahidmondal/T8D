# T8D

A modern, offline-first to-do list application focused on private task management. Built as a progressive web app (PWA) with React and TypeScript.

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (recommended package manager)
- [Docker](https://docker.com/) (optional, for containerized deployment)

### Development Setup

1. **Clone and install dependencies:**

   ```bash
   git clone https://github.com/rahidmondal/T8D.git
   cd T8D
   pnpm install
   ```

2. **Start development servers:**

   ```bash
   # Start both frontend and backend
   pnpm run dev

   # Or start individually
   pnpm run frontend:dev
   pnpm run backend:dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173/T8D/
   - Backend API: http://localhost:3000/api/ (when available)

## 🏗️ Project Structure

This is a **pnpm monorepo** with the following structure:

```
T8D/
├── frontend/           # React + TypeScript client app
│   ├── src/
│   ├── tests/
│   └── README.md      # Frontend-specific documentation
├── backend/           # Node.js API server (in development)
├── docker-compose.yaml # Container orchestration
├── WORKFLOW.md        # Development workflow guide
├── CONTRIBUTING.md    # Contribution guidelines
└── package.json       # Monorepo scripts
```

## 🛠️ Available Scripts

```bash
# Development
pnpm run dev      # Start both frontend and backend
pnpm run frontend:dev   # Start frontend only
pnpm run backend:dev    # Start backend only

# Quality Assurance
pnpm run lint          # Lint all packages
pnpm run test          # Run all tests
pnpm run format        # Format code with Prettier

# Production
pnpm run build         # Build all packages
pnpm run preview       # Preview production build
```

## 🐳 Docker Deployment

### Self-Hosted with Docker

```bash
# Build and run the application
docker-compose up --build

```

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) and [WORKFLOW.md](WORKFLOW.md) for:

- Code of conduct
- Development workflow
- Pull request process
- Issue reporting guidelines

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
