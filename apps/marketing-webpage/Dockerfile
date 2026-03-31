FROM node:24-alpine AS base

RUN npm install -g pnpm
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN mkdir -p $PNPM_HOME

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN pnpm add -g turbo@^2
COPY . .

RUN turbo prune marketing-webpage --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

ARG PATH_PREFIX=
ENV NEXT_PUBLIC_BASE_PATH=${PATH_PREFIX}

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

ENV DATABASE_URL=postgresql://placeholder:5432
ENV DATABASE_USER=placeholder
ENV DATABASE_PASSWORD=placeholder
ENV DATABASE_NAME=placeholder

# Build the project
COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=marketing-webpage

FROM base AS runner
WORKDIR /app

EXPOSE 3000

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/marketing-webpage/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/marketing-webpage/.next/static ./apps/marketing-webpage/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/marketing-webpage/public ./apps/marketing-webpage/public

CMD ["node", "apps/marketing-webpage/server.js"]