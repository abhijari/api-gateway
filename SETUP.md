# Setup Guide

## Prerequisites

- Docker & Docker Compose installed
- Node.js 18+ (for local development without Docker)

## Quick Start with Docker

1. **Clone and navigate to the project:**
   ```bash
   cd api-gateway-platform
   ```

2. **Start all services:**
   ```bash
   docker-compose up
   ```

   The first run will:
   - Pull Docker images
   - Create PostgreSQL database
   - Run Prisma migrations
   - Start all services

3. **Access the dashboard:**
   - Open http://localhost:3000
   - Login with your email
   - Create your first API key

## Local Development Setup

### Backend (Gateway)

1. **Navigate to gateway directory:**
   ```bash
   cd gateway
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database and Redis URLs
   ```

4. **Set up database:**
   ```bash
   # Generate Prisma Client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   
   # (Optional) Seed database with test data
   npm run prisma:seed
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

### Frontend (Dashboard)

1. **Navigate to dashboard directory:**
   ```bash
   cd dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your gateway API URL
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Database Setup

### Using Docker Compose (Recommended)

The `docker-compose.yml` automatically sets up PostgreSQL. The connection string is:
```
postgresql://postgres:postgres@localhost:5432/api_gateway?schema=public
```

### Using Neon PostgreSQL (Cloud)

1. Create a Neon account at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Update `gateway/.env`:
   ```
   DATABASE_URL="your_neon_connection_string"
   ```

## Redis Setup

### Using Docker Compose (Recommended)

Redis is automatically started with docker-compose. Connection:
- Host: `localhost`
- Port: `6379`

### Using Cloud Redis

Update `gateway/.env`:
```
REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=your_password
```

## Testing the API Gateway

1. **Create a user and API key via dashboard:**
   - Visit http://localhost:3000/login
   - Enter your email
   - Create an API key from the dashboard

2. **Test the proxy endpoint:**
   ```bash
   curl -H "X-API-Key: your_api_key_here" \
        http://localhost:3001/proxy/users
   ```

3. **Check rate limiting:**
   - Make multiple rapid requests
   - You should see rate limit headers in the response
   - After exceeding limits, you'll get a 429 status

4. **View usage logs:**
   - Visit http://localhost:3000/dashboard/logs
   - Or check http://localhost:3000/dashboard/usage/[keyId]

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running: `docker-compose ps`
- Check database URL in `.env`
- Run migrations: `cd gateway && npm run prisma:migrate`

### Redis Connection Issues

- Ensure Redis is running: `docker-compose ps`
- Check Redis configuration in `.env`
- Test connection: `redis-cli ping`

### Port Conflicts

If ports 3000, 3001, 5432, or 6379 are already in use:
- Stop conflicting services
- Or update ports in `docker-compose.yml`

### Prisma Migration Issues

```bash
cd gateway
npm run prisma:generate
npm run prisma:migrate
```

## Production Deployment

1. Update environment variables for production
2. Use production database (Neon PostgreSQL recommended)
3. Use production Redis (Redis Cloud or similar)
4. Set `NODE_ENV=production`
5. Build and deploy:
   ```bash
   cd gateway && npm run build
   cd dashboard && npm run build
   ```

