# deinsalon monorepo — command runner (https://github.com/casey/just)
#
# Install `just` once:
#   cargo install just     # or: brew install just / winget install Casey.Just
#
# Run `just` with no arguments to list every available recipe.
#
# This is the neutral entrypoint for the repo as it grows polyglot (TS + Rust):
# add new recipes here regardless of the language behind them.

# Path to the local-services compose file and the env file it reads from.
compose := "docker compose --env-file .env -f scripts/dev-services.docker-compose.yml"

# Show all recipes (default when you just run `just`).
default:
    @just --list

# ─── Developer environment ───────────────────────────────────────────────────

# Symlink the shared root .env into the current git worktree. Runs automatically
# after `pnpm install` (root `prepare` script); this is just a manual re-run.
# The real .env is gitignored, so it lives only in the main checkout — a linked
# worktree does not get it and the `dotenv -e .env` wrappers would load nothing.
link-env:
    @node scripts/link-env.mjs

# ─── Local infrastructure (Postgres, MinIO, ...) ─────────────────────────────
# Adding a new service is a compose concern — see
# scripts/dev-services.docker-compose.yml. These recipes need no changes.

# Start all local services and wait until they are healthy. Idempotent:
# already-running services are reused, never duplicated.
services-up:
    {{compose}} up -d --wait
    @echo ""
    @echo "✓ Local services are up:"
    @echo "  Postgres   postgresql://127.0.0.1:5433   (credentials from .env)"
    @echo "  MinIO S3   http://127.0.0.1:9004"
    @echo "  MinIO UI   http://127.0.0.1:9006"
    @echo ""
    @echo "Next: run the db-migrate app before starting the apps."

# Stop and remove the service containers (data volumes are kept).
services-down:
    {{compose}} down

# Restart all services.
services-restart:
    {{compose}} restart

# Show the status of each service.
services-status:
    {{compose}} ps

# Follow the logs of all services (Ctrl-C to stop).
services-logs:
    {{compose}} logs -f --tail=100

# Open a psql shell inside the postgres container.
services-psql:
    {{compose}} exec postgres psql -U "${DATABASE_USER:-postgres}" -d "${DATABASE_ADMIN_DB:-postgres}"

# Stop services AND delete their data volumes. Destructive — asks first.
services-reset:
    {{compose}} down -v
