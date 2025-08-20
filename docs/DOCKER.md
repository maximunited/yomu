# Docker & Podman Setup for YomU

This document provides instructions for running YomU using Docker or Podman with Docker Compose.

## Prerequisites

### Docker

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed

### Podman

- [Podman](https://podman.io/getting-started/installation) installed
- [Podman Compose](https://github.com/containers/podman-compose) installed

## Quick Start

### Using Docker

1. **Clone the repository** (if not already done):

   ```bash
   git clone <repository-url>
   cd yomu
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build and run the application**:

   ```bash
   # Production mode
   docker-compose up -d

   # Development mode (with hot reload)
   docker-compose --profile dev up -d
   ```

4. **Access the application**:
   - Production: <http://localhost:3000>
   - Development: <http://localhost:3001>

### Using Podman

1. **Clone the repository** (if not already done):

   ```bash
   git clone <repository-url>
   cd yomu
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build and run the application**:

   ```bash
   # Production mode
   podman-compose up -d

   # Development mode (with hot reload)
   podman-compose --profile dev up -d
   ```

4. **Access the application**:
   - Production: <http://localhost:3000>
   - Development: <http://localhost:3001>

## Services Overview

### Production Stack (`compose.yml`)

- **app**: Next.js application (production build)
- **db**: SQLite database with persistent storage
- **app-dev**: Development version with hot reload (optional)

### Development Stack

- **app-dev**: Next.js development server with hot reload
- **db**: SQLite database with persistent storage

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:/data/dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Node Environment
NODE_ENV="production"
```

## Commands Reference

### Docker Commands

```bash
# Start all services
docker-compose up -d

# Start with development profile
docker-compose --profile dev up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up -d --build

# Clean up volumes
docker-compose down -v
```

### Podman Commands

```bash
# Start all services
podman-compose up -d

# Start with development profile
podman-compose --profile dev up -d

# View logs
podman-compose logs -f app

# Stop all services
podman-compose down

# Rebuild and start
podman-compose up -d --build

# Clean up volumes
podman-compose down -v
```

## Database Management

### Initialize Database

```bash
# Run database migrations
docker-compose exec app npx prisma migrate deploy

# Seed the database
docker-compose exec app node scripts/seed.js
```

### Backup Database

```bash
# Copy database from container
docker cp yomu-db:/data/dev.db ./backup/dev.db
```

### Restore Database

```bash
# Copy database to container
docker cp ./backup/dev.db yomu-db:/data/dev.db
```

## Development Workflow

### Using Development Container

1. **Start development environment**:

   ```bash
   docker-compose --profile dev up -d
   ```

2. **Access development server**: <http://localhost:3001>

3. **View logs**:

   ```bash
   docker-compose logs -f app-dev
   ```

4. **Run commands in container**:

   ```bash
   docker-compose exec app-dev npm run test
   docker-compose exec app-dev npx prisma studio
   ```

### Hot Reload

The development container includes volume mounts for:

- Source code changes
- Node modules (cached)
- Database persistence

Changes to your code will automatically trigger hot reload.

## Production Deployment

### Dev Using Docker

1. **Build production image**:

   ```bash
   docker-compose build app
   ```

2. **Start production stack**:

   ```bash
   docker-compose up -d
   ```

3. **Initialize database**:

   ```bash
   docker-compose exec app npx prisma migrate deploy
   docker-compose exec app node scripts/seed.js
   ```

### Dev Using Podman

1. **Build production image**:

   ```bash
   podman-compose build app
   ```

2. **Start production stack**:

   ```bash
   podman-compose up -d
   ```

3. **Initialize database**:

   ```bash
   podman-compose exec app npx prisma migrate deploy
   podman-compose exec app node scripts/seed.js
   ```

## Troubleshooting

### Common Issues

1. **Port already in use**:

   ```bash
   # Check what's using the port
   lsof -i :3000

   # Stop conflicting services
   docker-compose down
   ```

2. **Database connection issues**:

   ```bash
   # Check database container
   docker-compose logs db

   # Restart database
   docker-compose restart db
   ```

3. **Build failures**:

   ```bash
   # Clean build cache
   docker-compose build --no-cache app
   ```

4. **Permission issues (Podman)**:

   ```bash
   # Run with correct SELinux labels
   podman-compose up -d
   ```

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs app

# Follow logs in real-time
docker-compose logs -f app

# Access container shell
docker-compose exec app sh
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Secrets**: Use Docker secrets or external secret management
3. **Network**: Services are isolated in a custom network
4. **User**: Application runs as non-root user (nextjs:1001)

## Performance Optimization

### Production Build

- Multi-stage Dockerfile reduces image size
- Standalone Next.js output optimizes runtime
- Alpine Linux base image minimizes footprint

### Development

- Volume mounts for fast file access
- Node modules cached in container
- Hot reload for rapid development

## Monitoring

### Health Checks

```bash
# Check service status
docker-compose ps

# Check resource usage
docker stats
```

### Logs

```bash
# Application logs
docker-compose logs app

# Database logs
docker-compose logs db
```

## Backup and Recovery

### Database Backup

```bash
# Create backup
docker-compose exec db sqlite3 /data/dev.db ".backup /data/backup_$(date +%Y%m%d_%H%M%S).db"

# Copy backup to host
docker cp yomu-db:/data/backup_*.db ./backups/
```

### Full Backup

```bash
# Backup volumes
docker run --rm -v yomu_db_data:/data -v $(pwd):/backup alpine tar czf /backup/db_backup_$(date +%Y%m%d_%H%M%S).tar.gz /data
```

## Scaling

### Horizontal Scaling

```bash
# Scale application instances
docker-compose up -d --scale app=3
```

### Load Balancing

For production deployments, consider using:

- Nginx reverse proxy
- Traefik for automatic SSL
- Docker Swarm for orchestration

## Contributing

When contributing to the Docker setup:

1. Test both Docker and Podman configurations
2. Update documentation for any changes
3. Ensure backward compatibility
4. Test in both development and production modes
