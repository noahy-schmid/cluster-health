import { APPS } from "../apps.js";
import {
  createCoolifyClient,
  createDockerImageApplication,
  findApplicationByName,
  triggerDeploy,
} from "../client.js";
import type { DeploymentConfig } from "../config.js";

export interface DeployPrOptions {
  readonly prNumber: number;
  readonly config: DeploymentConfig;
}

export async function deployPr(options: DeployPrOptions): Promise<void> {
  const { prNumber, config } = options;
  const client = createCoolifyClient(config.coolify);
  const imageTag = `pr-${prNumber}`;
  const environmentName = `pr-${prNumber}`;

  console.log(`Deploying PR #${prNumber} to Coolify development environment…`);

  for (const app of APPS) {
    const serviceName = `pr-${prNumber}-${app.name}`;
    const imageName = `ghcr.io/${config.imageOwner}/${app.name}`;

    console.log(`  Processing ${serviceName}…`);

    let appId = await findApplicationByName(client, serviceName);

    if (!appId) {
      console.log(`    Creating new application: ${serviceName}`);
      appId = await createDockerImageApplication(client, {
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
      console.log(`    Created with id: ${appId}`);
    } else {
      console.log(`    Found existing application (${appId})`);
    }

    console.log(`    Triggering deployment…`);
    await triggerDeploy(client, appId);
    console.log(`    Deployment triggered for ${serviceName}`);
  }

  console.log(`PR #${prNumber} deployment complete.`);
}
