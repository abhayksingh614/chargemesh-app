# ==============================================================================
# Stage 1: Build & Dependencies
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace package manifests
COPY package.json package-lock.json ./
COPY packages/shared-constants/package.json ./packages/shared-constants/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY apps/admin/package.json ./apps/admin/

# Clean reproducible install
RUN npm ci

# Copy source code
COPY packages/ ./packages/
COPY apps/admin/ ./apps/admin/

# Build Next.js Admin Portal
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build:admin

# ==============================================================================
# Stage 2: Production Runner
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache dumb-init curl

ENV NODE_ENV=production
ENV PORT=3001
ENV NEXT_TELEMETRY_DISABLED=1

# Security: Create and run as unprivileged nextjs user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

USER nextjs

COPY --chown=nextjs:nodejs --from=builder /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs --from=builder /app/packages ./packages
COPY --chown=nextjs:nodejs --from=builder /app/apps/admin ./apps/admin
COPY --chown=nextjs:nodejs --from=builder /app/package.json ./package.json

WORKDIR /app/apps/admin

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:3001 || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["npm", "start"]
