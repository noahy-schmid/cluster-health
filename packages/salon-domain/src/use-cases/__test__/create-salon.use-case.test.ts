import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect, Either } from "effect";
import { setupTestContext, type TestContext } from "./test-setup";
import { CreateSalonUseCase } from "../create-salon.use-case";

describe("CreateSalonUseCase", () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await setupTestContext();
  }, 60_000);

  afterAll(async () => {
    await ctx.stop();
  });

  it("should create a salon", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* CreateSalonUseCase;
      const salon = yield* useCase.execute({
        name: "Atelier Nord",
        street: "Neue Straße 1",
        postalCode: "10115",
        city: "Berlin",
        phone: "+49 30 123456",
      });

      expect(salon.id).toBeTruthy();
      expect(salon.name).toBe("Atelier Nord");
      expect(salon.city).toBe("Berlin");
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.salonUseCaseLayer)),
    );
  });

  it("should fail when the salon name already exists", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* CreateSalonUseCase;

      yield* useCase.execute({
        name: "Salon Duplicate",
        street: "Erste Straße 1",
        postalCode: "20095",
        city: "Hamburg",
        phone: "+49 40 111111",
      });

      const result = yield* useCase
        .execute({
          name: "salon duplicate",
          street: "Andere Straße 2",
          postalCode: "20095",
          city: "Hamburg",
          phone: "+49 40 555555",
        })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("ConflictError");
      }
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.salonUseCaseLayer)),
    );
  });

  it("should fail with empty required fields", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* CreateSalonUseCase;

      const result = yield* useCase
        .execute({
          name: "   ",
          street: "Musterstraße 1",
          postalCode: "12345",
          city: "München",
          phone: "+49 89 123456",
        })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("ValidationError");
      }
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.salonUseCaseLayer)),
    );
  });
});
