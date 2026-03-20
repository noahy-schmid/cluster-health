import { APPS } from "../apps.js";
import { createCoolifyApiClient } from "../coolify/client.js";
import type { CoolifyApiClient } from "../coolify/client.js";
import type { DeploymentConfig } from "../config.js";
import {
  PR_COOLIFY_SERVICES,
  PR_DATABASE_SERVICES,
} from "../pr-infrastructure.js";

export interface CleanupPrOptions {
  readonly prNumber: number;
  readonly config: DeploymentConfig;
}

export async function cleanupPr(options: CleanupPrOptions): Promise<void> {
  const { prNumber, config } = options;
  const client = createCoolifyApiClient(config.coolify);

  console.log(
    `Cleaning up Coolify development environment for PR #${prNumber}…`,
  );

  // ── Application containers ──────────────────────────────────────────────

  const allApps = await client.listApplications();
  for (const app of APPS) {
    const name = `pr-${prNumber}-${app.name}`;
    const match = allApps.find((a) => a.name === name);

    if (!match) {
      console.log(`  Application ${name}: not found, skipping`);
      continue;
    }

    console.log(`  Deleting application ${name} (${match.uuid})…`);
    await client.deleteApplication(match.uuid);
    console.log(`  Deleted ${name}`);
  }

  // ── Infrastructure databases ────────────────────────────────────────────

  await cleanupDatabases(client, prNumber);

  // ── Infrastructure services ─────────────────────────────────────────────

  await cleanupCoolifyServices(client, prNumber);

  console.log(`PR #${prNumber} cleanup complete.`);
}

// ── Helpers ─────────────────────────────────────────────────────────────────

async function cleanupDatabases(
  client: CoolifyApiClient,
  prNumber: number,
): Promise<void> {
  const allDbs = await client.listDatabases();
  for (const dbDef of PR_DATABASE_SERVICES) {
    const name = `pr-${prNumber}-${dbDef.nameSuffix}`;
    const match = allDbs.find((d) => d.name === name);

    if (!match) {
      console.log(`  Database ${name}: not found, skipping`);
      continue;
    }

    console.log(`  Deleting database ${name} (${match.uuid})…`);
    await client.deleteDatabase(match.uuid);
    console.log(`  Deleted ${name}`);
  }
}

async function cleanupCoolifyServices(
  client: CoolifyApiClient,
  prNumber: number,
): Promise<void> {
  const allServices = await client.listServices();
  for (const svcDef of PR_COOLIFY_SERVICES) {
    const name = `pr-${prNumber}-${svcDef.nameSuffix}`;
    const match = allServices.find((s) => s.name === name);

    if (!match) {
      console.log(`  Service ${name}: not found, skipping`);
      continue;
    }

    console.log(`  Deleting service ${name} (${match.uuid})…`);
    await client.deleteService(match.uuid);
    console.log(`  Deleted ${name}`);
  }
}
