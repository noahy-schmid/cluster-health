# Database Migration System

This repository uses a schema-based approach for database migrations that supports isolated deployments for PRs, staging, and production.

## Overview

The database migration system uses Drizzle ORM and PostgreSQL schemas to provide isolated database environments for different deployments:

- **Production**: Uses default schema names (`auth`, `salon`, `public`)
- **Staging** (develop branch): Uses prefixed schemas (`staging_auth`, `staging_salon`, `staging_website`)
- **PR Previews**: Uses PR-specific prefixed schemas (e.g., `pr123_auth`, `pr123_salon`, `pr123_website`)

## Architecture

### Schema Prefixing

Each domain package has a schema configuration that supports dynamic naming based on the `DEPLOYMENT_PREFIX` environment variable:

- `packages/auth-domain/src/schema-config.ts` - Manages `auth` schema naming
- `packages/salon-domain/src/schema-config.ts` - Manages `salon` schema naming
- `packages/website-domain/src/schema-config.ts` - Manages website schema naming

### Migration Script

The `scripts/migrate-database.ts` script orchestrates migrations across all three domains:

1. Validates the `DEPLOYMENT_PREFIX` environment variable
2. Builds all domain packages
3. Runs `db:push` for each domain with the appropriate schema prefix

## Usage

### Local Development

For local development without prefixes (using default schema names):

```bash
# Reset database (drop all schemas and recreate)
pnpm db:reset

# Or manually run migrations
pnpm db:migrate
```

### Staging/Preview Deployments

For staging or PR preview deployments with schema prefixes:

```bash
# Set the deployment prefix
export DEPLOYMENT_PREFIX=staging  # or pr123 for PR deployments

# Run migrations
pnpm db:migrate
```

This will create and migrate schemas with the prefix:

- `staging_auth` (instead of `auth`)
- `staging_salon` (instead of `salon`)
- `staging_website` (instead of `public`)

### CI/CD Integration

The GitHub Actions workflow `.github/workflows/db-migration.yml` automatically:

1. **On PR creation/update**:
   - Sets `DEPLOYMENT_PREFIX=pr{number}`
   - Migrates to PR-specific schemas (e.g., `pr123_auth`, `pr123_salon`, `pr123_website`)

2. **On push to develop**:
   - Sets `DEPLOYMENT_PREFIX=staging`
   - Migrates to staging schemas

3. **On push to main**:
   - Uses empty prefix
   - Migrates to production schemas (`auth`, `salon`, `public`)

## Environment Variables

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `DEPLOYMENT_PREFIX`: (optional) Prefix for schema names (e.g., `pr123`, `staging`)

The `DEPLOYMENT_PREFIX` must be:

- Alphanumeric characters, hyphens, and underscores only
- Lowercase (recommended)
- Empty for production deployments

## Schema Structure

### Auth Domain (`auth` schema)

- `management_user` - Management users table
- `management_user_role` - User roles table

### Salon Domain (`salon` schema)

- `salons` - Salon information
- `stylists` - Stylist/employee information
- `media_files` - File upload metadata
- `salon_resources` - Salon resources (seats, equipment)
- `service_definitions` - Service catalog
- `service_phases` - Multi-phase service definitions
- `phase_resource_requirements` - Resource requirements per phase
- `employee_service_assignments` - Employee-service assignments

### Website Domain (`public` or prefixed schema)

- `websites` - Website configurations
- `sections` - Website section definitions
- `text_with_image_sections` - Text with image section content
- `gallery_sections` - Gallery section content
- `gallery_images` - Gallery images
- `center_text_sections` - Centered text section content
- `reason_sections` - Reasons/features section content
- `reason_items` - Individual reason items
- `stylists_sections` - Stylists showcase section

## Cleanup

To clean up PR-specific schemas after a PR is closed, you can run:

```sql
-- Replace pr123 with the actual PR number
DROP SCHEMA IF EXISTS pr123_auth CASCADE;
DROP SCHEMA IF EXISTS pr123_salon CASCADE;
DROP SCHEMA IF EXISTS pr123_website CASCADE;
```

Note: Consider implementing automatic cleanup via GitHub Actions when PRs are closed.

## Troubleshooting

### Migration Fails

If migrations fail:

1. Check that `DATABASE_URL` is correctly set
2. Verify the database is accessible
3. Ensure the `DEPLOYMENT_PREFIX` is valid (alphanumeric with hyphens/underscores)
4. Check the Drizzle migration files in each domain's `drizzle/` folder

### Schema Conflicts

If you encounter schema conflicts:

1. Check if the prefixed schema already exists: `\dn` in psql
2. Drop the conflicting schema if safe: `DROP SCHEMA IF EXISTS {prefix}_auth CASCADE;`
3. Re-run migrations

### Testing Locally with Prefix

To test PR-style deployments locally:

```bash
export DEPLOYMENT_PREFIX=test
export DATABASE_URL=postgresql://user:pass@localhost:5432/deinsalon_dev
pnpm db:migrate
```

This will create `test_auth`, `test_salon`, and `test_website` schemas in your local database.

## Adding New Tables

When adding new tables to any domain:

1. Update the schema file in the domain package (e.g., `packages/auth-domain/src/schema.ts`)
2. The schema will automatically use the correct prefix based on `DEPLOYMENT_PREFIX`
3. Generate new migrations: `pnpm --filter @repo/{domain} db:generate`
4. Test locally: `pnpm db:push`
5. Commit the generated migration files

The system will automatically apply the correct schema prefix during deployment.
