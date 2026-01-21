# Architecture (0 → Hero)

This document explains how the **API Gateway Platform** works end-to-end: components, request flow, data model, and deployment topology.

## High-level Components

### `gateway/` (API Gateway service)
- **Runtime**: Node.js + Express + TypeScript
- **Responsibilities**:
  - API key authentication
  - Rate limiting (minute + day)
  - Reverse proxying to an upstream/internal API
  - Usage logging (latency + status codes)
  - Management APIs for users + API keys + usage stats
- **Dependencies**:
  - **PostgreSQL** (via Prisma) for Users / API Keys / Usage Logs
  - **Redis** for rate limiting counters

### `dashboard/` (Admin UI)
- **Runtime**: Next.js (App Router) + Tailwind + shadcn/ui
- **Responsibilities**:
  - Email-only “login” (creates/gets a `User` record)
  - Create/manage API keys
  - View logs and usage analytics
- **Gateway URL configuration**:
  - The browser calls `GET /api/runtime-config` to learn `GATEWAY_API_URL` at runtime (server-side env), then uses that for all API calls.

### `shared/`
- Shared types/utilities for the monorepo (optional; used to avoid drift between services).

### Infrastructure/Deployment
- **Docker Compose** (local/dev): `docker-compose.yml`
- **Production Compose** (images from GHCR): `deploy/docker-compose.prod.yml`
- **Kubernetes** manifests (optional): `k8s/`
- **Terraform** AWS scaffolding: `infra/aws/` (IAM/SSM/EC2 modules)

## Request Flow (Proxy)

### 1) Client calls the Gateway
The user (or their app) sends a request to:
- `ALL /proxy/*` with an API key in:
  - `X-API-Key: <key>` header, or
  - `?api_key=<key>` query param

### 2) API Key Authentication (Postgres)
- The gateway looks up the API key record in Postgres.
- If missing → `401 Unauthorized`
- If disabled → `403 Forbidden`
- If valid → attaches `req.apiKey` (limits + key id).

### 3) Rate Limiting (Redis)
For each request the gateway checks:
- **Per-minute** limit: `rate:<apiKey>:minute` (TTL 60s)
- **Per-day** limit: `rate:<apiKey>:day` (TTL until midnight)

On limit exceeded:
- returns `429 Too Many Requests`
- sets `X-RateLimit-*` response headers.

### 4) Reverse Proxy to Upstream
The gateway forwards the request to:
- `INTERNAL_API_BASE_URL + <path after /proxy>`

It filters internal/problematic headers (e.g. `x-api-key`, `host`, etc), and returns the upstream status + JSON body.

### 5) Usage Logging (Postgres)
After the upstream returns:
- the gateway writes a `UsageLog` record:
  - `apiKeyId`
  - `path`
  - `statusCode`
  - `latencyMs`
  - `timestamp`

This write is done asynchronously (request is not blocked on DB log insert).

## Management APIs (Gateway)

### Users
- `POST /users` → create/get user by email (simple email-based identity)
- `GET /users/by-email?email=...` → fetch user

### API Keys
- `POST /keys` → create key for a user (returns the raw key)
- `GET /keys` → list keys (optionally `?userId=...`)
- `GET /keys/:id` → fetch one
- `PATCH /keys/:id` → enable/disable or update limits
- `DELETE /keys/:id` → delete

### Usage
- `GET /usage/:keyId` → stats + recent logs

## Data Model (Postgres / Prisma)

### `User`
- `id` (uuid)
- `email` (unique)
- `createdAt`

### `ApiKey`
- `id` (uuid)
- `userId` (FK → User)
- `key` (unique, `ak_...`)
- `active`
- `limitPerMinute`, `limitPerDay`
- `createdAt`

### `UsageLog`
- `id` (uuid)
- `apiKeyId` (FK → ApiKey)
- `path`
- `statusCode`
- `latencyMs`
- `timestamp`

## Deployment Topologies

### Local (Docker Compose)
`docker-compose.yml` runs:
- `postgres` on `:5432`
- `redis` on `:6379`
- `gateway` on `:3001`
- `dashboard` on `:3000`

### Production (Primary): VM + Docker Compose
This project’s primary production path is **VM-based deployment** (e.g. EC2) running Docker containers.

- **Images**: published to GHCR and referenced by `deploy/docker-compose.prod.yml`
- **Stateful deps**:
  - Postgres is typically managed (Neon/RDS/etc) in production
  - Redis is typically managed (Upstash/Elasticache/etc) in production
- **Gateway**:
  - connects to Postgres + Redis via env vars
  - exposes `:3001` (or behind a reverse proxy)
- **Dashboard**:
  - configured at runtime via `GATEWAY_API_URL`
  - exposes `:3000` (or behind a reverse proxy)

Typical VM layout:
- `docker compose up -d` starts gateway/dashboard/redis (if you run redis locally)
- optionally add Nginx/Caddy in front for `80/443` + TLS

### Kubernetes (optional)
`k8s/` is included as an optional deployment path (manifests + ingress), but VM + Docker is the primary approach for this repo.

### Terraform (AWS)
`infra/aws/` provides modules for:
- IAM role/policies
- SSM parameter storage (configs + secrets)
- EC2 compute bootstrap

## Security Notes
- **Do not commit real credentials** (DB/Redis URLs, passwords, tokens) anywhere in the repo.
- On a **VM deployment**, prefer:
  - injecting env vars via your CI/CD
  - storing secrets in **AWS SSM / Secrets Manager** and pulling them at boot
  - putting secrets in a root-owned env file on the VM (locked permissions), not in git


