import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Effect, Either } from "effect";
import {
  createWebsite,
  setupTestContext,
  type TestContext,
} from "./test-setup";
import {
  CreateSectionUseCase,
  type CreateSectionCommand,
} from "../create-section.use-case";
import { ListSectionsUseCase } from "../list-sections.use-case";

describe("CreateSectionUseCase", () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await setupTestContext();
  }, 60_000);

  afterAll(async () => {
    await ctx.stop();
  });

  it("should create a center-text section with defaults", async () => {
    const program = Effect.gen(function* () {
      const websiteId = yield* createWebsite();
      const section = yield* CreateSectionUseCase.execute({
        websiteId,
        type: "center-text",
        position: 0,
      });

      expect(section.id).toBeTruthy();
      expect(section.type).toBe("center-text");
      expect(section.order).toBe(0);

      if (section.type === "center-text") {
        expect(section.settings.title).toBeDefined();
        expect(section.settings.content).toBeDefined();
      }
    });

    await Effect.runPromise(program.pipe(Effect.provide(ctx.testLayer)));
  });

  it("should create every supported section type with defaults", async () => {
    const program = Effect.gen(function* () {
      const websiteId = yield* createWebsite();
      const commands: CreateSectionCommand[] = [
        {
          websiteId: websiteId,
          type: "gallery",
          position: 0,
        },
        {
          websiteId: websiteId,
          type: "text-with-image",
          position: 1,
        },
        {
          websiteId: websiteId,
          type: "reason",
          position: 0,
        },
        {
          websiteId: websiteId,
          type: "stylists-section",
          position: 1,
        },
      ];
      const useCase = yield* CreateSectionUseCase;

      for (const command of commands) {
        const section = yield* useCase.execute(command);
        expect(section.type).toBe(command.type);

        if (section.type === "gallery") {
          expect(section.settings.title).toBeDefined();
          expect(section.settings.subtitle).toBeDefined();
          expect(section.settings.imageIds).toEqual([]);
        }

        if (section.type === "text-with-image") {
          expect(section.settings.title).toBeDefined();
          expect(section.settings.text).toBeDefined();
        }

        if (section.type === "reason") {
          expect(section.settings.title).toBeDefined();
          expect(section.settings.subtitle).toBeDefined();
          expect(section.settings.items.length).toBeGreaterThanOrEqual(2);
        }

        if (section.type === "stylists-section") {
          expect(section.settings.title).toBeDefined();
          expect(section.settings.subtitle).toBeDefined();
        }
      }

      const sectionTypes = yield* ListSectionsUseCase.execute({
        websiteId: websiteId,
      }).pipe(Effect.map((sections) => sections.map((s) => s.type)));

      expect(sectionTypes).toEqual([
        "reason",
        "stylists-section",
        "gallery",
        "text-with-image",
      ]);
    });

    await Effect.runPromise(program.pipe(Effect.provide(ctx.testLayer)));
  });

  it("should insert a section at a specific position and shift existing ones", async () => {
    const program = Effect.gen(function* () {
      const websiteId = yield* createWebsite();
      const listUseCase = yield* ListSectionsUseCase;

      const before = yield* listUseCase.execute({ websiteId });
      expect(before.length).toBe(0);

      const created = yield* CreateSectionUseCase.execute({
        websiteId,
        type: "center-text",
        position: 0,
      });

      const after = yield* listUseCase.execute({ websiteId });
      expect(after.length).toBe(before.length + 1);
      expect(after[0]?.id).toBe(created.id);
      expect(after.map((section) => section.order)).toEqual(
        after.map((_, index) => index),
      );
    });

    await Effect.runPromise(program.pipe(Effect.provide(ctx.testLayer)));
  });

  it("should fail to create section with invalid type", async () => {
    const program = Effect.gen(function* () {
      const websiteId = yield* createWebsite();
      const result = yield* CreateSectionUseCase.execute({
        websiteId,
        type: "invalid-type" as CreateSectionCommand["type"],
        position: 0,
      }).pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("InvalidSectionTypeError");
      }
    });

    await Effect.runPromise(program.pipe(Effect.provide(ctx.testLayer)));
  });

  it("should fail to create section for non-existent website", async () => {
    const program = Effect.gen(function* () {
      const result = yield* CreateSectionUseCase.execute({
        websiteId: crypto.randomUUID(),
        type: "center-text",
        position: 0,
      }).pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("SectionNotFoundError");
      }
    });

    await Effect.runPromise(program.pipe(Effect.provide(ctx.testLayer)));
  });
});
