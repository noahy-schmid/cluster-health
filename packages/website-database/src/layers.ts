import { Layer } from "effect";
import { PostgresWebsiteAdapter } from "./adapters/postgres-website.adapter";
import { DomainSalonAdapter } from "./adapters/domain-salon.adapter";
import { WebsiteServiceLive } from "./services/website/website.service";
import { MediaServiceLive } from "./services/media/media.service";
import { PostgresMediaAdapter } from "./adapters/postgres-media.adapter";
import { S3FileStorageAdapter } from "./adapters/s3-file-storage.adapter";
import { ConfigurationLayer } from "./infrastructure/config.service";
import { DatabaseLayer } from "./infrastructure/database.service";

const InfrastructureLayer = DatabaseLayer.pipe(
  Layer.provideMerge(ConfigurationLayer),
);

export const WebsiteLayer = WebsiteServiceLive.pipe(
  Layer.provide(PostgresWebsiteAdapter),
  Layer.provide(DomainSalonAdapter),
  Layer.provide(InfrastructureLayer),
);

export const MediaLayer = MediaServiceLive.pipe(
  Layer.provide(PostgresMediaAdapter),
  Layer.provide(S3FileStorageAdapter),
  Layer.provide(InfrastructureLayer),
);
