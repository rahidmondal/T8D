# T8D Quick Start Guide

Get T8D up and running in minutes! Choose your preferred method below.

## 🎯 Choose Your Path

- [🐳 Docker (Recommended)](#-docker-quickest) - Quickest, no setup needed
- [💻 Local Development](#-local-development) - Full development environment
- [🌐 Frontend Only](#-frontend-only) - Just try the PWA

---

## 🐳 Docker (Quickest)

**Perfect for**: Testing, production deployment, full-stack development

### Requirements
- Docker Desktop installed ([Get Docker](https://docs.docker.com/get-docker/))

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/rahidmondal/T8D.git
cd T8D

# 2. Create environment file
cp .env.example .env

# 3. Start everything!
docker-compose up -d

# 4. Access the app
# Frontend: http://localhost:8080/T8D/
# Backend API: http://localhost:3000/api/v1/
```

That's it! 🎉

### What's Running?
- **PostgreSQL**: Database on port 5432
- **Backend API**: Node.js server on port 3000
- **Frontend**: React PWA on port 8080

### Useful Commands
```bash
# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Rebuild after changes
docker-compose up --build -d
```

📖 **More details**: See [DOCKER.md](DOCKER.md)

---

## 💻 Local Development

**Perfect for**: Contributing, customizing, learning the codebase

### Requirements
- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL 14+ ([Download](https://www.postgresql.org/download/))
- pnpm ([Install](https://pnpm.io/installation))

### Quick Setup

```bash
# 1. Clone and install
git clone https://github.com/rahidmondal/T8D.git
cd T8D
pnpm install

# 2. Set up database
createdb t8d_db

# 3. Configure backend
cd backend
cp .env.example .env
# Edit .env with your database credentials

# 4. Run migrations
pnpm prisma migrate deploy
pnpm prisma generate

# 5. Start development servers (from root)
cd ..
pnpm run dev
```

### Access
- **Frontend**: http://localhost:5173/T8D/
- **Backend API**: http://localhost:3000/api/v1/

### Development Commands

```bash
# Frontend only
pnpm run frontend:dev

# Backend only
pnpm run backend:dev

# Run tests
pnpm test

# Lint code
pnpm lint

# Format code
pnpm format

# Check everything
pnpm check
```

📖 **More details**: See [backend/SETUP.md](backend/SETUP.md)

---

## 🌐 Frontend Only

**Perfect for**: Just trying the PWA, offline features

### Requirements
- Node.js 18+
- pnpm

### Steps

```bash
# 1. Clone and install
git clone https://github.com/rahidmondal/T8D.git
cd T8D
pnpm install

# 2. Start frontend
pnpm run frontend:dev

# 3. Open browser
# http://localhost:5173/T8D/
```

**Note**: Works offline, but sync features require backend.

---

## 🎮 First Steps After Setup

### 1. Create an Account (if using backend)
Navigate to http://localhost:8080/T8D/ (or :5173 for local dev)

### 2. Try Offline Mode
- Create some tasks
- Disconnect from internet
- Add/edit/delete tasks
- Reconnect - your changes are saved!

### 3. Test PWA Installation
- Click the install button in your browser
- Or use browser menu: "Install T8D"

### 4. Explore Features
- **Lists**: Create multiple task lists
- **Subtasks**: Add nested tasks
- **Dark Mode**: Toggle theme
- **Sync**: Changes sync across devices (if backend enabled)

---

## 🐛 Troubleshooting

### Docker Issues

**Problem**: Ports already in use

```bash
# Change ports in docker-compose.yaml
# Or stop conflicting services
docker ps  # See what's running
```

**Problem**: Database connection failed

```bash
# Check PostgreSQL is running
docker-compose ps
docker-compose logs postgres
```

### Local Development Issues

**Problem**: PostgreSQL connection error

```bash
# Verify PostgreSQL is running
pg_isready

# Check your DATABASE_URL in backend/.env
```

**Problem**: Prisma Client not found

```bash
cd backend
pnpm prisma generate
```

**Problem**: Port 3000 or 5173 in use

```bash
# Find and kill process
lsof -i :3000  # or :5173
kill -9 <PID>

# Or change port in configuration
```

---

## 📚 Next Steps

### For Users
- 📖 Read the [README](README.md)
- 🎯 Check the [Roadmap](README.md#roadmap)
- 💬 Join [Discussions](https://github.com/rahidmondal/T8D/discussions)

### For Contributors
- 📝 Read [CONTRIBUTING.md](CONTRIBUTING.md)
- 🔄 Learn the [WORKFLOW.md](WORKFLOW.md)
- 🐛 Find [Good First Issues](https://github.com/rahidmondal/T8D/labels/good%20first%20issue)

### For Deployers
- 🐳 Full [Docker Guide](DOCKER.md)
- 🔧 [Backend Setup](backend/SETUP.md)
- 📡 [API Documentation](backend/API_DOCUMENTATION.md)

---

## 🎯 Common Tasks

### Reset Everything (Development)

```bash
# Docker
docker-compose down -v
docker-compose up --build -d

# Local
cd backend
pnpm prisma migrate reset
cd ..
pnpm run dev
```

### Update to Latest Version

```bash
git pull origin main
pnpm install
docker-compose up --build -d  # If using Docker
# or
pnpm run dev  # If using local setup
```

### Run Quality Checks

```bash
# Run all checks
pnpm check

# Individual checks
pnpm lint
pnpm test
pnpm type-check
pnpm format:check
```

---

## 📞 Get Help

- 🐛 [Report Issues](https://github.com/rahidmondal/T8D/issues)
- 💬 [Ask Questions](https://github.com/rahidmondal/T8D/discussions)
- 📖 [Read Docs](README.md)
- 🔒 [Security Issues](SECURITY.md)

---

## ⭐ Show Your Support

If you find T8D useful:
- ⭐ Star the repository
- 🐛 Report bugs
- 💡 Suggest features
- 🤝 Contribute code

---

**Happy Task Managing! 🚀**

Made with ❤️ by the T8D Team
