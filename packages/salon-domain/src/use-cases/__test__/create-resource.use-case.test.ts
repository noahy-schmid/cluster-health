import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect, Either } from "effect";
import { setupTestContext, type TestContext } from "./test-setup";
import { CreateResourceUseCase } from "../create-resource.use-case";

describe("CreateResourceUseCase", () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await setupTestContext();
  }, 60_000);

  afterAll(async () => {
    await ctx.stop();
  });

  it("should create a resource", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* CreateResourceUseCase;
      const resource = yield* useCase.execute({
        salonId: ctx.salonId,
        slug: "dryer",
        name: "Dryer",
        amount: 3,
      });

      expect(resource.slug).toBe("dryer");
      expect(resource.salonId).toBe(ctx.salonId);
      expect(resource.name).toBe("Dryer");
      expect(resource.amount).toBe(3);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.resourceUseCaseLayer)),
    );
  });

  it("should fail with empty name", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* CreateResourceUseCase;
      const result = yield* useCase
        .execute({ salonId: ctx.salonId, slug: "blank", name: "  ", amount: 1 })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("ValidationError");
      }
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.resourceUseCaseLayer)),
    );
  });

  it("should fail with amount < 1", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* CreateResourceUseCase;
      const result = yield* useCase
        .execute({
          salonId: ctx.salonId,
          slug: "bad",
          name: "Dryer",
          amount: 0,
        })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("ValidationError");
      }
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.resourceUseCaseLayer)),
    );
  });
});
