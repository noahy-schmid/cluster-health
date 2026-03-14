import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect, Either } from "effect";
import {
  createCustomServiceCommand,
  createSalonInput,
  createUpdateCustomServiceCommand,
} from "./fixtures";
import {
  createSalon,
  setupTestEnvironment,
  type TestEnvironment,
} from "./test-setup";
import { CreateCustomServiceUseCase } from "../create-custom-service.use-case";
import { UpdateCustomServiceUseCase } from "../update-custom-service.use-case";

describe("UpdateCustomServiceUseCase", () => {
  let env: TestEnvironment;
  let salonId: string;

  beforeAll(async () => {
    env = await setupTestEnvironment();
    salonId = (await createSalon(env, createSalonInput())).id;
  }, 60_000);

  afterAll(async () => {
    await env.stop();
  });

  it("should update a custom service definition with new phases", async () => {
    const service = await Effect.runPromise(
      CreateCustomServiceUseCase.execute(
        createCustomServiceCommand({ salonId }),
      ).pipe(Effect.provide(env.serviceUseCaseLayer)),
    );

    const program = Effect.gen(function* () {
      const updateUseCase = yield* UpdateCustomServiceUseCase;

      const updated = yield* updateUseCase.execute(
        createUpdateCustomServiceCommand({
          serviceId: service.id,
          name: "Updated Service",
          description: "Updated description",
          priceInCents: 5500,
          phases: [
            {
              name: "Consultation",
              durationMinutes: 5,
              employeeRequired: true,
              requiredResourceSlugs: [],
            },
            {
              name: "Work",
              durationMinutes: 40,
              employeeRequired: true,
              requiredResourceSlugs: [],
            },
          ],
        }),
      );

      expect(updated.name).toBe("Updated Service");
      expect(updated.priceInCents).toBe(5500);
      expect(updated.phases.length).toBe(2);
      expect(updated.durationMinutes).toBe(45);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.serviceUseCaseLayer)),
    );
  });

  it("should fail to update a non-existent service", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* UpdateCustomServiceUseCase;
      const result = yield* useCase
        .execute(
          createUpdateCustomServiceCommand({
            serviceId: crypto.randomUUID(),
            name: "Ghost",
            description: "",
            priceInCents: 1000,
            phases: [
              {
                name: "P",
                durationMinutes: 10,
                employeeRequired: true,
                requiredResourceSlugs: [],
              },
            ],
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
