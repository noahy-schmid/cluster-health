import { APPS } from "../apps.js";
import {
  createCoolifyClient,
  deleteApplication,
  findApplicationByName,
} from "../client.js";
import type { DeploymentConfig } from "../config.js";

export interface CleanupPrOptions {
  readonly prNumber: number;
  readonly config: DeploymentConfig;
}

export async function cleanupPr(options: CleanupPrOptions): Promise<void> {
  const { prNumber, config } = options;
  const client = createCoolifyClient(config.coolify);

  console.log(
    `Cleaning up Coolify development environment for PR #${prNumber}…`,
  );

  for (const app of APPS) {
    const serviceName = `pr-${prNumber}-${app.name}`;

    const appId = await findApplicationByName(client, serviceName);

    if (!appId) {
      console.log(`  ${serviceName}: not found, skipping`);
      continue;
    }

    console.log(`  Deleting ${serviceName} (${appId})…`);
    await deleteApplication(client, appId);
    console.log(`  Deleted ${serviceName}`);
  }

  console.log(`PR #${prNumber} cleanup complete.`);
}
