import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect, Either } from "effect";
import { setupTestContext, type TestContext } from "./test-setup";
import { CreateSalonUseCase } from "../create-salon.use-case";
import { UpdateSalonUseCase } from "../update-salon.use-case";

describe("UpdateSalonUseCase", () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await setupTestContext();
  }, 60_000);

  afterAll(async () => {
    await ctx.stop();
  });

  it("should update an existing salon", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* UpdateSalonUseCase;
      const updated = yield* useCase.execute({
        salonId: ctx.salonId,
        name: "Test Service Salon Updated",
        street: "Neue Straße 5",
        postalCode: "54321",
        city: "Leipzig",
        phone: "+49 341 123456",
      });

      expect(updated.name).toBe("Test Service Salon Updated");
      expect(updated.city).toBe("Leipzig");
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.salonUseCaseLayer)),
    );
  });

  it("should fail when updating to an existing salon name", async () => {
    const program = Effect.gen(function* () {
      const createUseCase = yield* CreateSalonUseCase;
      const updateUseCase = yield* UpdateSalonUseCase;

      const otherSalon = yield* createUseCase.execute({
        name: "Second Salon",
        street: "Testweg 2",
        postalCode: "99999",
        city: "Köln",
        phone: "+49 221 999999",
      });

      const result = yield* updateUseCase
        .execute({
          salonId: ctx.salonId,
          name: otherSalon.name,
          street: "Neue Straße 5",
          postalCode: "54321",
          city: "Leipzig",
          phone: "+49 341 123456",
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

  it("should fail when the salon does not exist", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* UpdateSalonUseCase;
      const result = yield* useCase
        .execute({
          salonId: crypto.randomUUID(),
          name: "Unknown Salon",
          street: "Unbekannt 1",
          postalCode: "12345",
          city: "Berlin",
          phone: "+49 30 000000",
        })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("NotFoundError");
      }
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.salonUseCaseLayer)),
    );
  });
});
