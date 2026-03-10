import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect, Either } from "effect";
import {
  createSalon,
  setupTestEnvironment,
  type TestEnvironment,
} from "./test-setup";
import { CreateResourceUseCase } from "../create-resource.use-case";
import { DeleteResourceUseCase } from "../delete-resource.use-case";
import { ListResourcesUseCase } from "../list-resources.use-case";
import { CreateCustomServiceUseCase } from "../create-custom-service.use-case";

describe("DeleteResourceUseCase", () => {
  let env: TestEnvironment;
  let salonId: string;

  beforeAll(async () => {
    env = await setupTestEnvironment();
    salonId = (await createSalon(env)).id;
  }, 60_000);

  afterAll(async () => {
    await env.stop();
  });

  it("should delete a resource that is not referenced", async () => {
    const program = Effect.gen(function* () {
      const createUseCase = yield* CreateResourceUseCase;
      const deleteUseCase = yield* DeleteResourceUseCase;
      const listUseCase = yield* ListResourcesUseCase;

      const resource = yield* createUseCase.execute({
        salonId,
        slug: "deletable",
        name: "Deletable Resource",
        amount: 1,
      });

      const beforeDelete = yield* listUseCase.execute({
        salonId,
      });
      const countBefore = beforeDelete.length;

      yield* deleteUseCase.execute({
        salonId,
        slug: resource.slug,
      });

      const afterDelete = yield* listUseCase.execute({
        salonId,
      });
      expect(afterDelete.length).toBe(countBefore - 1);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.resourceUseCaseLayer)),
    );
  });

  it("should fail to delete a resource referenced by a service phase", async () => {
    const program = Effect.gen(function* () {
      const createResourceUC = yield* CreateResourceUseCase;
      const deleteResourceUC = yield* DeleteResourceUseCase;
      const createServiceUC = yield* CreateCustomServiceUseCase;

      // Create a resource to reference
      const resource = yield* createResourceUC.execute({
        salonId,
        slug: "ref-resource",
        name: "Referenced Resource",
        amount: 2,
      });

      // Create a service that references this resource
      yield* createServiceUC.execute({
        salonId,
        name: "Service with Resource",
        description: "Test",
        priceInCents: 5000,
        phases: [
          {
            name: "Phase 1",
            durationMinutes: 30,
            employeeRequired: true,
            requiredResourceSlugs: [resource.slug],
          },
        ],
      });

      // Now try to delete the resource - should fail
      const result = yield* deleteResourceUC
        .execute({ salonId, slug: resource.slug })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("ConflictError");
      }
    });

    await Effect.runPromise(
      program.pipe(
        Effect.provide(env.resourceUseCaseLayer),
        Effect.provide(env.serviceUseCaseLayer),
      ),
    );
  });
});
