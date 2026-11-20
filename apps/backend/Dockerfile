# ==============================================================================
# Stage 1: Build & Dependencies
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy workspace package manifests
COPY package.json package-lock.json ./
COPY packages/shared-constants/package.json ./packages/shared-constants/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY apps/backend/package.json ./apps/backend/

# Clean reproducible install
RUN npm ci

# Copy source code
COPY packages/ ./packages/
COPY apps/backend/ ./apps/backend/

# Build backend service
RUN npm run build:backend

# Prune dev dependencies for lean production image
RUN npm prune --production

# ==============================================================================
# Stage 2: Production Runner
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Security: Install dumb-init for PID 1 signal forwarding and curl for health probes
RUN apk add --no-cache dumb-init curl

ENV NODE_ENV=production
ENV PORT=3000

# Run as unprivileged node user
USER node

# Copy built application and production dependencies
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/packages ./packages
COPY --chown=node:node --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --chown=node:node --from=builder /app/apps/backend/package.json ./apps/backend/

EXPOSE 3000

# Container liveness health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/health/live || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "apps/backend/dist/apps/backend/src/main.js"]
