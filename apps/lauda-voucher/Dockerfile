FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.17.1 --activate

# ── Install dependencies ──────────────────────────────────────────────
FROM base AS deps
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/lauda-voucher/package.json ./apps/lauda-voucher/package.json

RUN pnpm install --frozen-lockfile

# ── Build the application ─────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/lauda-voucher/node_modules ./apps/lauda-voucher/node_modules

COPY apps/lauda-voucher ./apps/lauda-voucher
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

WORKDIR /app/apps/lauda-voucher
RUN pnpm build

# ── Production image ──────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/apps/lauda-voucher/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/lauda-voucher/.next/static ./apps/lauda-voucher/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/lauda-voucher/public ./apps/lauda-voucher/public

# Copy drizzle-kit and schema for db:push at startup
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nextjs:nodejs /app/apps/lauda-voucher/node_modules ./apps/lauda-voucher/node_modules
COPY --chown=nextjs:nodejs apps/lauda-voucher/drizzle.config.ts ./apps/lauda-voucher/drizzle.config.ts
COPY --chown=nextjs:nodejs apps/lauda-voucher/lib/schema.ts ./apps/lauda-voucher/lib/schema.ts
COPY --chown=nextjs:nodejs apps/lauda-voucher/start.sh ./apps/lauda-voucher/start.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

WORKDIR /app/apps/lauda-voucher

CMD ["sh", "start.sh"]
