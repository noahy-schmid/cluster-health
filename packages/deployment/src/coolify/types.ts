// --------------------------------------------------------------------------
// Coolify REST API – type definitions
// Based on the Coolify v4 API: https://coolify.io/docs/api-reference
// --------------------------------------------------------------------------

// ── Common ─────────────────────────────────────────────────────────────────

export interface CoolifyConfig {
  readonly apiUrl: string;
  readonly apiToken: string;
}

// ── Applications ───────────────────────────────────────────────────────────

export interface Application {
  uuid: string;
  name: string;
  status?: string;
  description?: string;
  fqdn?: string;
}

export interface CreateDockerImageApplicationPayload {
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

export interface CreateApplicationResponse {
  uuid: string;
}

// ── Databases ──────────────────────────────────────────────────────────────

export interface Database {
  uuid: string;
  name: string;
  status?: string;
  type?: string;
}

export type DatabaseType =
  | "postgresql"
  | "mysql"
  | "mariadb"
  | "redis"
  | "mongodb"
  | "keydb"
  | "dragonfly"
  | "clickhouse";

export interface CreateDatabasePayload {
  name: string;
  project_uuid: string;
  server_uuid: string;
  environment_name: string;
  instant_deploy?: boolean;
}

export interface CreateDatabaseResponse {
  uuid: string;
}

// ── Services ───────────────────────────────────────────────────────────────

export interface CoolifyService {
  uuid: string;
  name: string;
  status?: string;
  type?: string;
}

/** Service types supported by Coolify (docker-compose stacks). */
export type ServiceType =
  | "minio"
  | "plausibleanalytics"
  | "nocodb"
  | "appwrite"
  | "glitchtip"
  | "searxng"
  | "weblate"
  | "taiga"
  | "gitea"
  | "nextcloud"
  | "authentik"
  | "vaultwarden"
  | "languagetool"
  | "n8n"
  | "uptimekuma"
  | "ghost"
  | "logto"
  | "pocketbase"
  | "roundcube";

export interface CreateServicePayload {
  type: ServiceType;
  name: string;
  project_uuid: string;
  server_uuid: string;
  environment_name: string;
  instant_deploy?: boolean;
}

export interface CreateServiceResponse {
  uuid: string;
}
