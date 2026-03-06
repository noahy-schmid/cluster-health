import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect, Either } from "effect";
import { setupTestContext, type TestContext } from "./test-setup";
import { CreateColorationServiceUseCase } from "../create-coloration-service.use-case";

describe("CreateColorationServiceUseCase", () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await setupTestContext();
  }, 60_000);

  afterAll(async () => {
    await ctx.stop();
  });

  it("should create a coloration service with three phases", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* CreateColorationServiceUseCase;
      const service = yield* useCase.execute({
        salonId: ctx.salonId,
        name: "Full Color",
        description: "Complete coloration service",
        priceInCents: 12000,
        applicationDurationMinutes: 20,
        processingDurationMinutes: 30,
        finishingDurationMinutes: 15,
      });

      expect(service.id).toBeDefined();
      expect(service.salonId).toBe(ctx.salonId);
      expect(service.name).toBe("Full Color");
      expect(service.serviceType).toBe("coloration");
      expect(service.priceInCents).toBe(12000);
      expect(service.phases.length).toBe(3);
      expect(service.durationMinutes).toBe(65);

      expect(service.phases[0]?.name).toBe("Application");
      expect(service.phases[0]?.durationMinutes).toBe(20);
      expect(service.phases[1]?.name).toBe("Processing");
      expect(service.phases[1]?.durationMinutes).toBe(30);
      expect(service.phases[2]?.name).toBe("Finishing");
      expect(service.phases[2]?.durationMinutes).toBe(15);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.simpleColorationUseCaseLayer)),
    );
  });

  it("should fail with ResourceMissingError when climazon resource is missing", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* CreateColorationServiceUseCase;
      const result = yield* useCase
        .execute({
          salonId: crypto.randomUUID(),
          name: "No Climazon Service",
          description: "Missing climazon",
          priceInCents: 10000,
          applicationDurationMinutes: 20,
          processingDurationMinutes: 30,
          finishingDurationMinutes: 15,
        })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("ResourceMissingError");
      }
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.simpleColorationUseCaseLayer)),
    );
  });
});
