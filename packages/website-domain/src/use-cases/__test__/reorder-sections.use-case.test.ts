import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Effect, Either } from "effect";
import {
  createWebsite,
  setupTestContext,
  type TestContext,
} from "./test-setup";
import { CreateSectionUseCase } from "../create-section.use-case";
import { ListSectionsUseCase } from "../list-sections.use-case";
import {
  ReorderSectionsUseCase,
  type ReorderSectionsCommand,
} from "../reorder-sections.use-case";

describe("ReorderSectionsUseCase", () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await setupTestContext();

    await Effect.runPromise(
      Effect.gen(function* () {
        const websiteId = yield* createWebsite();
        const createUseCase = yield* CreateSectionUseCase;

        yield* createUseCase.execute({
          websiteId: websiteId,
          type: "center-text",
          position: 0,
        });
        yield* createUseCase.execute({
          websiteId: websiteId,
          type: "gallery",
          position: 1,
        });
        yield* createUseCase.execute({
          websiteId: websiteId,
          type: "stylists-section",
          position: 2,
        });
      }).pipe(Effect.provide(ctx.testLayer)),
    );
  }, 60_000);

  afterAll(async () => {
    await ctx.stop();
  });

  it("should reorder sections by moving a single section", async () => {
    const program = Effect.gen(function* () {
      const websiteId = yield* createWebsite();
      const listUseCase = yield* ListSectionsUseCase;
      const reorderUseCase = yield* ReorderSectionsUseCase;
      const createSectionUseCase = yield* CreateSectionUseCase;

      // Create 3 sections to reorder
      yield* Effect.repeat({
        times: 2,
      })(
        createSectionUseCase.execute({
          websiteId: websiteId,
          type: "center-text",
          position: 0,
        }),
      );

      const sections = yield* listUseCase.execute({
        websiteId: websiteId,
      });
      expect(sections.length).toBe(3);

      const sectionToMove = sections[0]!;
      const targetIndex = sections.length - 1;

      const command: ReorderSectionsCommand = {
        websiteId: websiteId,
        sectionId: sectionToMove.id,
        newIndex: targetIndex,
      };

      yield* reorderUseCase.execute(command);

      const reordered = yield* listUseCase.execute({
        websiteId: websiteId,
      });
      expect(reordered[targetIndex]?.id).toBe(sectionToMove.id);
      expect(reordered.map((section) => section.order)).toEqual(
        reordered.map((_, index) => index),
      );
    });

    await Effect.runPromise(program.pipe(Effect.provide(ctx.testLayer)));
  });

  it("should fail to reorder when the section does not belong to the website", async () => {
    const program = Effect.gen(function* () {
      const websiteId = yield* createWebsite();
      const otherWebsiteId = yield* createWebsite();

      const section = yield* CreateSectionUseCase.execute({
        websiteId: otherWebsiteId,
        type: "center-text",
        position: 0,
      });

      const result = yield* ReorderSectionsUseCase.execute({
        websiteId: websiteId,
        sectionId: section.id,
        newIndex: 0,
      }).pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("SectionError");
      }
    });

    await Effect.runPromise(program.pipe(Effect.provide(ctx.testLayer)));
  });
});
