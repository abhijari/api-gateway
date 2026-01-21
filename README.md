# API Gateway Platform (0 → Hero)

A mini AWS API Gateway–style platform: **API key auth**, **rate limiting**, **reverse proxy**, and a **dashboard** to manage keys + view usage.

If you want the deep dive, see **`ARCHITECTURE.md`**.

## What You Get

- **Reverse proxy**: `ALL /proxy/*` forwards to your upstream (`INTERNAL_API_BASE_URL`)
- **API key auth**: `X-API-Key` header or `?api_key=...`
- **Rate limits**: per-minute + per-day (Redis)
- **Usage logs**: latency + status codes (Postgres)
- **Dashboard UI**: create keys, view logs, view per-key stats

## Repo Layout

```text
api-gateway/
  gateway/        # Express API gateway (TS) + Prisma
  dashboard/      # Next.js dashboard (App Router)
  shared/         # Shared types/utils (optional)
  docker/         # Entrypoints + env loaders
  k8s/            # Kubernetes manifests
  infra/aws/      # Terraform modules (IAM/SSM/EC2)
  deploy/         # Production docker-compose (GHCR images)
  docker-compose.yml
```

## Tech Stack

- **Gateway**: Node.js + Express + TypeScript + Prisma
- **DB**: PostgreSQL
- **Rate limit store**: Redis
- **Dashboard**: Next.js 14 + Tailwind + shadcn/ui

## Quickstart (Recommended): Docker Compose

### Prereqs
- Docker + Docker Compose

### Start everything

```bash
docker-compose up
```

This starts:
- Postgres on `localhost:5432`
- Redis on `localhost:6379`
- Gateway on `localhost:3001`
- Dashboard on `localhost:3000`

### First run (create key + test proxy)
- Open dashboard: `http://localhost:3000/login`
- Login with any email (creates/gets a user)
- Create an API key (copy it — you may only see it once)

Test the gateway:

```bash
curl -H "X-API-Key: YOUR_API_KEY" \
  http://localhost:3001/proxy/posts/1
```

By default (compose), the gateway proxies to `https://jsonplaceholder.typicode.com`.

## Local Development (No Docker)

### 1) Start Postgres + Redis
- Run locally, or use Docker for just dependencies.

### 2) Gateway

```bash
cd gateway
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### 3) Dashboard

```bash
cd dashboard
npm install
cp .env.example .env
npm run dev
```

## Configuration

### Gateway env (typical)
- **`PORT`**: default `3001`
- **`DATABASE_URL`**: Postgres connection string
- **`REDIS_URL`**: full redis URL (optional)
- **`REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD`**: redis parts (if no `REDIS_URL`)
- **`INTERNAL_API_BASE_URL`**: upstream base URL for proxying

### Dashboard env (runtime)
- **`GATEWAY_API_URL`**: base URL of the gateway (e.g. `http://localhost:3001`)

The dashboard reads this at runtime via `GET /api/runtime-config` so you don’t need `NEXT_PUBLIC_*`.

## Gateway API Reference

### Health
- `GET /health`

### Proxy (requires API key)
- `ALL /proxy/*`

### Users
- `POST /users` body: `{ "email": "you@example.com" }`
- `GET /users/by-email?email=you@example.com`

### API Keys
- `POST /keys` body: `{ userId, limitPerMinute?, limitPerDay? }`
- `GET /keys` (optional `?userId=...`)
- `GET /keys/:id`
- `PATCH /keys/:id` body: `{ active?, limitPerMinute?, limitPerDay? }`
- `DELETE /keys/:id`

### Usage
- `GET /usage/:keyId` (optional `?limit=50`)

## Production Deployment Options

### Primary: VM (Docker) — recommended
This repo is set up primarily for **running on a VM** (EC2 or any Linux VM) using Docker + Docker Compose, with prebuilt images in GHCR.

#### VM prerequisites
- A Linux VM (Ubuntu/Debian recommended)
- Docker + Docker Compose plugin installed
- Inbound ports opened (typical):
  - `80/443` (if you add a reverse proxy like Nginx/Caddy)
  - `3000` (dashboard) and `3001` (gateway) if exposing directly
  - `6379` only if Redis is external and you need to reach it (don’t expose publicly)

#### 1) Copy production compose to the VM
Use `deploy/docker-compose.prod.yml` on your VM (rename to `docker-compose.yml` if you like).

#### 2) Configure environment
`deploy/docker-compose.prod.yml` expects:
- `IMAGE_TAG` (example: `latest`)
- `ENV` (your environment identifier)

You also need to provide runtime config for the services (gateway + dashboard). The simplest approach on a VM is to create a `.env` file next to your compose file and pass env vars through compose.

At minimum, ensure the gateway has:
- `DATABASE_URL`
- `REDIS_URL` (or `REDIS_HOST`/`REDIS_PORT`/`REDIS_PASSWORD`)
- `INTERNAL_API_BASE_URL`

And the dashboard has:
- `GATEWAY_API_URL` (example: `http://<vm-ip-or-domain>:3001`)

#### 3) Start
From the directory containing the compose file:

```bash
docker compose up -d
docker compose ps
```

#### 4) Verify
- Gateway health: `GET http://<host>:3001/health`
- Dashboard: `http://<host>:3000`

#### Logs / troubleshooting on VM

```bash
docker compose logs -f gateway
docker compose logs -f dashboard
```

#### Updating (VM)
To update to a new image tag:

```bash
export IMAGE_TAG=latest
docker compose pull
docker compose up -d
```

### Terraform (AWS) for VM provisioning
See `infra/aws/` for IAM + SSM + EC2 building blocks.

### Kubernetes (optional)
`k8s/` is provided as an optional path, but the primary production setup for this project is **VM + Docker**.

## Troubleshooting

- **Ports busy (3000/3001/5432/6379)**: stop conflicting services or update ports in `docker-compose.yml`.
- **DB migration issues**:
  - `cd gateway && npm run prisma:generate && npm run prisma:migrate`
- **Redis issues**:
  - verify redis is reachable; gateway rate limiting fails open on redis errors.

## Security Notes

- Never commit real credentials (DB/Redis URLs, passwords, tokens) into git.
- Prefer injecting secrets via CI, or storing them in **SSM/Secrets Manager** and loading them on the VM at boot.

## License

MIT
