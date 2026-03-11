import { Effect, Layer, Option } from "effect";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { getOrCreatePostgreSQLContainer } from "@repo/test-fixtures";
import { PostgresWebsiteAdapter } from "./adapters/postgres-website.adapter";
import { SalonPort } from "./ports/salon.port";
import { Configuration } from "./infrastructure/config.interface";
import { Database } from "./infrastructure/database.interface";
import { DatabaseLayer } from "./infrastructure/database.service";
import { PostgresSectionAdapter } from "./adapters/section/postgres-section.adapter";
import { PostgresGallerySectionAdapter } from "./adapters/section/postgres-gallery-section.adapter";
import { PostgresTextWithImageSectionAdapter } from "./adapters/section/postgres-text-with-image-section.adapter";
import { PostgresCenterTextSectionAdapter } from "./adapters/section/postgres-center-text-section.adapter";
import { PostgresReasonSectionAdapter } from "./adapters/section/postgres-reason-section.adapter";
import { PostgresStylistsSectionAdapter } from "./adapters/section/postgres-stylists-section.adapter";
import { CreateSectionUseCase } from "./use-cases/create-section.use-case";
import { UpdateSectionUseCase } from "./use-cases/update-section.use-case";
import { DeleteSectionUseCase } from "./use-cases/delete-section.use-case";
import { ListSectionsUseCase } from "./use-cases/list-sections.use-case";
import { ReorderSectionsUseCase } from "./use-cases/reorder-sections.use-case";
import { SectionAggregate } from "./application/section/section.aggregate";
import { MediaPort } from "./ports/media.port";
import { WebsiteService } from "./application/website/website.interface";
import { WebsiteServiceLive } from "./application/website/website.service";
import type { CreateSectionCommand } from "./use-cases/create-section.use-case";

export interface TestEnvironment {
  useCaseLayer: Layer.Layer<
    | CreateSectionUseCase
    | UpdateSectionUseCase
    | DeleteSectionUseCase
    | ListSectionsUseCase
    | ReorderSectionsUseCase,
    never,
    never
  >;
  websiteServiceLayer: Layer.Layer<WebsiteService, never, never>;
  createSalon: () => string;
  stop: () => Promise<void>;
}

/**
 * Optional overrides for auto-generated website fixture values.
 * The required salonId dependency is passed as a separate parameter.
 */
export interface CreateWebsiteFixtureInput {
  slug?: string;
  title?: string;
  faviconMediaId?: string | null;
}

/**
 * Optional overrides for auto-generated section fixture values.
 * The required websiteId and section type dependencies are passed separately.
 */
export interface CreateSectionFixtureInput {
  position?: number;
}

function createFixtureSuffix() {
  return crypto.randomUUID().slice(0, 8);
}

export async function setupTestEnvironment(): Promise<TestEnvironment> {
  const pgContainer = await getOrCreatePostgreSQLContainer();
  const knownSalonIds = new Set<string>();

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

  const mockSalonPortLayer = Layer.succeed(SalonPort, {
    salonExists: (salonId) => Effect.succeed(knownSalonIds.has(salonId)),
  });

  const mockMediaPortLayer = Layer.succeed(MediaPort, {
    mediaIdsExist: (ids) =>
      Effect.succeed(ids.every((id) => id.startsWith("media-"))),
  });

  const infrastructureLayer = DatabaseLayer.pipe(
    Layer.provideMerge(testConfigurationLayer),
  );

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

  const portsLayer = Layer.mergeAll(
    PostgresWebsiteAdapter.pipe(Layer.provide(infrastructureLayer)),
    mockMediaPortLayer,
  );

  const depsLayer = Layer.mergeAll(aggregateLayer, portsLayer);

  const useCaseLayer = Layer.mergeAll(
    CreateSectionUseCase.DefaultWithoutDependencies,
    UpdateSectionUseCase.DefaultWithoutDependencies,
    DeleteSectionUseCase.DefaultWithoutDependencies,
    ListSectionsUseCase.DefaultWithoutDependencies,
    ReorderSectionsUseCase.DefaultWithoutDependencies,
  ).pipe(Layer.provide(depsLayer), Layer.orDie);

  const websiteServiceLayer = WebsiteServiceLive.pipe(
    Layer.provideMerge(
      Layer.mergeAll(
        PostgresWebsiteAdapter.pipe(Layer.provide(infrastructureLayer)),
        mockSalonPortLayer,
      ),
    ),
  );

  await Effect.runPromise(
    Effect.gen(function* () {
      const { db } = yield* Database;
      yield* Effect.tryPromise(() =>
        migrate(db, { migrationsFolder: "drizzle" }),
      );
    }).pipe(Effect.provide(infrastructureLayer)),
  );

  return {
    useCaseLayer,
    websiteServiceLayer,
    createSalon: () => {
      const salonId = crypto.randomUUID();
      knownSalonIds.add(salonId);
      return salonId;
    },
    stop: () => pgContainer.stop(),
  };
}

export async function createWebsite(
  env: TestEnvironment,
  salonId: string,
  input: CreateWebsiteFixtureInput = {},
) {
  const suffix = createFixtureSuffix();

  return Effect.runPromise(
    WebsiteService.pipe(
      Effect.flatMap((websiteService) =>
        websiteService.createWebsite({
          salonId,
          slug: input.slug ?? `mock-website-${suffix}`,
          title: input.title ?? `Mock Website ${suffix}`,
          faviconMediaId:
            input.faviconMediaId === undefined
              ? Option.none()
              : Option.fromNullable(input.faviconMediaId),
        }),
      ),
      Effect.provide(env.websiteServiceLayer),
    ),
  );
}

export function createMockSalon(env: TestEnvironment) {
  return env.createSalon();
}

export function createMockWebsite(env: TestEnvironment, salonId: string) {
  return createWebsite(env, salonId);
}

export async function createMockSection(
  env: TestEnvironment,
  websiteId: string,
  type: CreateSectionCommand["type"],
  input: CreateSectionFixtureInput = {},
) {
  return Effect.runPromise(
    CreateSectionUseCase.pipe(
      Effect.flatMap((useCase) =>
        useCase.execute({
          websiteId,
          type,
          position: input.position ?? 0,
        }),
      ),
      Effect.provide(env.useCaseLayer),
    ),
  );
}

export async function createMockSections(
  env: TestEnvironment,
  websiteId: string,
  types: CreateSectionCommand["type"][],
) {
  return Promise.all(
    types.map((type, index) =>
      createMockSection(env, websiteId, type, { position: index }),
    ),
  );
}
