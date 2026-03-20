// Re-export the Coolify API client and helpers from the coolify sub-module
// so existing imports from "../client.js" continue to work.
export { CoolifyApiClient, createCoolifyApiClient } from "./coolify/client.js";
export type {
  Application,
  CoolifyConfig,
  CoolifyService,
  Database,
  DatabaseType,
} from "./coolify/client.js";
