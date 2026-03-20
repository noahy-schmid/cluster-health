import { APPS } from "../apps.js";
import { createCoolifyApiClient } from "../coolify/client.js";
import type { CoolifyApiClient } from "../coolify/client.js";
import type { DeploymentConfig } from "../config.js";
import {
  PR_COOLIFY_SERVICES,
  PR_DATABASE_SERVICES,
} from "../pr-infrastructure.js";

export interface DeployPrOptions {
  readonly prNumber: number;
  readonly config: DeploymentConfig;
}

export async function deployPr(options: DeployPrOptions): Promise<void> {
  const { prNumber, config } = options;
  const client = createCoolifyApiClient(config.coolify);
  const imageTag = `pr-${prNumber}`;
  const environmentName = `pr-${prNumber}`;

  console.log(`Deploying PR #${prNumber} to Coolify development environment…`);

  // ── Infrastructure services ─────────────────────────────────────────────
  // Provision databases and service stacks before app containers so they
  // are available when the application containers start.

  await provisionDatabases(client, config, prNumber, environmentName);
  await provisionCoolifyServices(client, config, prNumber, environmentName);

  // ── Application containers ──────────────────────────────────────────────

  for (const app of APPS) {
    const serviceName = `pr-${prNumber}-${app.name}`;
    const imageName = `ghcr.io/${config.imageOwner}/${app.name}`;

    console.log(`  Processing application ${serviceName}…`);

    let appUuid = await findApplicationUuidByName(client, serviceName);

    if (!appUuid) {
      console.log(`    Creating new application: ${serviceName}`);
      const created = await client.createDockerImageApplication({
        type: "dockerimage",
        name: serviceName,
        project_uuid: config.developmentProjectUuid,
        server_uuid: config.serverUuid,
        environment_name: environmentName,
        docker_registry_image_name: imageName,
        docker_registry_image_tag: imageTag,
        ports_exposes: String(app.port),
        instant_deploy: false,
      });
      appUuid = created.uuid;
      console.log(`    Created with uuid: ${appUuid}`);
    } else {
      console.log(`    Found existing application (${appUuid})`);
    }

    console.log(`    Triggering deployment…`);
    await client.deployApplication(appUuid);
    console.log(`    Deployment triggered for ${serviceName}`);
  }

  console.log(`PR #${prNumber} deployment complete.`);
}

// ── Helpers ─────────────────────────────────────────────────────────────────

async function findApplicationUuidByName(
  client: CoolifyApiClient,
  name: string,
): Promise<string | null> {
  const apps = await client.listApplications();
  const match = apps.find((a) => a.name === name);
  return match?.uuid ?? null;
}

async function findDatabaseUuidByName(
  client: CoolifyApiClient,
  name: string,
): Promise<string | null> {
  const dbs = await client.listDatabases();
  const match = dbs.find((d) => d.name === name);
  return match?.uuid ?? null;
}

async function findServiceUuidByName(
  client: CoolifyApiClient,
  name: string,
): Promise<string | null> {
  const services = await client.listServices();
  const match = services.find((s) => s.name === name);
  return match?.uuid ?? null;
}

async function provisionDatabases(
  client: CoolifyApiClient,
  config: DeploymentConfig,
  prNumber: number,
  environmentName: string,
): Promise<void> {
  for (const dbDef of PR_DATABASE_SERVICES) {
    const name = `pr-${prNumber}-${dbDef.nameSuffix}`;

    console.log(`  Processing database ${name}…`);

    const existing = await findDatabaseUuidByName(client, name);
    if (existing) {
      console.log(`    Found existing database (${existing}), skipping`);
      continue;
    }

    console.log(`    Creating ${dbDef.type} database: ${name}`);
    const created = await client.createDatabase(dbDef.type, {
      name,
      project_uuid: config.developmentProjectUuid,
      server_uuid: config.serverUuid,
      environment_name: environmentName,
      instant_deploy: false,
    });
    console.log(`    Starting database (${created.uuid})…`);
    await client.startDatabase(created.uuid);
    console.log(`    Database started: ${name}`);
  }
}

async function provisionCoolifyServices(
  client: CoolifyApiClient,
  config: DeploymentConfig,
  prNumber: number,
  environmentName: string,
): Promise<void> {
  for (const svcDef of PR_COOLIFY_SERVICES) {
    const name = `pr-${prNumber}-${svcDef.nameSuffix}`;

    console.log(`  Processing service ${name}…`);

    const existing = await findServiceUuidByName(client, name);
    if (existing) {
      console.log(`    Found existing service (${existing}), skipping`);
      continue;
    }

    console.log(`    Creating ${svcDef.type} service: ${name}`);
    const created = await client.createService({
      type: svcDef.type,
      name,
      project_uuid: config.developmentProjectUuid,
      server_uuid: config.serverUuid,
      environment_name: environmentName,
      instant_deploy: false,
    });
    console.log(`    Starting service (${created.uuid})…`);
    await client.startService(created.uuid);
    console.log(`    Service started: ${name}`);
  }
}
