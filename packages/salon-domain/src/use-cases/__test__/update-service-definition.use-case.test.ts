import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect, Either } from "effect";
import { setupTestContext, type TestContext } from "./test-setup";
import { CreateServiceDefinitionUseCase } from "../create-service-definition.use-case";
import { UpdateServiceDefinitionUseCase } from "../update-service-definition.use-case";

describe("UpdateServiceDefinitionUseCase", () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await setupTestContext();
  }, 60_000);

  afterAll(async () => {
    await ctx.stop();
  });

  it("should update a service definition with new phases", async () => {
    const program = Effect.gen(function* () {
      const createUseCase = yield* CreateServiceDefinitionUseCase;
      const updateUseCase = yield* UpdateServiceDefinitionUseCase;

      const service = yield* createUseCase.execute({
        salonId: ctx.salonId,
        serviceType: "custom",
        name: "Original Service",
        description: "Original description",
        priceInCents: 4500,
        phases: [
          { name: "Phase A", durationMinutes: 20, requiredResourceSlugs: [] },
        ],
      });

      const updated = yield* updateUseCase.execute({
        serviceId: service.id,
        name: "Updated Service",
        description: "Updated description",
        priceInCents: 5500,
        phases: [
          {
            name: "Consultation",
            durationMinutes: 5,
            requiredResourceSlugs: [],
          },
          { name: "Work", durationMinutes: 40, requiredResourceSlugs: [] },
        ],
      });

      expect(updated.name).toBe("Updated Service");
      expect(updated.priceInCents).toBe(5500);
      expect(updated.phases.length).toBe(2);
      expect(updated.durationMinutes).toBe(45);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.serviceUseCaseLayer)),
    );
  });

  it("should fail to update a non-existent service", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* UpdateServiceDefinitionUseCase;
      const result = yield* useCase
        .execute({
          serviceId: crypto.randomUUID(),
          name: "Ghost",
          description: "",
          priceInCents: 1000,
          phases: [{ name: "P", durationMinutes: 10, requiredResourceSlugs: [] }],
        })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("NotFoundError");
      }
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.serviceUseCaseLayer)),
    );
  });
});
