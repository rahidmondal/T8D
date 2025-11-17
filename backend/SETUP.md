# T8D Backend Setup Guide

This guide covers setting up the T8D backend sync server for both development and production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Server](#running-the-server)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js**: v18 or higher ([Download](https://nodejs.org/))
- **pnpm**: v8 or higher ([Installation](https://pnpm.io/installation))
- **PostgreSQL**: v14 or higher ([Download](https://www.postgresql.org/download/))
- **Git**: For cloning the repository

### Optional Tools

- **Docker**: For containerized deployment
- **pgAdmin**: GUI for PostgreSQL management
- **Postman**: For API testing

---

## Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/rahidmondal/T8D.git
cd T8D
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
pnpm install

```

### 3. Set Up Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
SERVER_PORT=3000
NODE_ENV=development

# Database (for local PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USER=t8d_user
DB_PASSWORD=your_password
DB_NAME=t8d_db

# Connection String (Prisma uses this)
DATABASE_URL=postgresql://t8d_user:your_password@localhost:5432/t8d_db?schema=public

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_super_secret_jwt_key_here

# CORS Origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

---

## Database Setup

### Option 1: Local PostgreSQL Installation

#### Install PostgreSQL

**macOS** (using Homebrew):

```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian**:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows**:
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

#### Create Database

```bash
# Access PostgreSQL
psql postgres

# Create user and database
CREATE USER t8d_user WITH PASSWORD 'your_password';
CREATE DATABASE t8d_db OWNER t8d_user;
GRANT ALL PRIVILEGES ON DATABASE t8d_db TO t8d_user;

# Exit psql
\q
```

#### Test Connection

```bash
psql -U t8d_user -d t8d_db -h localhost
```

### Option 2: Docker PostgreSQL

```bash
# Run PostgreSQL in Docker
docker run -d \
  --name t8d-postgres \
  -e POSTGRES_USER=t8d_user \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=t8d_db \
  -p 5432:5432 \
  -v t8d_postgres_data:/var/lib/postgresql/data \
  postgres:16-alpine
```

### Option 3: Managed Database Services

Use cloud providers like:

- **Neon**: Free PostgreSQL hosting
- **Supabase**: PostgreSQL with additional features
- **AWS RDS**: Amazon managed PostgreSQL
- **Google Cloud SQL**: Google managed PostgreSQL
- **Azure Database**: Microsoft managed PostgreSQL

Update `DATABASE_URL` with the provided connection string.

---

## Prisma Setup

### Generate Prisma Client

```bash
cd backend
pnpm prisma generate
```

### Run Database Migrations

```bash
# Apply all migrations locally
pnpm prisma migrate deploy

# Or for development (creates migration if schema changed)
pnpm prisma migrate dev
```

> **Docker users:** the backend container's entrypoint automatically runs `pnpm dlx prisma migrate deploy` before starting the server. You can trigger it manually with `docker compose exec backend pnpm dlx prisma migrate deploy` if needed.

### Seed Database (Optional)

Create `backend/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('TestPassword123!', 10);

  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      passwordHash,
      name: 'Test User',
    },
  });

  console.log('Created test user:', user);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run seed:

```bash
pnpm prisma db seed
```

### View Database with Prisma Studio

```bash
pnpm prisma studio
```

Opens GUI at http://localhost:5555

---

## Environment Configuration

### Required Variables

| Variable          | Description                  | Example                                    |
| ----------------- | ---------------------------- | ------------------------------------------ |
| `DATABASE_URL`    | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET`      | Secret key for JWT signing   | `your_generated_secret_key`                |
| `SERVER_PORT`     | Port for backend server      | `3000`                                     |
| `NODE_ENV`        | Environment mode             | `development` or `production`              |
| `ALLOWED_ORIGINS` | CORS allowed origins         | `http://localhost:5173`                    |

### Generating Secure JWT Secret

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Using Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Running the Server

### Development Mode

```bash
# From root
pnpm run backend:dev

# Or from backend directory
cd backend
pnpm dev
```

Features:

- Hot reload with tsx watch
- Debug logging
- CORS enabled for development

### Production Mode

```bash
# Build the server
pnpm run backend:build

# Start production server
pnpm run backend:start

# Or from backend directory
cd backend
pnpm build
pnpm start
```

## Production Deployment

### Security Checklist

- [ ] Use strong, unique JWT secret
- [ ] Use strong database password
- [ ] Enable HTTPS/TLS
- [ ] Set up firewall rules
- [ ] Configure proper CORS origins
- [ ] Enable rate limiting (implement middleware)
- [ ] Set up monitoring and logging
- [ ] Regular database backups
- [ ] Keep dependencies updated
- [ ] Use environment-specific configs

### Deployment Options

#### Option 1: VPS/Dedicated Server

**Requirements**:

- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+
- PostgreSQL 14+
- Nginx (reverse proxy)
- SSL certificate (Let's Encrypt)

**Steps**:

1. **Install dependencies**:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib
```

2. **Set up application**:

```bash
# Clone repository
git clone https://github.com/rahidmondal/T8D.git
cd T8D

# Install dependencies
pnpm install

# Configure environment
cd backend
cp .env.example .env
nano .env  # Edit with production values

# Build application
pnpm build

# Run migrations
pnpm prisma migrate deploy
```

3. **Set up Nginx reverse proxy**:

Create `/etc/nginx/sites-available/t8d`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support for Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/t8d /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4. **Set up SSL with Let's Encrypt**:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

5. **Start with PM2**:

```bash
cd backend
pm2 start dist/app.js --name t8d-backend
pm2 startup
pm2 save
```

#### Option 2: Docker Deployment

See [DOCKER.md](../DOCKER.md) for the full container guide—Docker runs Prisma migrations automatically on startup.

```bash
# Quick start
docker compose up -d
```

#### Option 3: Cloud Platforms

##### Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create t8d-backend

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Run migrations
heroku run pnpm prisma migrate deploy
```

##### Railway

1. Create account at [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL service
4. Deploy from GitHub
5. Set environment variables
6. Railway auto-detects and deploys

##### Render

1. Create account at [render.com](https://render.com)
2. Create Web Service from GitHub
3. Add PostgreSQL database
4. Set environment variables
5. Deploy automatically

---

## API Testing

### Using curl

```bash
# Health check
curl http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }'

# Sync (with token)
curl -X POST http://localhost:3000/api/v1/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "changes": {
      "taskLists": [],
      "tasks": []
    },
    "lastSync": "2025-01-01T00:00:00.000Z"
  }'
```

### Using Postman

1. Import collection from `backend/postman/` (if available)
2. Set base URL to `http://localhost:3000/api/v1`
3. Configure environment variables
4. Test all endpoints

---

## Monitoring and Logging

### Application Logs

```bash
# View logs (development)
pnpm run backend:dev


# View Docker logs
docker logs t8d-backend -f
```

### Database Monitoring

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Monitor active connections
psql -U t8d_user -d t8d_db -c "SELECT * FROM pg_stat_activity;"

# Check database size
psql -U t8d_user -d t8d_db -c "SELECT pg_size_pretty(pg_database_size('t8d_db'));"
```

### Performance Monitoring

Install monitoring tools:

- **New Relic**: Application performance monitoring
- **DataDog**: Infrastructure and application monitoring
- **Sentry**: Error tracking and reporting

---

## Backup and Recovery

### Manual Database Backup

```bash
# Backup
pg_dump -U t8d_user -d t8d_db > backup_$(date +%Y%m%d).sql

# Restore
psql -U t8d_user -d t8d_db < backup_20250115.sql
```

### Automated Backups

Create cron job:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * pg_dump -U t8d_user -d t8d_db > /backups/t8d_backup_$(date +\%Y\%m\%d).sql
```

---

## Troubleshooting

### Database Connection Issues

**Error**: `Cannot connect to database`

**Solutions**:

1. Check PostgreSQL is running:

   ```bash
   sudo systemctl status postgresql
   ```

2. Verify connection string in `.env`

3. Test connection:

   ```bash
   psql -U t8d_user -d t8d_db -h localhost
   ```

4. Check PostgreSQL logs:
   ```bash
   sudo tail -f /var/log/postgresql/postgresql-*.log
   ```

### Prisma Issues

**Error**: `Prisma Client not generated`

**Solution**:

```bash
cd backend
pnpm prisma generate
```

**Error**: `Migration failed`

**Solution**:

```bash
# Reset database (development only)
pnpm prisma migrate reset

# Deploy migrations
pnpm prisma migrate deploy
```

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solutions**:

1. Find and kill process:

   ```bash
   lsof -i :3000
   kill -9 <PID>
   ```

2. Change port in `.env`:
   ```env
   SERVER_PORT=3001
   ```

### JWT Token Issues

**Error**: `Invalid token`

**Solutions**:

1. Verify JWT_SECRET is set correctly
2. Check token expiration (30 days default)
3. Re-login to get new token

---

## Additional Resources

- [API Documentation](./API_DOCUMENTATION.md)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Docker Guide](../DOCKER.md)

---

## Support

For issues or questions:

- Check [GitHub Issues](https://github.com/rahidmondal/T8D/issues)
- See [API Documentation](./API_DOCUMENTATION.md)
- Review [CONTRIBUTING.md](../CONTRIBUTING.md)

---

**Last Updated**: 2025-11-15
