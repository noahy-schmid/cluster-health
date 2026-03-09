import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect, Either, Layer, Option } from "effect";
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
import {
  CreateSectionUseCase,
  type CreateSectionCommand,
} from "./use-cases/create-section.use-case";
import {
  UpdateSectionUseCase,
  type UpdateSectionCommand,
} from "./use-cases/update-section.use-case";
import { DeleteSectionUseCase } from "./use-cases/delete-section.use-case";
import { ListSectionsUseCase } from "./use-cases/list-sections.use-case";
import {
  ReorderSectionsUseCase,
  type ReorderSectionsCommand,
} from "./use-cases/reorder-sections.use-case";
import {
  SectionAggregate,
  type AllSections,
} from "./application/section/section.aggregate";
import { MediaPort } from "./ports/media.port";
import { WebsiteService } from "./application/website/website.interface";
import { WebsiteServiceLive } from "./application/website/website.service";

describe("Section Use Cases Integration Tests", () => {
  let pgContainer: Awaited<ReturnType<typeof getOrCreatePostgreSQLContainer>>;
  let websiteId: string;
  let theSalonId: string;
  let useCaseLayer: Layer.Layer<
    | CreateSectionUseCase
    | UpdateSectionUseCase
    | DeleteSectionUseCase
    | ListSectionsUseCase
    | ReorderSectionsUseCase,
    never,
    never
  >;

  beforeAll(async () => {
    pgContainer = await getOrCreatePostgreSQLContainer();

    theSalonId = crypto.randomUUID();

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
      salonExists: (salonId) => Effect.succeed(salonId === theSalonId),
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

    useCaseLayer = Layer.mergeAll(
      CreateSectionUseCase.DefaultWithoutDependencies,
      UpdateSectionUseCase.DefaultWithoutDependencies,
      DeleteSectionUseCase.DefaultWithoutDependencies,
      ListSectionsUseCase.DefaultWithoutDependencies,
      ReorderSectionsUseCase.DefaultWithoutDependencies,
    ).pipe(Layer.provide(depsLayer), Layer.orDie);

    const websitePortLayer = Layer.mergeAll(
      PostgresWebsiteAdapter,
      mockSalonPortLayer,
    ).pipe(Layer.provideMerge(infrastructureLayer));

    await Effect.runPromise(
      Effect.gen(function* () {
        const { db } = yield* Database;
        yield* Effect.tryPromise(() =>
          migrate(db, { migrationsFolder: "drizzle" }),
        );

        const websiteService = yield* WebsiteService;
        const resultingId = yield* websiteService.createWebsite({
          salonId: theSalonId,
          slug: "test-sections-website",
          title: "Test Sections Website",
          faviconMediaId: Option.none(),
        });
        websiteId = resultingId;
      }).pipe(
        Effect.provide(
          WebsiteServiceLive.pipe(Layer.provideMerge(websitePortLayer)),
        ),
      ),
    );
  }, 60_000);

  afterAll(async () => {
    if (pgContainer) {
      await pgContainer.stop();
    }
  });

  it("should create a center-text section with defaults", async () => {
    const command: CreateSectionCommand = {
      websiteId,
      type: "center-text",
      position: 0,
    };

    const program = Effect.gen(function* () {
      const useCase = yield* CreateSectionUseCase;
      const section = yield* useCase.execute(command);

      expect(section).toBeDefined();
      expect(section.id).toBeDefined();
      expect(section.type).toBe("center-text");
      expect(section.order).toBe(0);

      if (section.type === "center-text") {
        expect(section.settings.title).toBeDefined();
        expect(section.settings.content).toBeDefined();
      }

      return section;
    });

    await Effect.runPromise(program.pipe(Effect.provide(useCaseLayer)));
  });

  it("should create a gallery section with defaults", async () => {
    const command: CreateSectionCommand = {
      websiteId,
      type: "gallery",
      position: 1,
    };

    const program = Effect.gen(function* () {
      const useCase = yield* CreateSectionUseCase;
      const section = yield* useCase.execute(command);

      expect(section.type).toBe("gallery");
      if (section.type === "gallery") {
        expect(section.settings.title).toBeDefined();
        expect(section.settings.subtitle).toBeDefined();
        expect(section.settings.imageIds).toEqual([]);
      }

      return section;
    });

    await Effect.runPromise(program.pipe(Effect.provide(useCaseLayer)));
  });

  it("should create a text-with-image section with defaults", async () => {
    const command: CreateSectionCommand = {
      websiteId,
      type: "text-with-image",
      position: 2,
    };

    const program = Effect.gen(function* () {
      const useCase = yield* CreateSectionUseCase;
      const section = yield* useCase.execute(command);

      expect(section.type).toBe("text-with-image");
      if (section.type === "text-with-image") {
        expect(section.settings.title).toBeDefined();
        expect(section.settings.text).toBeDefined();
      }

      return section;
    });

    await Effect.runPromise(program.pipe(Effect.provide(useCaseLayer)));
  });

  it("should create a reason section with default items", async () => {
    const command: CreateSectionCommand = {
      websiteId,
      type: "reason",
      position: 3,
    };

    const program = Effect.gen(function* () {
      const useCase = yield* CreateSectionUseCase;
      const section = yield* useCase.execute(command);

      expect(section.type).toBe("reason");
      if (section.type === "reason") {
        expect(section.settings.title).toBeDefined();
        expect(section.settings.subtitle).toBeDefined();
        expect(section.settings.items.length).toBeGreaterThanOrEqual(2);
      }

      return section;
    });

    await Effect.runPromise(program.pipe(Effect.provide(useCaseLayer)));
  });

  it("should create a stylists section with defaults", async () => {
    const command: CreateSectionCommand = {
      websiteId,
      type: "stylists-section",
      position: 4,
    };

    const program = Effect.gen(function* () {
      const useCase = yield* CreateSectionUseCase;
      const section = yield* useCase.execute(command);

      expect(section.type).toBe("stylists-section");
      if (section.type === "stylists-section") {
        expect(section.settings.title).toBeDefined();
        expect(section.settings.subtitle).toBeDefined();
      }

      return section;
    });

    await Effect.runPromise(program.pipe(Effect.provide(useCaseLayer)));
  });

  it("should list all created sections for the website", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* ListSectionsUseCase;
      const sections = yield* useCase.execute({ websiteId });

      expect(sections.length).toBe(5);

      const types = sections.map((s) => s.type);
      expect(types).toContain("center-text");
      expect(types).toContain("gallery");
      expect(types).toContain("text-with-image");
      expect(types).toContain("reason");
      expect(types).toContain("stylists-section");

      return sections;
    });

    await Effect.runPromise(program.pipe(Effect.provide(useCaseLayer)));
  });

  it("should update a center-text section", async () => {
    const program = Effect.gen(function* () {
      const listUseCase = yield* ListSectionsUseCase;
      const updateUseCase = yield* UpdateSectionUseCase;

      const sections = yield* listUseCase.execute({ websiteId });
      const centerText = sections.find((s) => s.type === "center-text");
      expect(centerText).toBeDefined();

      if (centerText && centerText.type === "center-text") {
        const updatedSection: AllSections = {
          ...centerText,
          settings: {
            title: "Updated Title",
            content: "Updated Content",
          },
        };

        yield* updateUseCase.execute(updatedSection as UpdateSectionCommand);

        const refreshed = yield* listUseCase.execute({ websiteId });
        const updated = refreshed.find((s) => s.id === centerText.id);
        expect(updated).toBeDefined();
        if (updated && updated.type === "center-text") {
          expect(updated.settings.title).toBe("Updated Title");
          expect(updated.settings.content).toBe("Updated Content");
        }
      }
    });

    await Effect.runPromise(program.pipe(Effect.provide(useCaseLayer)));
  });

  it("should update a gallery section", async () => {
    const program = Effect.gen(function* () {
      const listUseCase = yield* ListSectionsUseCase;
      const updateUseCase = yield* UpdateSectionUseCase;

      const sections = yield* listUseCase.execute({ websiteId });
      const gallery = sections.find((s) => s.type === "gallery");
      expect(gallery).toBeDefined();

      if (gallery && gallery.type === "gallery") {
        const updatedSection: AllSections = {
          ...gallery,
          settings: {
            title: "Updated Gallery",
            subtitle: "Updated Subtitle",
            imageIds: [],
          },
        };

        yield* updateUseCase.execute(updatedSection as UpdateSectionCommand);

        const refreshed = yield* listUseCase.execute({ websiteId });
        const updated = refreshed.find((s) => s.id === gallery.id);
        if (updated && updated.type === "gallery") {
          expect(updated.settings.title).toBe("Updated Gallery");
          expect(updated.settings.subtitle).toBe("Updated Subtitle");
        }
      }
    });

    await Effect.runPromise(program.pipe(Effect.provide(useCaseLayer)));
  });

  it("should delete a section", async () => {
    const program = Effect.gen(function* () {
      const listUseCase = yield* ListSectionsUseCase;
      const deleteUseCase = yield* DeleteSectionUseCase;

      const sections = yield* listUseCase.execute({ websiteId });
      const initialCount = sections.length;
      expect(initialCount).toBeGreaterThan(0);

      const sectionToDelete = sections[sections.length - 1]!;
      yield* deleteUseCase.execute({
        websiteId,
        sectionId: sectionToDelete.id,
      });

      const afterDelete = yield* listUseCase.execute({ websiteId });
      expect(afterDelete.length).toBe(initialCount - 1);
      expect(
        afterDelete.find((s) => s.id === sectionToDelete.id),
      ).toBeUndefined();
    });

    await Effect.runPromise(program.pipe(Effect.provide(useCaseLayer)));
  });

  it("should reorder sections", async () => {
    const program = Effect.gen(function* () {
      const listUseCase = yield* ListSectionsUseCase;
      const reorderUseCase = yield* ReorderSectionsUseCase;

      const sections = yield* listUseCase.execute({ websiteId });
      expect(sections.length).toBeGreaterThanOrEqual(2);

      // Reverse the order
      const reversedIds = sections.map((s) => s.id).reverse();

      const command: ReorderSectionsCommand = {
        websiteId,
        sectionIds: reversedIds,
      };

      yield* reorderUseCase.execute(command);

      const reordered = yield* listUseCase.execute({ websiteId });
      expect(reordered.map((s) => s.id)).toEqual(reversedIds);
    });

    await Effect.runPromise(program.pipe(Effect.provide(useCaseLayer)));
  });

  it("should fail to create section with invalid type", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* CreateSectionUseCase;
      const result = yield* useCase
        .execute({
          websiteId,
          type: "invalid-type" as CreateSectionCommand["type"],
          position: 0,
        })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("InvalidSectionTypeError");
      }
    });

    await Effect.runPromise(program.pipe(Effect.provide(useCaseLayer)));
  });

  it("should fail to create section for non-existent website", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* CreateSectionUseCase;
      const result = yield* useCase
        .execute({
          websiteId: crypto.randomUUID(),
          type: "center-text",
          position: 0,
        })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("SectionNotFoundError");
      }
    });

    await Effect.runPromise(program.pipe(Effect.provide(useCaseLayer)));
  });

  it("should fail to reorder with mismatched section IDs", async () => {
    const program = Effect.gen(function* () {
      const reorderUseCase = yield* ReorderSectionsUseCase;
      const result = yield* reorderUseCase
        .execute({
          websiteId,
          sectionIds: [crypto.randomUUID()],
        })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("SectionError");
      }
    });

    await Effect.runPromise(program.pipe(Effect.provide(useCaseLayer)));
  });

  it("should validate reason section items on update", async () => {
    const program = Effect.gen(function* () {
      const listUseCase = yield* ListSectionsUseCase;
      const updateUseCase = yield* UpdateSectionUseCase;

      const sections = yield* listUseCase.execute({ websiteId });
      const reasonSection = sections.find((s) => s.type === "reason");
      expect(reasonSection).toBeDefined();

      if (reasonSection && reasonSection.type === "reason") {
        // Try to update with only 1 item (should fail - minimum is 2)
        const invalidSection: AllSections = {
          ...reasonSection,
          settings: {
            title: "Test",
            subtitle: "Test",
            items: [{ title: "Only one", description: "Not enough" }],
          },
        };

        const result = yield* updateUseCase
          .execute(invalidSection as UpdateSectionCommand)
          .pipe(Effect.either);

        expect(Either.isLeft(result)).toBe(true);
      }
    });

    await Effect.runPromise(program.pipe(Effect.provide(useCaseLayer)));
  });
});
