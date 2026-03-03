FROM node:22-alpine AS base

RUN npm install -g pnpm
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN mkdir -p $PNPM_HOME

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app

RUN pnpm add -g turbo@^2
COPY . .

# Generate a partial monorepo with a pruned lockfile for a target workspace.
RUN turbo prune manage-salon-webpage --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

ENV DATABASE_URL=placeholderdb

# Build the project
COPY --from=builder /app/out/full/ .
RUN pnpm turbo run build --filter=manage-salon-webpage

FROM base AS runner
WORKDIR /app

EXPOSE 3000

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/manage-salon-webpage/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/manage-salon-webpage/.next/static ./apps/manage-salon-webpage/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/manage-salon-webpage/public ./apps/manage-salon-webpage/public

CMD ["node", "apps/manage-salon-webpage/server.js"]
