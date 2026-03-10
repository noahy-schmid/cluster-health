import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect, Either } from "effect";
import { setupTestContext, type TestContext } from "./test-setup";
import { CreateResourceUseCase } from "../create-resource.use-case";
import { DeleteResourceUseCase } from "../delete-resource.use-case";
import { ListResourcesUseCase } from "../list-resources.use-case";
import { CreateCustomServiceUseCase } from "../create-custom-service.use-case";
import { CreateSalonUseCase } from "../create-salon.use-case";

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
        slug: "deletable",
        name: "Deletable Resource",
        amount: 1,
      });

      const beforeDelete = yield* listUseCase.execute({
        salonId: ctx.salonId,
      });
      const countBefore = beforeDelete.length;

      yield* deleteUseCase.execute({
        salonId: ctx.salonId,
        slug: resource.slug,
      });

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
      const createServiceUC = yield* CreateCustomServiceUseCase;

      // Create a resource to reference
      const resource = yield* createResourceUC.execute({
        salonId: ctx.salonId,
        slug: "ref-resource",
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
            employeeRequired: true,
            requiredResourceSlugs: [resource.slug],
          },
        ],
      });

      // Now try to delete the resource - should fail
      const result = yield* deleteResourceUC
        .execute({ salonId: ctx.salonId, slug: resource.slug })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("ConflictError");
      }
    });

    await Effect.runPromise(
      program.pipe(
        Effect.provide(ctx.resourceUseCaseLayer),
        Effect.provide(ctx.salonUseCaseLayer),
        Effect.provide(ctx.serviceUseCaseLayer),
      ),
    );
  });

  it("should ignore resource references in other salons", async () => {
    const program = Effect.gen(function* () {
      const createSalonUC = yield* CreateSalonUseCase;
      const createResourceUC = yield* CreateResourceUseCase;
      const createServiceUC = yield* CreateCustomServiceUseCase;
      const deleteResourceUC = yield* DeleteResourceUseCase;

      const otherSalon = yield* createSalonUC.execute({
        name: "Other Salon",
        street: "Nebenstraße 3",
        postalCode: "80331",
        city: "München",
        phone: "+49 89 987654",
      });

      yield* createResourceUC.execute({
        salonId: otherSalon.id,
        slug: "shared-resource",
        name: "Shared Resource",
        amount: 1,
      });

      yield* createServiceUC.execute({
        salonId: otherSalon.id,
        name: "Other Salon Service",
        description: "Test",
        priceInCents: 4000,
        phases: [
          {
            name: "Phase 1",
            durationMinutes: 20,
            employeeRequired: true,
            requiredResourceSlugs: ["shared-resource"],
          },
        ],
      });

      const deletable = yield* createResourceUC.execute({
        salonId: ctx.salonId,
        slug: "shared-resource",
        name: "Shared Resource",
        amount: 1,
      });

      const result = yield* deleteResourceUC
        .execute({ salonId: ctx.salonId, slug: deletable.slug })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(false);
    });

    await Effect.runPromise(
      program.pipe(
        Effect.provide(ctx.salonUseCaseLayer),
        Effect.provide(ctx.resourceUseCaseLayer),
        Effect.provide(ctx.serviceUseCaseLayer),
      ),
    );
  });
});
