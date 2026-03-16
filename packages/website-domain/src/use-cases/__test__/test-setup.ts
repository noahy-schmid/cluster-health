import { Effect, Layer, Option } from "effect";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { getOrCreatePostgreSQLContainer } from "@repo/test-fixtures";
import { PostgresWebsiteAdapter } from "../../adapters/postgres-website.adapter";
import { PostgresSectionAdapter } from "../../adapters/section/postgres-section.adapter";
import { PostgresGallerySectionAdapter } from "../../adapters/section/postgres-gallery-section.adapter";
import { PostgresTextWithImageSectionAdapter } from "../../adapters/section/postgres-text-with-image-section.adapter";
import { PostgresCenterTextSectionAdapter } from "../../adapters/section/postgres-center-text-section.adapter";
import { PostgresReasonSectionAdapter } from "../../adapters/section/postgres-reason-section.adapter";
import { PostgresStylistsSectionAdapter } from "../../adapters/section/postgres-stylists-section.adapter";
import { SalonPort } from "../../ports/salon.port";
import { MediaPort } from "../../ports/media.port";
import { Configuration } from "../../infrastructure/config.interface";
import { Database } from "../../infrastructure/database.interface";
import { DatabaseLayer } from "../../infrastructure/database.service";
import { SectionAggregate } from "../../application/section/section.aggregate";
import { WebsiteService } from "../../application/website/website.interface";
import { WebsiteServiceLive } from "../../application/website/website.service";
import { CreateSectionUseCase } from "../create-section.use-case";
import { UpdateSectionUseCase } from "../update-section.use-case";
import { DeleteSectionUseCase } from "../delete-section.use-case";
import { ListSectionsUseCase } from "../list-sections.use-case";
import { ReorderSectionsUseCase } from "../reorder-sections.use-case";

export interface TestContext {
  testLayer: Layer.Layer<
    | CreateSectionUseCase
    | UpdateSectionUseCase
    | DeleteSectionUseCase
    | ListSectionsUseCase
    | ReorderSectionsUseCase
    | Database
    | Configuration
    | WebsiteService
  >;
  stop: () => Promise<void>;
}

export async function setupTestContext(): Promise<TestContext> {
  const pgContainer = await getOrCreatePostgreSQLContainer();

  const testConfigurationLayer = Layer.effect(
    Configuration,
    Effect.succeed({
      databaseUrl: pgContainer.databaseUrl,
      s3Url: "",
      s3Region: "us-east-1",
      s3AccessKey: "",
      s3SecretKey: "",
      s3BucketName: "test-bucket",
    }),
  );

  const infrastructureLayer = DatabaseLayer.pipe(
    Layer.provideMerge(testConfigurationLayer),
  );

  const mockSalonPortLayer = Layer.succeed(SalonPort, {
    salonExists: () => Effect.succeed(true),
  });

  const mockMediaPortLayer = Layer.succeed(MediaPort, {
    mediaIdsExist: (ids) =>
      Effect.succeed(ids.every((id) => id.startsWith("media-"))),
  });

  const sectionTypeAdaptersLayer = Layer.mergeAll(
    PostgresGallerySectionAdapter,
    PostgresTextWithImageSectionAdapter,
    PostgresCenterTextSectionAdapter,
    PostgresReasonSectionAdapter,
    PostgresStylistsSectionAdapter,
  );

  const sectionPortLayer = PostgresSectionAdapter.pipe(
    Layer.provide(sectionTypeAdaptersLayer),
    Layer.provide(infrastructureLayer),
  );

  const aggregateLayer = SectionAggregate.DefaultWithoutDependencies.pipe(
    Layer.provide(sectionPortLayer),
  );

  const useCaseDependenciesLayer = Layer.mergeAll(
    aggregateLayer,
    PostgresWebsiteAdapter.pipe(Layer.provide(infrastructureLayer)),
    mockMediaPortLayer,
  );

  const sectionUseCaseLayer = Layer.mergeAll(
    CreateSectionUseCase.DefaultWithoutDependencies,
    UpdateSectionUseCase.DefaultWithoutDependencies,
    DeleteSectionUseCase.DefaultWithoutDependencies,
    ListSectionsUseCase.DefaultWithoutDependencies,
    ReorderSectionsUseCase.DefaultWithoutDependencies,
  ).pipe(Layer.provide(useCaseDependenciesLayer), Layer.orDie);

  const websitePortLayer = Layer.mergeAll(
    PostgresWebsiteAdapter,
    mockSalonPortLayer,
  ).pipe(Layer.provideMerge(infrastructureLayer));

  const websiteServiceLayer = WebsiteServiceLive.pipe(
    Layer.provideMerge(websitePortLayer),
  );

  await Effect.runPromise(
    Effect.gen(function* () {
      const { db } = yield* Database;
      yield* Effect.tryPromise(() =>
        migrate(db, { migrationsFolder: "drizzle" }),
      );
    }).pipe(Effect.provide(websiteServiceLayer)),
  );

  return {
    testLayer: Layer.mergeAll(
      sectionUseCaseLayer,
      infrastructureLayer,
      websiteServiceLayer,
    ),
    stop: () => pgContainer.stop(),
  };
}

export const createWebsite = () =>
  Effect.gen(function* () {
    const websiteService = yield* WebsiteService;
    const websiteId = yield* websiteService.createWebsite({
      salonId: crypto.randomUUID(),
      slug: `test-website-${Date.now()}`,
      title: "Test Website",
      faviconMediaId: Option.none(),
    });

    return websiteId;
  });
