import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect, Either } from "effect";
import {
  createCustomServiceCommand,
  createDeleteResourceCommand,
  createListResourcesQuery,
  createResourceCommand,
  createSalonInput,
} from "./fixtures";
import {
  createSalon,
  setupTestEnvironment,
  type TestEnvironment,
} from "./test-setup";
import { CreateResourceUseCase } from "../create-resource.use-case";
import { CreateCustomServiceUseCase } from "../create-custom-service.use-case";
import { DeleteResourceUseCase } from "../delete-resource.use-case";
import { ListResourcesUseCase } from "../list-resources.use-case";

describe("DeleteResourceUseCase", () => {
  let env: TestEnvironment;
  let salonId: string;

  beforeAll(async () => {
    env = await setupTestEnvironment();
    salonId = (await createSalon(env, createSalonInput())).id;
  }, 60_000);

  afterAll(async () => {
    await env.stop();
  });

  it("should delete a resource that is not referenced", async () => {
    const resource = await Effect.runPromise(
      CreateResourceUseCase.execute(createResourceCommand({ salonId })).pipe(
        Effect.provide(env.resourceUseCaseLayer),
      ),
    );

    const program = Effect.gen(function* () {
      const deleteUseCase = yield* DeleteResourceUseCase;
      const listUseCase = yield* ListResourcesUseCase;

      const beforeDelete = yield* listUseCase.execute(
        createListResourcesQuery({ salonId }),
      );
      const countBefore = beforeDelete.length;

      yield* deleteUseCase.execute(
        createDeleteResourceCommand({ salonId, slug: resource.slug }),
      );

      const afterDelete = yield* listUseCase.execute(
        createListResourcesQuery({ salonId }),
      );
      expect(afterDelete.length).toBe(countBefore - 1);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.resourceUseCaseLayer)),
    );
  });

  it("should fail to delete a resource referenced by a service phase", async () => {
    const resource = await Effect.runPromise(
      CreateResourceUseCase.execute(createResourceCommand({ salonId })).pipe(
        Effect.provide(env.resourceUseCaseLayer),
      ),
    );
    await Effect.runPromise(
      CreateCustomServiceUseCase.execute(
        createCustomServiceCommand({
          salonId,
          phases: [
            {
              name: "Phase Using Resource",
              durationMinutes: 30,
              employeeRequired: true,
              requiredResourceSlugs: [resource.slug],
            },
          ],
        }),
      ).pipe(Effect.provide(env.serviceUseCaseLayer)),
    );

    const program = Effect.gen(function* () {
      const deleteResourceUC = yield* DeleteResourceUseCase;
      const result = yield* deleteResourceUC
        .execute(createDeleteResourceCommand({ salonId, slug: resource.slug }))
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("ConflictError");
      }
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.resourceUseCaseLayer)),
    );
  });
});
