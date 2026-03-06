import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect, Either } from "effect";
import { setupTestContext, type TestContext } from "./test-setup";
import { CreateServiceDefinitionUseCase } from "../create-service-definition.use-case";
import { DeleteServiceDefinitionUseCase } from "../delete-service-definition.use-case";
import { ListServiceDefinitionsUseCase } from "../list-service-definitions.use-case";

describe("DeleteServiceDefinitionUseCase", () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await setupTestContext();
  }, 60_000);

  afterAll(async () => {
    await ctx.stop();
  });

  it("should soft-delete a service definition", async () => {
    const program = Effect.gen(function* () {
      const createUseCase = yield* CreateServiceDefinitionUseCase;
      const deleteUseCase = yield* DeleteServiceDefinitionUseCase;
      const listUseCase = yield* ListServiceDefinitionsUseCase;

      const service = yield* createUseCase.execute({
        salonId: ctx.salonId,
        serviceType: "custom",
        name: "Temporary Service",
        description: "Will be deleted",
        priceInCents: 2000,
        phases: [
          {
            name: "Quick Phase",
            durationMinutes: 15,
            requiredResourceSlugs: [],
          },
        ],
      });

      const beforeDelete = yield* listUseCase.execute({
        salonId: ctx.salonId,
      });
      const countBefore = beforeDelete.length;

      yield* deleteUseCase.execute({ serviceId: service.id });

      // Soft-deleted services should not appear in the list
      const afterDelete = yield* listUseCase.execute({
        salonId: ctx.salonId,
      });
      expect(afterDelete.length).toBe(countBefore - 1);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.serviceUseCaseLayer)),
    );
  });

  it("should fail to delete a non-existent service", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* DeleteServiceDefinitionUseCase;
      const result = yield* useCase
        .execute({ serviceId: crypto.randomUUID() })
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
