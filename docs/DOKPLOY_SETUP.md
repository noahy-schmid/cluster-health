# Dokploy Configuration Guide

This guide explains how to configure Dokploy to automatically manage separate databases for different deployment environments.

## Overview

The database migration system creates separate PostgreSQL databases for different deployments on the same database server:

- **Production**: Uses default database name (e.g., `deinsalon`)
- **Staging** (develop branch): Uses staging database (e.g., `deinsalon_staging`)
- **PR Previews**: Uses PR-specific databases (e.g., `pr_123`)

## Environment Variables

### Component-Based Database Configuration

Instead of providing a single `DATABASE_URL`, configure database connection using component parts:

```bash
DATABASE_HOST=your-database-host.com
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your-secure-password
DATABASE_DATABASE=deinsalon
```

The system will automatically build the connection URL from these components.

### Application Environment Variables

Required for all deployments:

```bash
NODE_ENV=production  # or development for PR previews
JWT_SECRET=your-jwt-secret
S3_URL=your-s3-url
S3_SALON_ACCESS_KEY=your-access-key
S3_SALON_SECRET_KEY=your-secret-key
S3_WEBSITE_BUCKET_NAME=your-bucket-name
S3_REGION=your-region
```

### Preview Deployment Variables

For PR preview deployments on the **development database server**, set:

```bash
NODE_ENV=development
DOKPLOY_DEPLOY_URL=https://pr-123-app.example.com
DATABASE_HOST=dev-db.example.com
DATABASE_USER=postgres
DATABASE_PASSWORD=dev-password
DATABASE_DATABASE=deinsalon  # Ignored for previews, uses pr_123 instead
```

The system will:

1. Extract `pr-123` from the `DOKPLOY_DEPLOY_URL`
2. Convert it to a valid database name: `pr_123`
3. Create the database if it doesn't exist
4. Run migrations on that database

## Database Server Setup

You should have three separate database servers:

### 1. Development Database Server

- Used for PR preview deployments
- Each PR gets its own database (e.g., `pr_123`, `pr_456`)
- Configure with development credentials
- Should be accessible from Dokploy

### 2. Staging Database Server

- Used for develop branch deployments
- Single staging database (e.g., `deinsalon_staging`)
- Configure with staging credentials

### 3. Production Database Server

- Used for main branch deployments
- Production database (e.g., `deinsalon`)
- Configure with production credentials
- Highest security and backup requirements

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
ARG DATABASE_HOST
ARG DATABASE_PORT
ARG DATABASE_USER
ARG DATABASE_PASSWORD
ARG DATABASE_DATABASE
ARG NODE_ENV
ARG DOKPLOY_DEPLOY_URL

ENV DATABASE_HOST=$DATABASE_HOST
ENV DATABASE_PORT=$DATABASE_PORT
ENV DATABASE_USER=$DATABASE_USER
ENV DATABASE_PASSWORD=$DATABASE_PASSWORD
ENV DATABASE_DATABASE=$DATABASE_DATABASE
ENV NODE_ENV=$NODE_ENV
ENV DOKPLOY_DEPLOY_URL=$DOKPLOY_DEPLOY_URL

RUN pnpm db:migrate

# ... rest of Dockerfile ...
```

## Dokploy Project Setup

### Production Project

1. Create a new project for production
2. Set environment variables:
   ```bash
   NODE_ENV=production
   DATABASE_HOST=prod-db.example.com
   DATABASE_USER=prod_user
   DATABASE_PASSWORD=secure-prod-password
   DATABASE_DATABASE=deinsalon
   # ... other app variables
   ```
3. Configure automatic deployments from `main` branch
4. Set build command to include `pnpm db:migrate`

### Staging Project

1. Create a new project for staging
2. Set environment variables:
   ```bash
   NODE_ENV=development
   DATABASE_HOST=staging-db.example.com
   DATABASE_USER=staging_user
   DATABASE_PASSWORD=staging-password
   DATABASE_DATABASE=deinsalon_staging
   # ... other app variables
   ```
3. Configure automatic deployments from `develop` branch
4. Set build command to include `pnpm db:migrate`

### PR Preview Configuration

For each PR preview:

1. Dokploy should automatically create a new deployment
2. Set environment variables:
   ```bash
   NODE_ENV=development
   DOKPLOY_DEPLOY_URL=https://pr-${PR_NUMBER}-app.example.com
   DATABASE_HOST=dev-db.example.com
   DATABASE_USER=dev_user
   DATABASE_PASSWORD=dev-password
   DATABASE_DATABASE=deinsalon  # Will be ignored
   # ... other app variables
   ```
3. The system will automatically:
   - Extract PR number from `DOKPLOY_DEPLOY_URL`
   - Create database `pr_${PR_NUMBER}` (e.g., `pr_123`)
   - Run migrations on the new database

Example Dokploy webhook payload processing:

```javascript
// Extract PR number from webhook
const prNumber = webhook.pull_request.number;

// Set environment variables
const envVars = {
  ...baseEnvVars,
  NODE_ENV: "development",
  DOKPLOY_DEPLOY_URL: `https://pr-${prNumber}-app.example.com`,
  DATABASE_HOST: process.env.DEV_DATABASE_HOST,
  DATABASE_USER: process.env.DEV_DATABASE_USER,
  DATABASE_PASSWORD: process.env.DEV_DATABASE_PASSWORD,
  DATABASE_DATABASE: "deinsalon", // Will be ignored, pr_${prNumber} will be used
};

// Create deployment
createDeployment({
  env: envVars,
});
```

## Migration Execution

The migration script (`pnpm db:migrate`) will:

1. Read database configuration from environment variables
2. For development with `DOKPLOY_DEPLOY_URL`: Extract PR number and determine target database
3. Create the target database if it doesn't exist
4. Build `DATABASE_URL` from components
5. Run `db:push` for each domain package:
   - `@repo/auth-domain` → `auth` schema
   - `@repo/salon-domain` → `salon` schema
   - `@repo/website-domain` → `public` schema
6. Create or update tables in their respective schemas

All three domains use the same database but different schemas:

- Auth Domain: `auth` schema
- Salon Domain: `salon` schema
- Website Domain: `public` schema

## Monitoring

### Verify Databases

To verify database creation:

```bash
# Connect to database server
psql -h your-db-host -U postgres

# List all databases
\l

# You should see:
# - deinsalon (production)
# - deinsalon_staging (staging)
# - pr_123, pr_456, etc. (PR previews)
```

### Verify Schemas

To verify schema creation in a specific database:

```bash
# Connect to specific database
psql -h your-db-host -U postgres -d pr_123

# List all schemas
\dn

# You should see:
# - auth
# - salon
# - public

# Check tables in each schema
\dt auth.*
\dt salon.*
\dt public.*
```

## Cleanup

### Manual Cleanup

To clean up old PR databases:

```sql
-- Connect to PostgreSQL server
psql -h your-db-host -U postgres

-- List all PR databases
SELECT datname FROM pg_database WHERE datname LIKE 'pr_%';

-- Drop specific PR database
DROP DATABASE IF EXISTS pr_123;
```

### Automated Cleanup (Recommended)

Create a scheduled Dokploy job or GitHub Action to clean up databases from closed PRs:

```bash
#!/bin/bash
# cleanup-pr-databases.sh

# Get list of open PR numbers from GitHub
OPEN_PRS=$(gh pr list --json number -q '.[].number' | tr '\n' ',' | sed 's/,$//')

# Connect to database server and drop databases for closed PRs
psql -h $DATABASE_HOST -U $DATABASE_USER <<EOF
DO \$\$
DECLARE
  db_name text;
  pr_number text;
BEGIN
  FOR db_name IN
    SELECT datname FROM pg_database WHERE datname LIKE 'pr_%'
  LOOP
    -- Extract PR number from database name (pr_123 -> 123)
    pr_number := SUBSTRING(db_name FROM 4);

    -- Check if PR is closed
    IF NOT (',' || '$OPEN_PRS' || ',') LIKE ('%,' || pr_number || ',%') THEN
      EXECUTE format('DROP DATABASE IF EXISTS %I', db_name);
      RAISE NOTICE 'Dropped database: %', db_name;
    END IF;
  END LOOP;
END
\$\$;
EOF
```

Schedule this script to run daily or weekly to keep your development database server clean.

## Troubleshooting

### Database Connection Issues

If migrations fail with connection errors:

1. Verify database credentials are correct
2. Check database server is accessible from Dokploy
3. Verify database user has `CREATEDB` privilege:

```sql
-- Grant database creation privilege
ALTER USER your_user CREATEDB;
```

### Database Already Exists

If you get "database already exists" errors:

1. This is normal - the system checks and skips creation if database exists
2. Migrations will run on the existing database
3. Ensure the database isn't in use by another PR

### Application Can't Find Tables

If the application can't find tables after migration:

1. Verify `DOKPLOY_DEPLOY_URL` is set correctly for PR previews
2. Check that migrations completed successfully in build logs
3. Verify the application is connecting to the correct database
4. Check domain packages are using correct schema names (auth, salon, public)
5. Restart the application to reload configuration

### Insufficient Privileges

If you get permission errors during database creation:

```sql
-- Connect as superuser and grant necessary privileges
ALTER USER your_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE pr_123 TO your_user;
```

## Best Practices

1. **Always run migrations before starting the app** - Use pre-deploy hooks or build commands
2. **Use separate database servers** - Development, staging, and production should be isolated
3. **Monitor database growth** - PR databases can accumulate over time
4. **Set up automated cleanup** - Remove databases for closed PRs regularly
5. **Test locally first** - Use `DOKPLOY_DEPLOY_URL=https://pr-999-test.local` to verify migrations locally
6. **Keep migrations in source control** - Commit Drizzle migration files
7. **Review migration output** - Check Dokploy logs to ensure migrations succeed
8. **Use strong passwords** - Especially for production database server
9. **Backup regularly** - Ensure production and staging databases are backed up
10. **Limit database user privileges** - Use minimal required permissions for each environment

## Security Considerations

1. **Never commit credentials** - Always use environment variables
2. **Use different credentials per environment** - Don't reuse passwords across environments
3. **Restrict network access** - Database servers should only be accessible from Dokploy
4. **Monitor database access** - Log and review connection attempts
5. **Use SSL/TLS** - Enable encrypted connections to database servers
6. **Regular security audits** - Review database permissions and access logs
