# ---------- Build stage ----------
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY dashboard/package.json ./dashboard/package.json

RUN npm ci

# ACCEPT BUILD ARG
ARG NEXT_PUBLIC_GATEWAY_API_URL
# EXPOSE TO NEXT BUILD
ENV NEXT_PUBLIC_GATEWAY_API_URL=$NEXT_PUBLIC_GATEWAY_API_URL

COPY dashboard ./dashboard
RUN npm run build --workspace=dashboard

# ---------- Runtime stage ----------
FROM node:18-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY dashboard/package.json ./dashboard/package.json

RUN npm ci --workspace=dashboard --omit=dev

COPY --from=builder /app/dashboard/.next ./dashboard/.next

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=dashboard"]
