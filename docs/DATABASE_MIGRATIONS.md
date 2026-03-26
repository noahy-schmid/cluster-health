# Database Migration System

This repository uses a database-per-environment approach for database migrations that supports isolated deployments for PRs, staging, and production.

## Overview

The database migration system creates separate PostgreSQL databases for different deployments, using the same database server:

- **Production**: Uses default database name (e.g., `deinsalon`)
- **Staging** (develop branch): Uses staging database (e.g., `deinsalon_staging`)
- **PR Previews**: Uses PR-specific databases (e.g., `pr_123`)

## Architecture

### Database Configuration

The `scripts/database-config.ts` utility provides functions for building database connection URLs from component parts:

- `DATABASE_HOST` - PostgreSQL server host
- `DATABASE_PORT` - PostgreSQL server port (default: 5432)
- `DATABASE_USER` - Database user
- `DATABASE_PASSWORD` - Database password
- `DATABASE_DATABASE` - Default database name

For **preview deployments** (PR environments), the system uses `DOKPLOY_DEPLOY_URL` to automatically determine the database name:

- URL format: `https://pr-123-subdomain.domain.com`
- Extracts: `pr-123` → database name: `pr_123`

### Migration Script

The `scripts/migrate-database.ts` script orchestrates migrations across all three domains:

1. Determines the target database based on environment variables
2. Creates the database if it doesn't exist
3. Runs `db:push` for each domain (auth, salon, website)

## Usage

### Local Development

For local development with default database:

```bash
# Reset database (drop all schemas and recreate)
pnpm db:reset

# Or manually run migrations
pnpm db:migrate
```

### Preview Deployments (Dokploy)

For PR preview deployments, set environment variables:

```bash
export NODE_ENV=development
export DOKPLOY_DEPLOY_URL=https://pr-123-app.example.com
export DATABASE_HOST=dev-db.example.com
export DATABASE_USER=postgres
export DATABASE_PASSWORD=secretpassword
export DATABASE_DATABASE=deinsalon  # Ignored for previews, uses pr_123 instead

pnpm db:migrate
```

This will:

1. Extract `pr-123` from the deploy URL
2. Create/use database `pr_123`
3. Run all migrations

### Staging/Production Deployments

For staging or production:

```bash
# Staging
export NODE_ENV=development
export DATABASE_URL=postgresql://user:pass@host:5432/deinsalon_staging
pnpm db:migrate

# Production
export NODE_ENV=production
export DATABASE_URL=postgresql://user:pass@host:5432/deinsalon
pnpm db:migrate
```

### CI/CD Integration

The GitHub Actions workflow `.github/workflows/db-migration.yml` automatically:

1. **On PR creation/update**:
   - Sets `NODE_ENV=development`
   - Sets `DOKPLOY_DEPLOY_URL` with PR number
   - Migrates to PR-specific database (e.g., `pr_123`)

2. **On push to develop**:
   - Sets `NODE_ENV=development`
   - Uses staging database configuration

3. **On push to main**:
   - Sets `NODE_ENV=production`
   - Uses production database configuration

## Environment Variables

### Component-based Configuration

When `DATABASE_URL` is not provided, the system builds it from:

- `DATABASE_HOST` - PostgreSQL server host
- `DATABASE_PORT` - Port (default: 5432)
- `DATABASE_USER` - Database user
- `DATABASE_PASSWORD` - Database password
- `DATABASE_DATABASE` - Base database name

### Preview Deployment Variables

- `NODE_ENV` - Must be `development` for preview deployments
- `DOKPLOY_DEPLOY_URL` - Deploy URL containing PR number (e.g., `https://pr-123-app.example.com`)

The system extracts the PR number from the URL and creates a database named `pr_123`.

## Database Structure

All three domains use the same database with separate schemas:

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

### Website Domain (`public` schema)

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

To clean up PR-specific databases after a PR is closed:

```sql
-- Replace pr_123 with the actual PR database name
DROP DATABASE IF EXISTS pr_123;
```

Consider implementing automatic cleanup via GitHub Actions when PRs are closed.

## Troubleshooting

### Migration Fails

If migrations fail:

1. Check database connection settings
2. Verify user has CREATE DATABASE privilege
3. Check logs for specific error messages

### Database Creation Fails

Ensure the database user has sufficient privileges:

```sql
-- Grant database creation privilege
ALTER USER your_user CREATEDB;
```

### Testing Locally with Preview Database

To test PR-style deployments locally:

```bash
export NODE_ENV=development
export DOKPLOY_DEPLOY_URL=https://pr-999-test.example.com
export DATABASE_HOST=localhost
export DATABASE_USER=postgres
export DATABASE_PASSWORD=postgres
pnpm db:migrate
```

This will create a `pr_999` database on your local PostgreSQL server.

## Adding New Tables

When adding new tables to any domain:

1. Update the schema file in the domain package (e.g., `packages/auth-domain/src/schema.ts`)
2. Generate new migrations: `pnpm --filter @repo/{domain} db:generate`
3. Test locally: `pnpm db:push`
4. Commit the generated migration files

The system will automatically apply migrations to the correct database during deployment.
