import { Layer } from "effect";
import { PostgresWebsiteAdapter } from "./adapters/postgres-website.adapter";
import { DomainSalonAdapter } from "./adapters/domain-salon.adapter";
import { WebsiteServiceLive } from "./application/website/website.service";
import { ConfigurationLayer } from "./infrastructure/config.service";
import { DatabaseLayer } from "./infrastructure/database.service";
import { CreateSectionUseCaseLive } from "./use-cases/create-section.use-case";
import { UpdateSectionUseCaseLive } from "./use-cases/update-section.use-case";
import { DeleteSectionUseCaseLive } from "./use-cases/delete-section.use-case";
import { ReorderSectionsUseCaseLive } from "./use-cases/reorder-sections.use-case";
import { ListSectionsUseCaseLive } from "./use-cases/list-sections.use-case";
import { DomainMediaAdapter } from "./adapters/domain-media.adapter";
import { SectionAggregate } from "./application/section/section.aggregate";

const InfrastructureLayer = DatabaseLayer.pipe(
  Layer.provideMerge(ConfigurationLayer),
);

export const WebsiteLayer = WebsiteServiceLive.pipe(
  Layer.provide(PostgresWebsiteAdapter),
  Layer.provide(DomainSalonAdapter),
  Layer.provide(InfrastructureLayer),
);

export const CreateSectionUseCaseLayer = CreateSectionUseCaseLive.pipe(
  Layer.provide(SectionAggregate.Default),
  Layer.provide(PostgresWebsiteAdapter),
  Layer.provide(DatabaseLayer),
  Layer.provide(ConfigurationLayer),
);

export const UpdateSectionUseCaseLayer = UpdateSectionUseCaseLive.pipe(
  Layer.provide(SectionAggregate.Default),
  Layer.provide(DomainMediaAdapter),
  Layer.orDie,
);

export const DeleteSectionUseCaseLayer = DeleteSectionUseCaseLive.pipe(
  Layer.provide(SectionAggregate.Default),
);

export const ReorderSectionsUseCaseLayer = ReorderSectionsUseCaseLive.pipe(
  Layer.provide(SectionAggregate.Default),
);

export const ListSectionsUseCaseLayer = ListSectionsUseCaseLive.pipe(
  Layer.provide(SectionAggregate.Default),
);
