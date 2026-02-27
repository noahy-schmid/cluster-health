import { Layer } from "effect";
import { MediaServiceLive } from "./services/media/media.service";
import { PostgresMediaAdapter } from "./adapters/postgres-media.adapter";
import { S3FileStorageAdapter } from "./adapters/s3-file-storage.adapter";
import { ConfigurationLayer } from "./infrastructure/config.service";
import { DatabaseLayer } from "./infrastructure/database.service";

const InfrastructureLayer = DatabaseLayer.pipe(
  Layer.provideMerge(ConfigurationLayer),
);

export const MediaLayer = MediaServiceLive.pipe(
  Layer.provide(PostgresMediaAdapter),
  Layer.provide(S3FileStorageAdapter),
  Layer.provide(InfrastructureLayer),
);
