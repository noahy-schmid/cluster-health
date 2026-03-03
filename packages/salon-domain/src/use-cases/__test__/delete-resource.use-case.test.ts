import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect, Either } from "effect";
import { setupTestContext, type TestContext } from "./test-setup";
import { CreateResourceUseCase } from "../create-resource.use-case";
import { DeleteResourceUseCase } from "../delete-resource.use-case";
import { ListResourcesUseCase } from "../list-resources.use-case";
import { CreateServiceDefinitionUseCase } from "../create-service-definition.use-case";

describe("DeleteResourceUseCase", () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await setupTestContext();
  }, 60_000);

  afterAll(async () => {
    await ctx.stop();
  });

  it("should delete a resource that is not referenced", async () => {
    const program = Effect.gen(function* () {
      const createUseCase = yield* CreateResourceUseCase;
      const deleteUseCase = yield* DeleteResourceUseCase;
      const listUseCase = yield* ListResourcesUseCase;

      const resource = yield* createUseCase.execute({
        salonId: ctx.salonId,
        name: "Deletable Resource",
        amount: 1,
      });

      const beforeDelete = yield* listUseCase.execute({
        salonId: ctx.salonId,
      });
      const countBefore = beforeDelete.length;

      yield* deleteUseCase.execute({ resourceId: resource.id });

      const afterDelete = yield* listUseCase.execute({
        salonId: ctx.salonId,
      });
      expect(afterDelete.length).toBe(countBefore - 1);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.resourceUseCaseLayer)),
    );
  });

  it("should fail to delete a resource referenced by a service phase", async () => {
    const program = Effect.gen(function* () {
      const createResourceUC = yield* CreateResourceUseCase;
      const deleteResourceUC = yield* DeleteResourceUseCase;
      const createServiceUC = yield* CreateServiceDefinitionUseCase;

      // Create a resource to reference
      const resource = yield* createResourceUC.execute({
        salonId: ctx.salonId,
        name: "Referenced Resource",
        amount: 2,
      });

      // Create a service that references this resource
      yield* createServiceUC.execute({
        salonId: ctx.salonId,
        name: "Service with Resource",
        description: "Test",
        priceInCents: 5000,
        phases: [
          {
            name: "Phase 1",
            durationMinutes: 30,
            requiredResourceIds: [resource.id],
          },
        ],
      });

      // Now try to delete the resource - should fail
      const result = yield* deleteResourceUC
        .execute({ resourceId: resource.id })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("ConflictError");
      }
    });

    await Effect.runPromise(
      program.pipe(
        Effect.provide(ctx.resourceUseCaseLayer),
        Effect.provide(ctx.serviceUseCaseLayer),
      ),
    );
  });
});
