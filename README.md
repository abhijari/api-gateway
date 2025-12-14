# API Gateway Platform

A Mini AWS API Gateway clone built with Node.js, Express, Next.js, and PostgreSQL.

## Project Structure

```
api-gateway-platform/
├── gateway/          # Backend API Gateway (Node.js + Express + TypeScript)
├── dashboard/        # Frontend Dashboard (Next.js 14 + TypeScript + TailwindCSS)
├── shared/           # Shared types and utilities
└── docker-compose.yml
```

## Features

- 🔄 Reverse proxy with request forwarding
- 🔑 API key management and validation
- 📊 Usage logging and analytics
- ⚡ Rate limiting with Redis
- 🎨 Modern dashboard UI

## Tech Stack

### Backend
- Node.js + TypeScript
- Express
- Neon PostgreSQL (Prisma ORM)
- Redis

### Frontend
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- ShadCN UI

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)

### Quick Start

1. Clone the repository
2. Copy environment files:
   ```bash
   cp gateway/.env.example gateway/.env
   cp dashboard/.env.example dashboard/.env
   ```

3. Start all services:
   ```bash
   docker-compose up
   ```

   This will:
   - Start PostgreSQL database
   - Start Redis for rate limiting
   - Start the Gateway backend (runs migrations automatically)
   - Start the Dashboard frontend

4. Access the services:
   - Gateway API: http://localhost:3001
   - Dashboard: http://localhost:3000

5. First-time setup:
   - Visit http://localhost:3000/login
   - Enter your email to create/login
   - Create your first API key from the dashboard
   - Use the API key to make requests through the gateway

### Development

#### Backend (Gateway)
```bash
cd gateway
npm install
npm run dev
```

#### Frontend (Dashboard)
```bash
cd dashboard
npm install
npm run dev
```

## Environment Variables

See `.env.example` files in each subdirectory for required environment variables.

## API Endpoints

### Gateway Proxy
- `ALL /proxy/*` - Forward requests to internal APIs
  - Requires `X-API-Key` header or `api_key` query parameter
  - Example: `GET http://localhost:3001/proxy/users?X-API-Key=your_key_here`

### User Management
- `POST /users` - Create or get user by email
- `GET /users/by-email?email=...` - Get user by email

### API Key Management
- `POST /keys` - Generate new API key
  - Body: `{ userId, limitPerMinute?, limitPerDay? }`
- `GET /keys` - List all API keys (or filter by `?userId=...`)
- `GET /keys/:id` - Get single API key
- `PATCH /keys/:id` - Update API key (active, limitPerMinute, limitPerDay)
- `DELETE /keys/:id` - Delete API key

### Usage Statistics
- `GET /usage/:keyId` - Get usage statistics for an API key
  - Returns: statistics (total, successful, failed requests, avg latency) and recent logs

## Usage Example

1. **Create a user and API key via Dashboard:**
   - Login at http://localhost:3000/login
   - Go to Dashboard and create an API key

2. **Make a proxied request:**
   ```bash
   curl -H "X-API-Key: your_api_key_here" \
        http://localhost:3001/proxy/users
   ```

3. **View usage statistics:**
   - Visit http://localhost:3000/dashboard/usage/[keyId]
   - Or call `GET /usage/:keyId` API endpoint

## License

MIT

