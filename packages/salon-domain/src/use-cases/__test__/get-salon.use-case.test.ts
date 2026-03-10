import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect, Either } from "effect";
import { setupTestContext, type TestContext } from "./test-setup";
import { GetSalonUseCase } from "../get-salon.use-case";

describe("GetSalonUseCase", () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await setupTestContext();
  }, 60_000);

  afterAll(async () => {
    await ctx.stop();
  });

  it("should fetch an existing salon", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* GetSalonUseCase;
      const salon = yield* useCase.execute({ salonId: ctx.salonId });

      expect(salon.id).toBe(ctx.salonId);
      expect(salon.name).toContain("Test Service Salon");
    });

    await Effect.runPromise(program.pipe(Effect.provide(ctx.salonUseCaseLayer)));
  });

  it("should fail when the salon does not exist", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* GetSalonUseCase;
      const result = yield* useCase
        .execute({ salonId: crypto.randomUUID() })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("NotFoundError");
      }
    });

    await Effect.runPromise(program.pipe(Effect.provide(ctx.salonUseCaseLayer)));
  });
});
