import { Layer } from "effect";
import { PostgresWebsiteAdapter } from "./adapters/postgres-website.adapter";
import { DomainSalonAdapter } from "./adapters/domain-salon.adapter";
import { WebsiteServiceLive } from "./services/website/website.service";

export const WebsiteLayer = WebsiteServiceLive.pipe(
  Layer.provide(PostgresWebsiteAdapter),
  Layer.provide(DomainSalonAdapter),
);
