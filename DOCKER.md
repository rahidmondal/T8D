# Docker Deployment Guide

This guide covers deploying T8D using Docker and Docker Compose for both development and production environments.

## Prerequisites

- **Docker**: Version 20.10+ ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose**: Version 2.0+ (included with Docker Desktop)
- **Git**: For cloning the repository

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/rahidmondal/T8D.git
cd T8D
```

### 2. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

**Important**: Update the following values in `.env`:
- `POSTGRES_PASSWORD`: Use a strong, unique password
- `JWT_SECRET`: Generate a secure random string
- `ALLOWED_ORIGINS`: Set to your frontend URL(s)

### 3. Start All Services

```bash
# Build and start all services (frontend, backend, database)
docker-compose up --build -d

# View logs
docker-compose logs -f
```

### 4. Access the Application

- **Frontend**: http://localhost:8080/T8D/
- **Backend API**: http://localhost:3000/api/v1/
- **Health Check**: http://localhost:3000/health

### 5. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes all data)
docker-compose down -v
```

---

## Architecture

The Docker setup consists of three services:

```
┌─────────────────────────────────────────┐
│           Docker Network                │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────┐ │
│  │ Frontend │  │ Backend  │  │ Postgres│
│  │  (Nginx) │  │ (Node.js)│  │  (DB)  │
│  │  :80     │  │  :3000   │  │ :5432  │
│  └────┬─────┘  └────┬─────┘  └───┬────┘
│       │             │             │     │
└───────┼─────────────┼─────────────┼─────┘
        │             │             │
    Port 8080     Port 3000     Port 5432
```

### Services

#### 1. PostgreSQL Database (`postgres`)
- **Image**: postgres:16-alpine
- **Port**: 5432
- **Volume**: `postgres_data` for persistence
- **Purpose**: Stores all application data

#### 2. Backend API (`backend`)
- **Build**: Custom Node.js image
- **Port**: 3000
- **Dependencies**: PostgreSQL
- **Purpose**: RESTful API and WebSocket server

#### 3. Frontend (`frontend`)
- **Build**: Custom Nginx image with React build
- **Port**: 8080 (maps to 80 inside container)
- **Purpose**: Serves the PWA application

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_USER` | PostgreSQL username | `t8d_user` |
| `POSTGRES_PASSWORD` | PostgreSQL password (change in production!) | `secure_password_123` |
| `POSTGRES_DB` | PostgreSQL database name | `t8d_db` |
| `JWT_SECRET` | Secret key for JWT tokens | `generated_secret_key` |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins | `http://localhost:8080` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_PORT` | Backend server port | `3000` |
| `NODE_ENV` | Node environment | `production` |

### Generating Secure Secrets

```bash
# Generate JWT secret
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Rebuild After Code Changes

```bash
# Rebuild and restart all services
docker-compose up --build -d

# Rebuild specific service
docker-compose up --build -d backend
```

### Execute Commands Inside Containers

```bash
# Access backend shell
docker-compose exec backend sh

# Run Prisma migrations
docker-compose exec backend pnpm prisma migrate deploy

# Access PostgreSQL
docker-compose exec postgres psql -U t8d_user -d t8d_db
```

### Database Management

```bash
# Create a database backup
docker-compose exec postgres pg_dump -U t8d_user t8d_db > backup.sql

# Restore from backup
docker-compose exec -T postgres psql -U t8d_user -d t8d_db < backup.sql

# Reset database (WARNING: destroys all data)
docker-compose down -v
docker-compose up -d
```

---

## Production Deployment

### Security Checklist

Before deploying to production:

- [ ] Change all default passwords in `.env`
- [ ] Generate a strong JWT secret
- [ ] Set `ALLOWED_ORIGINS` to your actual frontend URL
- [ ] Use HTTPS/TLS for all connections
- [ ] Set up a reverse proxy (Nginx, Traefik, etc.)
- [ ] Enable automatic backups
- [ ] Configure monitoring and logging
- [ ] Set up firewall rules
- [ ] Use Docker secrets or vault for sensitive data
- [ ] Regularly update Docker images

### Production Docker Compose

For production, create `docker-compose.prod.yaml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups  # Mount backup directory
    networks:
      - t8d-network
    # Don't expose port to host in production
    # Use internal network only

  backend:
    build:
      context: .
      dockerfile: ./backend/Dockerfile
    restart: always
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      JWT_SECRET: ${JWT_SECRET}
      ALLOWED_ORIGINS: ${ALLOWED_ORIGINS}
    depends_on:
      - postgres
    networks:
      - t8d-network
    # Only expose to reverse proxy

  frontend:
    build:
      context: .
      dockerfile: ./frontend/Dockerfile
    restart: always
    depends_on:
      - backend
    networks:
      - t8d-network
    # Only expose to reverse proxy

  # Reverse proxy (optional)
  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - t8d-network

volumes:
  postgres_data:

networks:
  t8d-network:
```

Deploy with:

```bash
docker-compose -f docker-compose.prod.yaml up -d
```

### Using Docker Secrets

For enhanced security, use Docker Swarm secrets:

```yaml
services:
  backend:
    secrets:
      - jwt_secret
      - db_password
    environment:
      JWT_SECRET_FILE: /run/secrets/jwt_secret
      DB_PASSWORD_FILE: /run/secrets/db_password

secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  db_password:
    file: ./secrets/db_password.txt
```

---

## Troubleshooting

### Container Won't Start

**Check logs:**
```bash
docker-compose logs backend
```

**Common issues:**
- Database not ready: Wait for PostgreSQL health check to pass
- Port already in use: Change port mapping in docker-compose.yaml
- Missing environment variables: Check `.env` file

### Database Connection Issues

**Check PostgreSQL status:**
```bash
docker-compose ps postgres
docker-compose logs postgres
```

**Test connection:**
```bash
docker-compose exec backend sh
# Inside container:
node -e "require('./dist/app.js')"
```

**Verify DATABASE_URL:**
```bash
docker-compose exec backend env | grep DATABASE_URL
```

### Frontend 404 Errors

**Check build output:**
```bash
docker-compose exec frontend ls -la /usr/share/nginx/html/T8D/
```

**Verify Nginx config:**
```bash
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf
```

### Performance Issues

**Monitor resource usage:**
```bash
docker stats
```

**Check container health:**
```bash
docker-compose ps
```

### Prisma Migration Issues

**Run migrations manually:**
```bash
docker-compose exec backend pnpm prisma migrate deploy
```

**Reset database (development only):**
```bash
docker-compose exec backend pnpm prisma migrate reset
```

---

## Development with Docker

### Hot Reload Development

For development with hot reload:

```yaml
# docker-compose.dev.yaml
services:
  backend:
    build:
      context: .
      dockerfile: ./backend/Dockerfile
      target: build  # Use build stage only
    command: pnpm dev  # Use dev command
    volumes:
      - ./backend/src:/app/backend/src  # Mount source
    environment:
      NODE_ENV: development
```

Start with:
```bash
docker-compose -f docker-compose.dev.yaml up
```

### VS Code Integration

Add to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Docker: Start All",
      "type": "shell",
      "command": "docker-compose up -d",
      "problemMatcher": []
    },
    {
      "label": "Docker: Stop All",
      "type": "shell",
      "command": "docker-compose down",
      "problemMatcher": []
    }
  ]
}
```

---

## Monitoring and Logging

### Log Aggregation

Use a logging driver:

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Health Monitoring

Check service health:

```bash
# Overall status
docker-compose ps

# Detailed health check
docker inspect --format='{{.State.Health.Status}}' t8d-backend
```

### Performance Monitoring

Add Prometheus/Grafana (optional):

```yaml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - '9090:9090'

  grafana:
    image: grafana/grafana
    ports:
      - '3001:3000'
```

---

## Backup and Restore

### Automated Backups

Create a backup script:

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
BACKUP_FILE="$BACKUP_DIR/t8d_backup_$DATE.sql"

mkdir -p $BACKUP_DIR
docker-compose exec -T postgres pg_dump -U t8d_user t8d_db > $BACKUP_FILE
gzip $BACKUP_FILE

echo "Backup created: $BACKUP_FILE.gz"
```

### Restore from Backup

```bash
#!/bin/bash
# restore.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./restore.sh <backup_file>"
  exit 1
fi

gunzip -c $BACKUP_FILE | docker-compose exec -T postgres psql -U t8d_user -d t8d_db

echo "Restore complete"
```

---

## Updating

### Update to Latest Version

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up --build -d

# Run migrations
docker-compose exec backend pnpm prisma migrate deploy
```

### Update Docker Images

```bash
# Pull latest base images
docker-compose pull

# Rebuild with latest
docker-compose build --no-cache
docker-compose up -d
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build and Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build images
        run: docker-compose build
      
      - name: Run tests
        run: docker-compose run backend pnpm test
      
      - name: Push to registry
        run: |
          docker-compose push
```

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Nginx Docker Image](https://hub.docker.com/_/nginx)
- [T8D Contributing Guide](./CONTRIBUTING.md)
- [T8D Workflow Guide](./WORKFLOW.md)

---

## Support

For issues or questions:
- Check [GitHub Issues](https://github.com/rahidmondal/T8D/issues)
- See [Troubleshooting](#troubleshooting) section
- Open a new issue with the `docker` label

---

**Last Updated**: 2025-01-15
