# ---------- Build stage ----------
FROM node:18-alpine AS builder

WORKDIR /app

# Copy only dependency files first (better caching)
COPY package.json package-lock.json ./

# Copy workspace package.json
COPY gateway/package.json ./gateway/package.json

# Install deps for all workspaces
RUN npm ci

# Copy prisma
COPY gateway/prisma ./gateway/prisma
RUN npx prisma generate --schema=./gateway/prisma/schema.prisma

# Copy source
COPY gateway/tsconfig.json ./gateway/tsconfig.json
COPY gateway/src ./gateway/src

# Build only gateway
RUN npm run build --workspace=gateway

# ---------- Runtime stage ----------
FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY gateway/package.json ./gateway/package.json

RUN npm ci --omit=dev

COPY --from=builder /app/gateway/prisma ./gateway/prisma

RUN npx prisma generate --schema=./gateway/prisma/schema.prisma

COPY --from=builder /app/gateway/dist ./dist

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy --schema=./gateway/prisma/schema.prisma && node dist/index.js"]