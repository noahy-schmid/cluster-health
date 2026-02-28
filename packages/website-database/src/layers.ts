import { Layer } from "effect";
import { PostgresWebsiteAdapter } from "./adapters/postgres-website.adapter";
import { DomainSalonAdapter } from "./adapters/domain-salon.adapter";
import { WebsiteServiceLive } from "./services/website/website.service";
import { MediaServiceLive } from "./services/media/media.service";
import { PostgresMediaAdapter } from "./adapters/postgres-media.adapter";
import { S3FileStorageAdapter } from "./adapters/s3-file-storage.adapter";
import { ConfigurationLayer } from "./infrastructure/config.service";
import { DatabaseLayer } from "./infrastructure/database.service";
import { SectionAggregateLive } from "./application/section/section.aggregate";
import { PostgresSectionAdapter } from "./adapters/section/postgres-section.adapter";
import { PostgresGallerySectionAdapter } from "./adapters/section/postgres-gallery-section.adapter";
import { PostgresTextWithImageSectionAdapter } from "./adapters/section/postgres-text-with-image-section.adapter";
import { PostgresCenterTextSectionAdapter } from "./adapters/section/postgres-center-text-section.adapter";
import { PostgresReasonSectionAdapter } from "./adapters/section/postgres-reason-section.adapter";
import { PostgresStylistsSectionAdapter } from "./adapters/section/postgres-stylists-section.adapter";
import { CreateSectionUseCaseLive } from "./use-cases/create-section.use-case";
import { UpdateSectionUseCaseLive } from "./use-cases/update-section.use-case";
import { DeleteSectionUseCaseLive } from "./use-cases/delete-section.use-case";
import { ReorderSectionsUseCaseLive } from "./use-cases/reorder-sections.use-case";
import { ListSectionsUseCaseLive } from "./use-cases/list-sections.use-case";

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

const SectionTypeAdaptersLayer = Layer.mergeAll(
  PostgresGallerySectionAdapter,
  PostgresTextWithImageSectionAdapter,
  PostgresCenterTextSectionAdapter,
  PostgresReasonSectionAdapter,
  PostgresStylistsSectionAdapter,
);

const SectionPortLayer = PostgresSectionAdapter.pipe(
  Layer.provide(SectionTypeAdaptersLayer),
  Layer.provide(InfrastructureLayer),
);

const SectionAggregateLayer = SectionAggregateLive.pipe(
  Layer.provide(SectionPortLayer),
);

const SectionDependenciesLayer = Layer.mergeAll(
  SectionAggregateLayer,
  PostgresWebsiteAdapter.pipe(Layer.provide(InfrastructureLayer)),
  PostgresMediaAdapter.pipe(Layer.provide(InfrastructureLayer)),
);

export const CreateSectionUseCaseLayer = CreateSectionUseCaseLive.pipe(
  Layer.provide(SectionDependenciesLayer),
  Layer.orDie,
);

export const UpdateSectionUseCaseLayer = UpdateSectionUseCaseLive.pipe(
  Layer.provide(SectionDependenciesLayer),
  Layer.orDie,
);

export const DeleteSectionUseCaseLayer = DeleteSectionUseCaseLive.pipe(
  Layer.provide(SectionDependenciesLayer),
  Layer.orDie,
);

export const ReorderSectionsUseCaseLayer = ReorderSectionsUseCaseLive.pipe(
  Layer.provide(SectionDependenciesLayer),
  Layer.orDie,
);

export const ListSectionsUseCaseLayer = ListSectionsUseCaseLive.pipe(
  Layer.provide(SectionDependenciesLayer),
  Layer.orDie,
);
