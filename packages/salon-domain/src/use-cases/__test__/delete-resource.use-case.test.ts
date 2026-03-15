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
      const otherSalon = yield* CreateSalonUseCase.execute({
        name: "Other Salon",
        street: "Nebenstraße 3",
        postalCode: "80331",
        city: "München",
        phone: "+49 89 987654",
      });

      yield* CreateResourceUseCase.execute({
        salonId: otherSalon.id,
        slug: "shared-resource",
        name: "Shared Resource",
        amount: 1,
      });

      yield* CreateCustomServiceUseCase.execute({
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

      const deletable = yield* CreateResourceUseCase.execute({
        salonId: ctx.salonId,
        slug: "shared-resource",
        name: "Shared Resource",
        amount: 1,
      });

      const result = yield* DeleteResourceUseCase.execute({
        salonId: ctx.salonId,
        slug: deletable.slug,
      }).pipe(Effect.either);

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

  it("should delete a resource in one salon while keeping the same slug in another salon", async () => {
    const program = Effect.gen(function* () {
      const otherSalon = yield* CreateSalonUseCase.execute({
        name: "Second Other Salon",
        street: "Parallelstraße 7",
        postalCode: "80333",
        city: "München",
        phone: "+49 89 111222",
      });

      const slug = "cross-salon-shared-resource";

      yield* CreateResourceUseCase.execute({
        salonId: ctx.salonId,
        slug,
        name: "Shared Slug Resource",
        amount: 1,
      });

      yield* CreateResourceUseCase.execute({
        salonId: otherSalon.id,
        slug,
        name: "Shared Slug Resource",
        amount: 2,
      });

      yield* DeleteResourceUseCase.execute({
        salonId: ctx.salonId,
        slug,
      });

      const firstSalonResources = yield* ListResourcesUseCase.execute({
        salonId: ctx.salonId,
      });
      const secondSalonResources = yield* ListResourcesUseCase.execute({
        salonId: otherSalon.id,
      });

      expect(
        firstSalonResources.some((resource) => resource.slug === slug),
      ).toBe(false);
      expect(
        secondSalonResources.some((resource) => resource.slug === slug),
      ).toBe(true);
    });

    await Effect.runPromise(
      program.pipe(
        Effect.provide(ctx.salonUseCaseLayer),
        Effect.provide(ctx.resourceUseCaseLayer),
      ),
    );
  });
});
