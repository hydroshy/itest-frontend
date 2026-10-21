# Multi-stage Dockerfile for ITEST Frontend Shell (Vue 3 + Vite)

# --- Stage 1: Build Stage ---
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package manifests & configuration
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc* tsconfig*.json vite.config.ts index.html ./
COPY packages/ ./packages/
COPY scripts/ ./scripts/
COPY src/ ./src/
COPY plugins/ ./plugins/

# Install dependencies
RUN pnpm install --frozen-lockfile=false

# Build SDK and generate plugin registry
RUN pnpm run sdk:build
RUN pnpm run plugins:generate

# Build production assets
RUN pnpm run build

# --- Stage 2: Production Nginx Server ---
FROM nginx:1.27-alpine

LABEL maintainer="ITEST Team <contact@itest.local>"
LABEL description="ITEST Modular Frontend Shell with Dynamic Plugin Extension System"

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
