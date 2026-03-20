import { createCoolifyApiClient } from "../coolify/client.js";
import type { DeployEnvironmentOptions } from "../types.js";

export type { DeployEnvironmentOptions } from "../types.js";

export async function deployStaging(
  options: DeployEnvironmentOptions,
): Promise<void> {
  const { config } = options;
  const client = createCoolifyApiClient(config.coolify);

  console.log("Deploying to Coolify staging environment…");

  const uuids: Record<string, string | undefined> = {
    "manage-salon-webpage": config.staging.manageSalonWebpage,
    "salon-webpage": config.staging.salonWebpage,
    "marketing-webpage": config.staging.marketingWebpage,
    "calendar-service": config.staging.calendarService,
  };

  for (const [name, uuid] of Object.entries(uuids)) {
    if (!uuid) {
      console.warn(`  Skipping ${name}: no UUID configured`);
      continue;
    }
    console.log(`  Deploying ${name} (${uuid})…`);
    await client.deployApplication(uuid);
    console.log(`  Deployment triggered for ${name}`);
  }

  console.log("Staging deployment complete.");
}
