# ---------- Build stage ----------
FROM node:18-alpine AS builder

WORKDIR /app

RUN apk add --no-cache aws-cli

COPY package.json package-lock.json ./
COPY dashboard/package.json ./dashboard/package.json

RUN npm ci

COPY dashboard ./dashboard
RUN npm run build --workspace=dashboard

# ---------- Runtime stage ----------
FROM node:18-alpine

WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache aws-cli

COPY package.json package-lock.json ./
COPY dashboard/package.json ./dashboard/package.json

RUN npm ci --workspace=dashboard --omit=dev

COPY --from=builder /app/dashboard/.next ./dashboard/.next

EXPOSE 3000

# Runtime entrypoint
COPY docker/load_dashboard_env.sh /usr/local/bin/load_dashboard_env.sh
COPY docker/dashboard-entrypoint.sh /entrypoint.sh

RUN chmod +x /usr/local/bin/load_dashboard_env.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

CMD ["npm", "run", "start", "--workspace=dashboard"]
