# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Start Services
```bash
docker-compose up
```

### 2. Access Dashboard
- Open http://localhost:3000
- Login with any email (e.g., `test@example.com`)

### 3. Create API Key
- Click "Create API Key" in the dashboard
- Copy your API key (you'll only see it once!)

## 📝 Test the Gateway

```bash
# Replace YOUR_API_KEY with your actual key
curl -H "X-API-Key: YOUR_API_KEY" \
     http://localhost:3001/proxy/posts/1
```

This will forward the request to `https://jsonplaceholder.typicode.com/posts/1`

## 🎯 Key Features

- ✅ Reverse proxy with `/proxy/*` endpoint
- ✅ API key authentication
- ✅ Rate limiting (per minute and per day)
- ✅ Usage logging and analytics
- ✅ Modern dashboard UI

## 📊 View Usage

- **All Logs**: http://localhost:3000/dashboard/logs
- **Key Statistics**: http://localhost:3000/dashboard/usage/[keyId]

## 🔧 Configuration

Edit `gateway/.env` to change:
- `INTERNAL_API_BASE_URL` - Where requests are forwarded
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_HOST` - Redis connection

## 🐛 Troubleshooting

**Port already in use?**
- Stop other services using ports 3000, 3001, 5432, or 6379
- Or modify ports in `docker-compose.yml`

**Database errors?**
```bash
cd gateway
npm run prisma:migrate
```

**Redis connection issues?**
- Check Redis is running: `docker-compose ps`
- Verify `REDIS_HOST` in `gateway/.env`

