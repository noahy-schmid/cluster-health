import { CoolifyClient } from "@joshuarileydev/coolify-client";

import type { CoolifyConfig } from "./config.js";

export type { CoolifyClient };

export function createCoolifyClient(config: CoolifyConfig): CoolifyClient {
  return new CoolifyClient({
    apiUrl: config.apiUrl,
    apiToken: config.apiToken,
  });
}

interface DockerImageApplicationPayload {
  type: "dockerimage";
  name: string;
  project_uuid: string;
  server_uuid: string;
  environment_name: string;
  docker_registry_image_name: string;
  docker_registry_image_tag: string;
  ports_exposes: string;
  instant_deploy?: boolean;
}

export async function findApplicationByName(
  client: CoolifyClient,
  name: string,
): Promise<string | null> {
  const response = await client.listApplications();
  const apps = response.data ?? [];
  const match = apps.find(
    (app: { id: string; name: string }) => app.name === name,
  );
  return match?.id ?? null;
}

export async function createDockerImageApplication(
  client: CoolifyClient,
  payload: DockerImageApplicationPayload,
): Promise<string> {
  const response = await client.createApplication(
    payload as unknown as Parameters<typeof client.createApplication>[0],
  );
  const id = response.data?.id;
  if (!id) {
    throw new Error(
      `Failed to create application '${payload.name}': no id in response`,
    );
  }
  return id;
}

export async function triggerDeploy(
  client: CoolifyClient,
  applicationId: string,
): Promise<void> {
  await client.deployApplication(applicationId);
}

export async function deleteApplication(
  client: CoolifyClient,
  applicationId: string,
): Promise<void> {
  await client.deleteApplication(applicationId);
}
