import type {
  Application,
  CoolifyConfig,
  CoolifyService,
  CreateApplicationResponse,
  CreateDatabasePayload,
  CreateDatabaseResponse,
  CreateDockerImageApplicationPayload,
  CreateServicePayload,
  CreateServiceResponse,
  Database,
  DatabaseType,
} from "./types.js";

export type {
  Application,
  CoolifyConfig,
  CoolifyService,
  Database,
  DatabaseType,
} from "./types.js";

/**
 * Native-fetch-based Coolify API client.
 *
 * Covers the subset of the Coolify v4 REST API needed for automated
 * deployment: applications, databases and services.
 */
export class CoolifyApiClient {
  constructor(private readonly config: CoolifyConfig) {}

  // ── HTTP core ─────────────────────────────────────────────────────────────

  /**
   * Performs a JSON request and returns the parsed response body.
   * Use for endpoints that return a JSON payload.
   */
  private async requestJson<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const response = await this.send(method, path, body);
    return response.json() as Promise<T>;
  }

  /**
   * Performs a request whose response body can be ignored (e.g. 200/204 with
   * no meaningful payload). Use for fire-and-forget endpoints.
   */
  private async requestEmpty(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<void> {
    await this.send(method, path, body);
  }

  private async send(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<Response> {
    const url = `${this.config.apiUrl.replace(/\/$/, "")}/api/v1${path}`;
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.config.apiToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Coolify API ${method} ${path} failed with ${response.status}: ${text}`,
      );
    }

    return response;
  }

  // ── Applications ──────────────────────────────────────────────────────────

  async listApplications(): Promise<Application[]> {
    return this.requestJson<Application[]>("GET", "/applications");
  }

  async createDockerImageApplication(
    payload: CreateDockerImageApplicationPayload,
  ): Promise<CreateApplicationResponse> {
    return this.requestJson<CreateApplicationResponse>(
      "POST",
      "/applications",
      payload,
    );
  }

  async deployApplication(uuid: string): Promise<void> {
    await this.requestEmpty("POST", `/applications/${uuid}/deploy`);
  }

  async deleteApplication(
    uuid: string,
    options: { deleteConfigurations?: boolean; deleteVolumes?: boolean } = {},
  ): Promise<void> {
    const qs = buildDeleteQueryString(options);
    await this.requestEmpty(
      "DELETE",
      `/applications/${uuid}${qs ? `?${qs}` : ""}`,
    );
  }

  // ── Databases ─────────────────────────────────────────────────────────────

  async listDatabases(): Promise<Database[]> {
    return this.requestJson<Database[]>("GET", "/databases");
  }

  async createDatabase(
    type: DatabaseType,
    payload: CreateDatabasePayload,
  ): Promise<CreateDatabaseResponse> {
    return this.requestJson<CreateDatabaseResponse>(
      "POST",
      `/databases/${type}`,
      payload,
    );
  }

  async startDatabase(uuid: string): Promise<void> {
    await this.requestEmpty("POST", `/databases/${uuid}/start`);
  }

  async deleteDatabase(
    uuid: string,
    options: { deleteConfigurations?: boolean; deleteVolumes?: boolean } = {},
  ): Promise<void> {
    const qs = buildDeleteQueryString(options);
    await this.requestEmpty(
      "DELETE",
      `/databases/${uuid}${qs ? `?${qs}` : ""}`,
    );
  }

  // ── Services ──────────────────────────────────────────────────────────────

  async listServices(): Promise<CoolifyService[]> {
    return this.requestJson<CoolifyService[]>("GET", "/services");
  }

  async createService(
    payload: CreateServicePayload,
  ): Promise<CreateServiceResponse> {
    return this.requestJson<CreateServiceResponse>(
      "POST",
      "/services",
      payload,
    );
  }

  async startService(uuid: string): Promise<void> {
    await this.requestEmpty("POST", `/services/${uuid}/start`);
  }

  async deleteService(
    uuid: string,
    options: { deleteConfigurations?: boolean; deleteVolumes?: boolean } = {},
  ): Promise<void> {
    const qs = buildDeleteQueryString(options);
    await this.requestEmpty("DELETE", `/services/${uuid}${qs ? `?${qs}` : ""}`);
  }
}

// ── Convenience helpers ────────────────────────────────────────────────────

export function createCoolifyApiClient(
  config: CoolifyConfig,
): CoolifyApiClient {
  return new CoolifyApiClient(config);
}

function buildDeleteQueryString(options: {
  deleteConfigurations?: boolean;
  deleteVolumes?: boolean;
}): string {
  const params = new URLSearchParams();
  if (options.deleteConfigurations !== false) {
    params.set("delete_configurations", "true");
  }
  if (options.deleteVolumes !== false) {
    params.set("delete_volumes", "true");
  }
  return params.toString();
}
