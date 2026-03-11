import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect, Either } from "effect";
import {
  createCustomServiceCommand,
  createDeleteServiceDefinitionCommand,
  createListServiceDefinitionsQuery,
  createSalonInput,
} from "./fixtures";
import {
  createSalon,
  setupTestEnvironment,
  type TestEnvironment,
} from "./test-setup";
import { CreateCustomServiceUseCase } from "../create-custom-service.use-case";
import { DeleteServiceDefinitionUseCase } from "../delete-service-definition.use-case";
import { ListServiceDefinitionsUseCase } from "../list-service-definitions.use-case";

describe("DeleteServiceDefinitionUseCase", () => {
  let env: TestEnvironment;
  let salonId: string;

  beforeAll(async () => {
    env = await setupTestEnvironment();
    salonId = (await createSalon(env, createSalonInput())).id;
  }, 60_000);

  afterAll(async () => {
    await env.stop();
  });

  it("should soft-delete a service definition", async () => {
    const service = await Effect.runPromise(
      CreateCustomServiceUseCase.execute(
        createCustomServiceCommand({ salonId }),
      ).pipe(Effect.provide(env.serviceUseCaseLayer)),
    );

    const program = Effect.gen(function* () {
      const deleteUseCase = yield* DeleteServiceDefinitionUseCase;
      const listUseCase = yield* ListServiceDefinitionsUseCase;

      const beforeDelete = yield* listUseCase.execute(
        createListServiceDefinitionsQuery({ salonId }),
      );
      const countBefore = beforeDelete.length;

      yield* deleteUseCase.execute(
        createDeleteServiceDefinitionCommand({ serviceId: service.id }),
      );

      // Soft-deleted services should not appear in the list
      const afterDelete = yield* listUseCase.execute(
        createListServiceDefinitionsQuery({ salonId }),
      );
      expect(afterDelete.length).toBe(countBefore - 1);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.serviceUseCaseLayer)),
    );
  });

  it("should fail to delete a non-existent service", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* DeleteServiceDefinitionUseCase;
      const result = yield* useCase
        .execute(
          createDeleteServiceDefinitionCommand({
            serviceId: crypto.randomUUID(),
          }),
        )
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("NotFoundError");
      }
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.serviceUseCaseLayer)),
    );
  });
});
