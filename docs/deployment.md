# Deployment Guide

This document describes how the deinsalon monorepo is deployed to Coolify running on a VPS.

## Overview

Deployments are automated through two GitHub Actions workflows. Both delegate the actual Coolify API
interaction to the [`@repo/deployment`](#deployment-package) TypeScript package.

| Workflow              | File                                    | Purpose                                              |
| --------------------- | --------------------------------------- | ---------------------------------------------------- |
| Docker Build and Push | `.github/workflows/docker.yml`          | Build images, push to GHCR, deploy to Coolify        |
| Coolify PR Cleanup    | `.github/workflows/coolify-cleanup.yml` | Remove ephemeral PR environments when a PR is closed |

### Environments

| Git event                     | Coolify environment                | Image tag     |
| ----------------------------- | ---------------------------------- | ------------- |
| Push to `main`                | **Production**                     | `main`        |
| Push to `develop`             | **Staging**                        | `develop`     |
| Pull Request opened / updated | **Development** (ephemeral per-PR) | `pr-<number>` |

### Applications

Four services are deployed for each environment:

| Application            | Container port | GHCR image                             |
| ---------------------- | -------------- | -------------------------------------- |
| `manage-salon-webpage` | 3000           | `ghcr.io/<owner>/manage-salon-webpage` |
| `salon-webpage`        | 3000           | `ghcr.io/<owner>/salon-webpage`        |
| `marketing-webpage`    | 3000           | `ghcr.io/<owner>/marketing-webpage`    |
| `calendar-service`     | 8080           | `ghcr.io/<owner>/calendar-service`     |

---

## Deployment Package

All Coolify API interaction lives in `packages/deployment`, a standalone TypeScript package that
exposes both a **programmatic API** and a **CLI**. It uses
[`@joshuarileydev/coolify-client`](https://github.com/joshuarileydev/coolify-client) under the hood.

### CLI commands

The package exposes four pnpm scripts that CI calls directly. You can also run them locally
(with the required environment variables set, or via a `.env` file in the package directory):

```sh
# Deploy all services for a given pull request to the Coolify development project
pnpm --filter @repo/deployment run deploy-pr -- --pr-number 42

# Trigger redeployment of all staging services (develop branch)
pnpm --filter @repo/deployment run deploy-staging

# Trigger redeployment of all production services (main branch)
pnpm --filter @repo/deployment run deploy-production

# Delete all Coolify applications created for a closed PR
pnpm --filter @repo/deployment run cleanup-pr -- --pr-number 42
```

### Programmatic API

The package also exports all commands as plain async functions so they can be imported by other
tooling in the monorepo:

```ts
import {
  deployPr,
  deployStaging,
  deployProduction,
  cleanupPr,
  loadDeploymentConfig,
} from "@repo/deployment";

const config = loadDeploymentConfig(); // reads env vars
await deployPr({ prNumber: 42, config });
```

### Environment variables

| Variable                               | Required for        | Description                                                          |
| -------------------------------------- | ------------------- | -------------------------------------------------------------------- |
| `COOLIFY_URL`                          | all commands        | Base URL of the Coolify instance, e.g. `https://coolify.example.com` |
| `COOLIFY_TOKEN`                        | all commands        | Coolify API token                                                    |
| `COOLIFY_SERVER_UUID`                  | `deploy-pr`         | UUID of the server registered in Coolify                             |
| `COOLIFY_DEVELOPMENT_PROJECT_UUID`     | `deploy-pr`         | UUID of the Coolify project for PR environments                      |
| `IMAGE_OWNER`                          | `deploy-pr`         | GitHub organisation / username that owns the GHCR images             |
| `COOLIFY_STAGING_MANAGE_SALON_UUID`    | `deploy-staging`    | UUID of the staging `manage-salon-webpage` app                       |
| `COOLIFY_STAGING_SALON_UUID`           | `deploy-staging`    | UUID of the staging `salon-webpage` app                              |
| `COOLIFY_STAGING_MARKETING_UUID`       | `deploy-staging`    | UUID of the staging `marketing-webpage` app                          |
| `COOLIFY_STAGING_CALENDAR_UUID`        | `deploy-staging`    | UUID of the staging `calendar-service` app                           |
| `COOLIFY_PRODUCTION_MANAGE_SALON_UUID` | `deploy-production` | UUID of the production `manage-salon-webpage` app                    |
| `COOLIFY_PRODUCTION_SALON_UUID`        | `deploy-production` | UUID of the production `salon-webpage` app                           |
| `COOLIFY_PRODUCTION_MARKETING_UUID`    | `deploy-production` | UUID of the production `marketing-webpage` app                       |
| `COOLIFY_PRODUCTION_CALENDAR_UUID`     | `deploy-production` | UUID of the production `calendar-service` app                        |

For local use, copy `packages/deployment/.env.example` to `packages/deployment/.env` and fill in
the values.

---

## GitHub Secrets

All secrets are stored at the repository level (_Settings → Secrets and variables → Actions_).
They map directly to the environment variables described above.

### Coolify connection

| Secret                             | Description                                                      |
| ---------------------------------- | ---------------------------------------------------------------- |
| `COOLIFY_URL`                      | Base URL of the Coolify instance                                 |
| `COOLIFY_TOKEN`                    | Coolify API token (generate under _Keys & Tokens_ in Coolify)    |
| `COOLIFY_SERVER_UUID`              | UUID of the server registered in Coolify (found in _Servers_)    |
| `COOLIFY_DEVELOPMENT_PROJECT_UUID` | UUID of the Coolify project used for PR/development environments |

### Staging service UUIDs (pre-configured in Coolify)

| Secret                              | Description                                            |
| ----------------------------------- | ------------------------------------------------------ |
| `COOLIFY_STAGING_MANAGE_SALON_UUID` | UUID of the `manage-salon-webpage` staging application |
| `COOLIFY_STAGING_SALON_UUID`        | UUID of the `salon-webpage` staging application        |
| `COOLIFY_STAGING_MARKETING_UUID`    | UUID of the `marketing-webpage` staging application    |
| `COOLIFY_STAGING_CALENDAR_UUID`     | UUID of the `calendar-service` staging application     |

### Production service UUIDs (pre-configured in Coolify)

| Secret                                 | Description                                               |
| -------------------------------------- | --------------------------------------------------------- |
| `COOLIFY_PRODUCTION_MANAGE_SALON_UUID` | UUID of the `manage-salon-webpage` production application |
| `COOLIFY_PRODUCTION_SALON_UUID`        | UUID of the `salon-webpage` production application        |
| `COOLIFY_PRODUCTION_MARKETING_UUID`    | UUID of the `marketing-webpage` production application    |
| `COOLIFY_PRODUCTION_CALENDAR_UUID`     | UUID of the `calendar-service` production application     |

---

## Coolify Setup

### One-time Coolify configuration

1. **Add the VPS server** in Coolify under _Servers → Add Server_.
2. **Create three projects** in Coolify:
   - `development` – for ephemeral PR environments
   - `staging` – for the `develop` branch
   - `production` – for the `main` branch
3. **Add the GHCR credentials** so Coolify can pull private images:
   - Go to _Sources → Add Source → Container Registry_
   - Registry: `ghcr.io`
   - Username: your GitHub username / organisation
   - Password: a GitHub Personal Access Token with `read:packages` scope

### Staging & Production applications

For **staging** and **production**, create each application in Coolify manually once:

1. Inside the appropriate project, click _New Resource → Docker Image_.
2. Set **Image** to `ghcr.io/<owner>/<app>` with the tag `develop` (staging) or `main` (production).
3. Set **Port** to the value in the table above.
4. Save and deploy to verify connectivity.
5. Copy the application's **UUID** from the URL (e.g. `coolify.example.com/project/…/applications/<uuid>`) and store it as the matching GitHub secret.

After the initial setup, every push to `develop`/`main` will trigger the `deploy-staging` /
`deploy-production` pnpm script, which calls `client.deployApplication(uuid)` to instruct
Coolify to pull the latest image and restart.

### Development (PR) applications

PR environments are managed **automatically** by the `deploy-pr` and `cleanup-pr` commands:

- On PR open / push: a Docker Image application named `pr-<number>-<app>` is created inside the
  development project and deployed.
- On PR close: the corresponding applications are deleted.

No manual Coolify setup is needed for development environments beyond creating the project and
storing `COOLIFY_DEVELOPMENT_PROJECT_UUID`.

---

## Workflow Details

### Docker Build and Push (`docker.yml`)

```
on: pull_request / push → main, develop
│
├─ build (matrix: 4 apps)
│   └─ docker/build-push-action → ghcr.io/<owner>/<app>:<tag>
│
└─ deploy (runs after all build jobs succeed)
    ├─ checkout + pnpm install
    ├─ PR event   → pnpm deploy-pr --pr-number <n>
    ├─ develop    → pnpm deploy-staging
    └─ main       → pnpm deploy-production
```

### Coolify PR Cleanup (`coolify-cleanup.yml`)

```
on: pull_request [closed]
│
└─ cleanup
    ├─ checkout + pnpm install
    └─ pnpm cleanup-pr --pr-number <n>
```
