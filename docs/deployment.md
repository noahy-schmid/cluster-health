# Deployment Guide

This document describes how the deinsalon monorepo is deployed to Coolify running on a VPS.

## Overview

Deployments are automated through two GitHub Actions workflows:

| Workflow | File | Purpose |
|---|---|---|
| Docker Build and Push | `.github/workflows/docker.yml` | Build images, push to GHCR, deploy to Coolify |
| Coolify PR Cleanup | `.github/workflows/coolify-cleanup.yml` | Remove ephemeral PR environments when a PR is closed |

### Environments

| Git event | Coolify environment | Image tag |
|---|---|---|
| Push to `main` | **Production** | `main` |
| Push to `develop` | **Staging** | `develop` |
| Pull Request opened / updated | **Development** (ephemeral per-PR) | `pr-<number>` |

### Applications

Four services are deployed for each environment:

| Application | Container port | GHCR image |
|---|---|---|
| `manage-salon-webpage` | 3000 | `ghcr.io/<owner>/manage-salon-webpage` |
| `salon-webpage` | 3000 | `ghcr.io/<owner>/salon-webpage` |
| `marketing-webpage` | 3000 | `ghcr.io/<owner>/marketing-webpage` |
| `calendar-service` | 8080 | `ghcr.io/<owner>/calendar-service` |

---

## GitHub Secrets

All secrets are stored at the repository level (*Settings → Secrets and variables → Actions*).

### Coolify connection

| Secret | Description |
|---|---|
| `COOLIFY_URL` | Base URL of the Coolify instance, e.g. `https://coolify.example.com` |
| `COOLIFY_TOKEN` | Coolify API token (generate under *Keys & Tokens* in Coolify) |
| `COOLIFY_SERVER_UUID` | UUID of the server registered in Coolify (found in *Servers*) |
| `COOLIFY_DEVELOPMENT_PROJECT_UUID` | UUID of the Coolify project used for PR/development environments |

### Staging service UUIDs (pre-configured in Coolify)

| Secret | Description |
|---|---|
| `COOLIFY_STAGING_MANAGE_SALON_UUID` | UUID of the `manage-salon-webpage` staging application |
| `COOLIFY_STAGING_SALON_UUID` | UUID of the `salon-webpage` staging application |
| `COOLIFY_STAGING_MARKETING_UUID` | UUID of the `marketing-webpage` staging application |
| `COOLIFY_STAGING_CALENDAR_UUID` | UUID of the `calendar-service` staging application |

### Production service UUIDs (pre-configured in Coolify)

| Secret | Description |
|---|---|
| `COOLIFY_PRODUCTION_MANAGE_SALON_UUID` | UUID of the `manage-salon-webpage` production application |
| `COOLIFY_PRODUCTION_SALON_UUID` | UUID of the `salon-webpage` production application |
| `COOLIFY_PRODUCTION_MARKETING_UUID` | UUID of the `marketing-webpage` production application |
| `COOLIFY_PRODUCTION_CALENDAR_UUID` | UUID of the `calendar-service` production application |

---

## Coolify Setup

### One-time Coolify configuration

1. **Add the VPS server** in Coolify under *Servers → Add Server*.
2. **Create three projects** in Coolify:
   - `development` – for ephemeral PR environments
   - `staging` – for the `develop` branch
   - `production` – for the `main` branch
3. **Add the GHCR credentials** so Coolify can pull private images:
   - Go to *Sources → Add Source → Container Registry*
   - Registry: `ghcr.io`
   - Username: your GitHub username / organisation
   - Password: a GitHub Personal Access Token with `read:packages` scope

### Staging & Production applications

For **staging** and **production**, create each application in Coolify manually once:

1. Inside the appropriate project, click *New Resource → Docker Image*.
2. Set **Image** to `ghcr.io/<owner>/<app>` with the tag `develop` (staging) or `main` (production).
3. Set **Port** to the value in the table above.
4. Save and deploy to verify connectivity.
5. Copy the application's **UUID** from the URL (e.g. `coolify.example.com/project/…/applications/<uuid>`) and store it as the matching secret listed in the table above.

The GitHub Actions workflow will call `POST /api/v1/applications/<uuid>/deploy` after every successful image push to trigger Coolify to pull and restart the container with the latest image.

### Development (PR) applications

PR environments are created **automatically** by the workflow using the Coolify API:

- On PR open / push: a Docker Image application named `pr-<number>-<app>` is created inside the development project and deployed.
- On PR close: the corresponding applications are deleted.

No manual Coolify setup is needed for development environments beyond creating the project and storing `COOLIFY_DEVELOPMENT_PROJECT_UUID`.

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
    ├─ PR event   → create/update Coolify application, deploy
    ├─ develop    → POST /api/v1/applications/<staging-uuid>/deploy × 4
    └─ main       → POST /api/v1/applications/<production-uuid>/deploy × 4
```

### Coolify PR Cleanup (`coolify-cleanup.yml`)

```
on: pull_request [closed]
│
└─ cleanup
    └─ GET /api/v1/applications → find pr-<number>-<app> by name
       → DELETE /api/v1/applications/<uuid>
```
