import { createCoolifyClient, triggerDeploy } from "../client.js";
import type { DeployEnvironmentOptions } from "../types.js";

export async function deployProduction(
  options: DeployEnvironmentOptions,
): Promise<void> {
  const { config } = options;
  const client = createCoolifyClient(config.coolify);

  console.log("Deploying to Coolify production environment…");

  const uuids: Record<string, string | undefined> = {
    "manage-salon-webpage": config.production.manageSalonWebpage,
    "salon-webpage": config.production.salonWebpage,
    "marketing-webpage": config.production.marketingWebpage,
    "calendar-service": config.production.calendarService,
  };

  for (const [name, uuid] of Object.entries(uuids)) {
    if (!uuid) {
      console.warn(`  Skipping ${name}: no UUID configured`);
      continue;
    }
    console.log(`  Deploying ${name} (${uuid})…`);
    await triggerDeploy(client, uuid);
    console.log(`  Deployment triggered for ${name}`);
  }

  console.log("Production deployment complete.");
}
