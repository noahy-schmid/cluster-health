import { Layer } from "effect";
import { PostgresWebsiteAdapter } from "./adapters/postgres-website.adapter";
import { DomainSalonAdapter } from "./adapters/domain-salon.adapter";
import { WebsiteServiceLive } from "./application/website/website.service";
import { ConfigurationLayer } from "./infrastructure/config.service";
import { DatabaseLayer } from "./infrastructure/database.service";
import { CreateSectionUseCase } from "./use-cases/create-section.use-case";
import { UpdateSectionUseCase } from "./use-cases/update-section.use-case";
import { DeleteSectionUseCase } from "./use-cases/delete-section.use-case";
import { ReorderSectionsUseCase } from "./use-cases/reorder-sections.use-case";
import { ListSectionsUseCase } from "./use-cases/list-sections.use-case";
import { DomainMediaAdapter } from "./adapters/domain-media.adapter";

const InfrastructureLayer = DatabaseLayer.pipe(
  Layer.provideMerge(ConfigurationLayer),
);

export const WebsiteLayer = WebsiteServiceLive.pipe(
  Layer.provide(PostgresWebsiteAdapter),
  Layer.provide(DomainSalonAdapter),
  Layer.provide(InfrastructureLayer),
);

export const CreateSectionUseCaseLayer = CreateSectionUseCase.Default.pipe(
  Layer.provide(PostgresWebsiteAdapter),
  Layer.provide(InfrastructureLayer),
);
export const UpdateSectionUseCaseLayer = UpdateSectionUseCase.Default.pipe(
  Layer.provide(DomainMediaAdapter),
);
export const DeleteSectionUseCaseLayer = DeleteSectionUseCase.Default;
export const ReorderSectionsUseCaseLayer = ReorderSectionsUseCase.Default;
export const ListSectionsUseCaseLayer = ListSectionsUseCase.Default;
