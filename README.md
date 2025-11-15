# T8D

A modern, offline-first to-do list application focused on private task management. Built as a progressive web app (PWA) with React and TypeScript.

## ✨ Features

- **Offline-First**: Works seamlessly without internet connection
- **Real-time Sync**: Synchronize tasks across devices
- **PWA Support**: Install as a native app on any platform
- **Dark Mode**: Beautiful dark/light theme support
- **Privacy-Focused**: Your data, your control
- **Subtasks**: Organize with nested task hierarchies
- **Multiple Lists**: Organize tasks into separate lists

---

## 🚀 Quick Start

**New to T8D?** See our [Quick Start Guide](QUICKSTART.md) for the fastest way to get running!

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

2. **Set up backend environment:**

   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development servers:**

   ```bash
   # Start both frontend and backend
   pnpm run dev

   # Or start individually
   pnpm run frontend:dev  # Frontend: http://localhost:5173
   pnpm run backend:dev   # Backend: http://localhost:3000
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173/T8D/
   - Backend API: http://localhost:3000/api/v1/

---

## 🏗️ Project Structure

This is a **pnpm monorepo** with the following structure:

```
T8D/
├── frontend/           # React + TypeScript client app
│   ├── src/
│   ├── tests/
│   └── README.md      # Frontend-specific documentation
├── backend/            # Node.js + Express API server
│   ├── src/
│   ├── prisma/        # Database schema
│   ├── tests/
│   └── API_DOCUMENTATION.md
├── WORKFLOW.md         # Development workflow guide
├── CONTRIBUTING.md     # Contribution guidelines
├── CODE_OF_CONDUCT.md  # Code of conduct
├── DOCKER.md           # Docker deployment guide
└── package.json        # Monorepo scripts
```

---

## 🛠️ Available Scripts

```bash
# Development
pnpm run dev            # Start both frontend and backend
pnpm run frontend:dev   # Start frontend only
pnpm run backend:dev    # Start backend only

# Quality Assurance
pnpm run lint           # Lint all packages
pnpm run lint:fix       # Fix linting issues
pnpm run test           # Run all tests
pnpm run coverage       # Generate test coverage
pnpm run type-check     # TypeScript type checking
pnpm run format         # Format code with Prettier
pnpm run format:check   # Check code formatting
pnpm run check          # Run all quality checks

# Production
pnpm run build          # Build all packages
pnpm run preview        # Preview production build
```

---

## 🐳 Docker Deployment

### Quick Deploy

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Build and run with Docker Compose
docker-compose up --build -d

# Access the application
# Frontend: http://localhost:8080/T8D/
# Backend: http://localhost:3000/api/v1/
```

For detailed Docker instructions, see [DOCKER.md](DOCKER.md).

---

## 📚 Documentation

### For Users

- [README.md](README.md) - This file (getting started)
- [DOCKER.md](DOCKER.md) - Docker deployment guide

### For Developers

- [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
- [WORKFLOW.md](WORKFLOW.md) - Development workflow and Git practices
- [Backend API Documentation](backend/API_DOCUMENTATION.md) - Complete API reference
- [Frontend README](frontend/README.md) - Frontend-specific docs

### Project Policies

- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - Community guidelines
- [LICENSE](LICENSE) - MIT License

---

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) and [WORKFLOW.md](WORKFLOW.md) for:

- Code of conduct
- Development workflow
- Branching strategy
- Commit message format
- Pull request process
- Testing requirements
- Coding standards

**Quick Start for Contributors:**

1. Fork the repository
2. Create a feature branch from `dev`
3. Make your changes following our coding standards
4. Run `pnpm check` to ensure quality
5. Submit a pull request to `dev` branch

---

## 🏗️ Tech Stack

### Frontend

- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: React Context API
- **Offline Storage**: IndexedDB (via idb)
- **Build Tool**: Vite
- **PWA**: vite-plugin-pwa
- **Testing**: Vitest + Testing Library

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express 5
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Passport
- **Real-time**: Socket.IO
- **Validation**: Zod
- **Security**: bcrypt, zxcvbn

### DevOps

- **Package Manager**: pnpm (monorepo)
- **Linting**: ESLint
- **Formatting**: Prettier
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions (planned)

---

## 🔐 Security

Security is a top priority. For security-related concerns:

- **Report vulnerabilities**: See [SECURITY.md](SECURITY.md) for reporting procedures
- **Security features**: JWT authentication, bcrypt password hashing, input validation
- **Best practices**: Never commit secrets, use environment variables

---

## 📊 Project Status

- **Version**: 1.3.0
- **Status**: Active Development
- **License**: MIT
- **Maintainers**: Rahid Mondal, Pushpam Jha

---

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) and [WORKFLOW.md](WORKFLOW.md) for:

- Code of conduct
- Development workflow
- Pull request process
- Issue reporting guidelines

---

## 🌟 Support

If you find this project helpful:

- ⭐ Star the repository
- 🐛 Report bugs via [GitHub Issues](https://github.com/rahidmondal/T8D/issues)
- 💡 Suggest features via [GitHub Discussions](https://github.com/rahidmondal/T8D/discussions)
- 🤝 Contribute code or documentation

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

- **Repository**: [github.com/rahidmondal/T8D](https://github.com/rahidmondal/T8D)
- **Issues**: [GitHub Issues](https://github.com/rahidmondal/T8D/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rahidmondal/T8D/discussions)

---

Made with ❤️ by the T8D Team
