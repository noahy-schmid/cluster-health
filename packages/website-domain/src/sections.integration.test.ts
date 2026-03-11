import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect, Either, Layer } from "effect";
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
import { type AllSections } from "./application/section/section.aggregate";
import {
  createMockSalon,
  createMockSection,
  createMockSections,
  createMockWebsite,
  setupTestEnvironment,
  type TestEnvironment,
} from "./test-setup";

describe("Section Use Cases Integration Tests", () => {
  let env: TestEnvironment;
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
    env = await setupTestEnvironment();
    useCaseLayer = env.useCaseLayer;
  }, 60_000);

  afterAll(async () => {
    await env.stop();
  });

  it("should create a center-text section with defaults", async () => {
    const websiteId = await createMockWebsite(env, {
      salonId: createMockSalon(env),
    });

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
    const websiteId = await createMockWebsite(env, {
      salonId: createMockSalon(env),
    });

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
    const websiteId = await createMockWebsite(env, {
      salonId: createMockSalon(env),
    });

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
    const websiteId = await createMockWebsite(env, {
      salonId: createMockSalon(env),
    });

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
    const websiteId = await createMockWebsite(env, {
      salonId: createMockSalon(env),
    });

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
    const websiteId = await createMockWebsite(env, {
      salonId: createMockSalon(env),
    });
    await createMockSections(env, websiteId, [
      "center-text",
      "gallery",
      "text-with-image",
      "reason",
      "stylists-section",
    ]);

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
    const websiteId = await createMockWebsite(env, {
      salonId: createMockSalon(env),
    });
    const centerText = await createMockSection(env, {
      websiteId,
      type: "center-text",
      position: 0,
    });

    const program = Effect.gen(function* () {
      const listUseCase = yield* ListSectionsUseCase;
      const updateUseCase = yield* UpdateSectionUseCase;

      if (centerText.type === "center-text") {
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
    const websiteId = await createMockWebsite(env, {
      salonId: createMockSalon(env),
    });
    const gallery = await createMockSection(env, {
      websiteId,
      type: "gallery",
      position: 0,
    });

    const program = Effect.gen(function* () {
      const listUseCase = yield* ListSectionsUseCase;
      const updateUseCase = yield* UpdateSectionUseCase;

      if (gallery.type === "gallery") {
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
    const websiteId = await createMockWebsite(env, {
      salonId: createMockSalon(env),
    });
    const sectionToDelete = await createMockSection(env, {
      websiteId,
      type: "stylists-section",
      position: 0,
    });

    const program = Effect.gen(function* () {
      const listUseCase = yield* ListSectionsUseCase;
      const deleteUseCase = yield* DeleteSectionUseCase;

      const sections = yield* listUseCase.execute({ websiteId });
      const initialCount = sections.length;
      expect(initialCount).toBeGreaterThan(0);
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
    const websiteId = await createMockWebsite(env, {
      salonId: createMockSalon(env),
    });
    await createMockSections(env, websiteId, [
      "center-text",
      "gallery",
      "reason",
    ]);

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
    const websiteId = await createMockWebsite(env, {
      salonId: createMockSalon(env),
    });

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
    const websiteId = await createMockWebsite(env, {
      salonId: createMockSalon(env),
    });

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
    const websiteId = await createMockWebsite(env, {
      salonId: createMockSalon(env),
    });
    const reasonSection = await createMockSection(env, {
      websiteId,
      type: "reason",
      position: 0,
    });

    const program = Effect.gen(function* () {
      const updateUseCase = yield* UpdateSectionUseCase;

      if (reasonSection.type === "reason") {
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
