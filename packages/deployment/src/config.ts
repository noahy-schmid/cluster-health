import type { CoolifyConfig } from "./coolify/types.js";

export type { CoolifyConfig } from "./coolify/types.js";

export interface DeploymentConfig {
  readonly coolify: CoolifyConfig;
  readonly serverUuid: string;
  readonly developmentProjectUuid: string;
  readonly imageOwner: string;
  readonly staging: EnvironmentServiceUuids;
  readonly production: EnvironmentServiceUuids;
}

export interface EnvironmentServiceUuids {
  readonly manageSalonWebpage: string | undefined;
  readonly salonWebpage: string | undefined;
  readonly marketingWebpage: string | undefined;
  readonly calendarService: string | undefined;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string): string | undefined {
  return process.env[name] ?? undefined;
}

export function loadCoolifyConfig(): CoolifyConfig {
  return {
    apiUrl: requireEnv("COOLIFY_URL"),
    apiToken: requireEnv("COOLIFY_TOKEN"),
  };
}

export function loadDeploymentConfig(): DeploymentConfig {
  return {
    coolify: loadCoolifyConfig(),
    serverUuid: requireEnv("COOLIFY_SERVER_UUID"),
    developmentProjectUuid: requireEnv("COOLIFY_DEVELOPMENT_PROJECT_UUID"),
    imageOwner: requireEnv("IMAGE_OWNER"),
    staging: {
      manageSalonWebpage: optionalEnv("COOLIFY_STAGING_MANAGE_SALON_UUID"),
      salonWebpage: optionalEnv("COOLIFY_STAGING_SALON_UUID"),
      marketingWebpage: optionalEnv("COOLIFY_STAGING_MARKETING_UUID"),
      calendarService: optionalEnv("COOLIFY_STAGING_CALENDAR_UUID"),
    },
    production: {
      manageSalonWebpage: optionalEnv("COOLIFY_PRODUCTION_MANAGE_SALON_UUID"),
      salonWebpage: optionalEnv("COOLIFY_PRODUCTION_SALON_UUID"),
      marketingWebpage: optionalEnv("COOLIFY_PRODUCTION_MARKETING_UUID"),
      calendarService: optionalEnv("COOLIFY_PRODUCTION_CALENDAR_UUID"),
    },
  };
}
