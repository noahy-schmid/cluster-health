# Dokploy Configuration Guide

This guide explains how to configure Dokploy to automatically migrate databases for different deployment environments.

## Overview

Dokploy should be configured to:

1. Set appropriate environment variables based on deployment type
2. Run database migrations before starting the application
3. Use schema prefixes for PR preview deployments

## Environment Variables

### All Deployments

Required environment variables for all deployments:

```bash
DATABASE_URL=postgresql://user:password@host:5432/database_name
JWT_SECRET=your-jwt-secret
NODE_ENV=production
S3_URL=your-s3-url
S3_SALON_ACCESS_KEY=your-access-key
S3_SALON_SECRET_KEY=your-secret-key
S3_WEBSITE_BUCKET_NAME=your-bucket-name
S3_REGION=your-region
```

### Production Deployment (main branch)

```bash
DEPLOYMENT_PREFIX=
# Empty prefix uses default schemas: auth, salon, public
```

### Staging Deployment (develop branch)

```bash
DEPLOYMENT_PREFIX=staging
# Creates schemas: staging_auth, staging_salon, staging_website
```

### PR Preview Deployments

```bash
DEPLOYMENT_PREFIX=pr${PR_NUMBER}
# Example: pr123 creates schemas: pr123_auth, pr123_salon, pr123_website
```

## Dokploy Build Configuration

### 1. Build Command

For Next.js applications:

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Build domain packages
pnpm --filter @repo/auth-domain build
pnpm --filter @repo/salon-domain build
pnpm --filter @repo/website-domain build

# Run database migrations
pnpm db:migrate

# Build the application
pnpm --filter {app-name} build
```

Replace `{app-name}` with the specific app (e.g., `manage-salon-webpage`, `salon-webpage`, `marketing-webpage`).

### 2. Start Command

```bash
pnpm --filter {app-name} start
```

### 3. Pre-Deploy Hook (Alternative Approach)

Alternatively, you can run migrations in a pre-deploy hook:

```bash
#!/bin/bash
set -e

echo "Running database migrations..."
pnpm db:migrate

echo "Migrations completed successfully!"
```

## Docker Configuration

If using Docker with Dokploy, update your Dockerfile to include migration step:

```dockerfile
# ... existing build steps ...

# Run migrations during build
ARG DATABASE_URL
ARG DEPLOYMENT_PREFIX
ENV DATABASE_URL=$DATABASE_URL
ENV DEPLOYMENT_PREFIX=$DEPLOYMENT_PREFIX

RUN pnpm db:migrate

# ... rest of Dockerfile ...
```

## Dokploy Project Setup

### Production Project

1. Create a new project for production
2. Set environment variables (no DEPLOYMENT_PREFIX or empty string)
3. Configure automatic deployments from `main` branch
4. Set build command to include `pnpm db:migrate`

### Staging Project

1. Create a new project for staging
2. Set `DEPLOYMENT_PREFIX=staging`
3. Configure automatic deployments from `develop` branch
4. Set build command to include `pnpm db:migrate`

### PR Preview Configuration

For each PR preview:

1. Dokploy should automatically create a new deployment
2. Set `DEPLOYMENT_PREFIX=pr${PR_NUMBER}` where `${PR_NUMBER}` is the GitHub PR number
3. Use the same build configuration
4. Migrations will automatically create PR-specific schemas

Example Dokploy webhook payload processing:

```javascript
// Extract PR number from webhook
const prNumber = webhook.pull_request.number;

// Set environment variable
const deploymentPrefix = `pr${prNumber}`;

// Create deployment with prefix
createDeployment({
  env: {
    ...baseEnvVars,
    DEPLOYMENT_PREFIX: deploymentPrefix,
  },
});
```

## Migration Execution

The migration script (`pnpm db:migrate`) will:

1. Read the `DEPLOYMENT_PREFIX` environment variable
2. Update Drizzle configurations to use prefixed schemas
3. Run `db:push` for each domain package:
   - `@repo/auth-domain`
   - `@repo/salon-domain`
   - `@repo/website-domain`
4. Create or update tables in the prefixed schemas

## Monitoring

To verify migrations:

```bash
# Connect to database
psql $DATABASE_URL

# List all schemas
\dn

# You should see:
# - auth, salon, public (production)
# - staging_auth, staging_salon, staging_website (staging)
# - pr123_auth, pr123_salon, pr123_website (PR previews)

# Check tables in a specific schema
\dt staging_auth.*
```

## Cleanup

### Manual Cleanup

To clean up old PR schemas:

```sql
-- List all PR schemas
SELECT nspname FROM pg_namespace WHERE nspname LIKE 'pr%';

-- Drop specific PR schemas
DROP SCHEMA IF EXISTS pr123_auth CASCADE;
DROP SCHEMA IF EXISTS pr123_salon CASCADE;
DROP SCHEMA IF EXISTS pr123_website CASCADE;
```

### Automated Cleanup (Recommended)

Create a scheduled Dokploy job or GitHub Action to clean up schemas from closed PRs:

```bash
#!/bin/bash
# cleanup-pr-schemas.sh

# Get list of open PR numbers from GitHub
OPEN_PRS=$(gh pr list --json number -q '.[].number')

# Connect to database and drop schemas for closed PRs
psql $DATABASE_URL <<EOF
DO \$\$
DECLARE
  schema_name text;
BEGIN
  FOR schema_name IN
    SELECT nspname FROM pg_namespace
    WHERE nspname LIKE 'pr%_auth'
    AND SUBSTRING(nspname FROM 3 FOR POSITION('_' IN SUBSTRING(nspname FROM 3))-1)::int NOT IN ($OPEN_PRS)
  LOOP
    EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE', REPLACE(schema_name, '_auth', '_auth'));
    EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE', REPLACE(schema_name, '_auth', '_salon'));
    EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE', REPLACE(schema_name, '_auth', '_website'));
    RAISE NOTICE 'Dropped schemas for PR: %', SUBSTRING(schema_name FROM 3);
  END LOOP;
END
\$\$;
EOF
```

## Troubleshooting

### Database Connection Issues

If migrations fail with connection errors:

1. Verify `DATABASE_URL` is correct
2. Check database server is accessible from Dokploy
3. Verify database user has CREATE SCHEMA privileges

```sql
-- Grant schema creation privilege
GRANT CREATE ON DATABASE your_database TO your_user;
```

### Schema Already Exists

If you get "schema already exists" errors:

1. This is expected for updates - migrations are idempotent
2. If you need to reset: Drop the schema and rerun migrations
3. For PR deployments: Ensure PR number is unique

### Application Can't Find Tables

If the application can't find tables after migration:

1. Verify `DEPLOYMENT_PREFIX` matches between migration and application
2. Check that all domain packages use the prefix correctly
3. Restart the application to reload schema configuration

## Best Practices

1. **Always run migrations before starting the app** - Use pre-deploy hooks or build commands
2. **Use the same DATABASE_URL** for all environments (different schemas provide isolation)
3. **Monitor schema growth** - PR schemas can accumulate over time
4. **Set up automated cleanup** - Remove schemas for closed PRs
5. **Test locally first** - Use `DEPLOYMENT_PREFIX=test` to verify migrations locally
6. **Keep migrations in source control** - Commit Drizzle migration files
7. **Review migration output** - Check Dokploy logs to ensure migrations succeed
