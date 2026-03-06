import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect, Either } from "effect";
import { setupTestContext, type TestContext } from "./test-setup";
import { CreateServiceDefinitionUseCase } from "../create-service-definition.use-case";

describe("CreateServiceDefinitionUseCase", () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await setupTestContext();
  }, 60_000);

  afterAll(async () => {
    await ctx.stop();
  });

  it("should create a service definition with phases", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* CreateServiceDefinitionUseCase;
      const service = yield* useCase.execute({
        salonId: ctx.salonId,
        serviceType: "custom",
        name: "Haircut & Style",
        description: "A complete haircut and styling service",
        priceInCents: 4500,
        phases: [
          { name: "Wash", durationMinutes: 10, requiredResourceSlugs: [] },
          { name: "Cut", durationMinutes: 30, requiredResourceSlugs: [] },
          { name: "Style", durationMinutes: 15, requiredResourceSlugs: [] },
        ],
      });

      expect(service.id).toBeDefined();
      expect(service.salonId).toBe(ctx.salonId);
      expect(service.name).toBe("Haircut & Style");
      expect(service.priceInCents).toBe(4500);
      expect(service.phases.length).toBe(3);
      expect(service.durationMinutes).toBe(55);
      expect(service.phases[0]?.name).toBe("Wash");
      expect(service.phases[0]?.order).toBe(0);
      expect(service.phases[1]?.name).toBe("Cut");
      expect(service.phases[2]?.name).toBe("Style");
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.serviceUseCaseLayer)),
    );
  });

  it("should fail to create a service with no phases", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* CreateServiceDefinitionUseCase;
      const result = yield* useCase
        .execute({
          salonId: ctx.salonId,
          serviceType: "custom",
          name: "Empty Service",
          description: "",
          priceInCents: 1000,
          phases: [],
        })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("ValidationError");
      }
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.serviceUseCaseLayer)),
    );
  });

  it("should fail to create a service with empty name", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* CreateServiceDefinitionUseCase;
      const result = yield* useCase
        .execute({
          salonId: ctx.salonId,
          serviceType: "custom",
          name: "  ",
          description: "",
          priceInCents: 1000,
          phases: [
            { name: "Phase", durationMinutes: 10, requiredResourceSlugs: [] },
          ],
        })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("ValidationError");
      }
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.serviceUseCaseLayer)),
    );
  });
});
