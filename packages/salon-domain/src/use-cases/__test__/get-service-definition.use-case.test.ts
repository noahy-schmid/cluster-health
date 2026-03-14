import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect } from "effect";
import {
  createCustomServiceCommand,
  createGetServiceDefinitionQuery,
  createSalonInput,
} from "./fixtures";
import {
  createSalon,
  setupTestEnvironment,
  type TestEnvironment,
} from "./test-setup";
import { CreateCustomServiceUseCase } from "../create-custom-service.use-case";
import { GetServiceDefinitionUseCase } from "../get-service-definition.use-case";

describe("GetServiceDefinitionUseCase", () => {
  let env: TestEnvironment;
  let salonId: string;

  beforeAll(async () => {
    env = await setupTestEnvironment();
    salonId = (await createSalon(env, createSalonInput())).id;
  }, 60_000);

  afterAll(async () => {
    await env.stop();
  });

  it("should return a service definition by id", async () => {
    const created = await Effect.runPromise(
      CreateCustomServiceUseCase.execute(
        createCustomServiceCommand({ salonId }),
      ).pipe(Effect.provide(env.serviceUseCaseLayer)),
    );

    const program = Effect.gen(function* () {
      const getUseCase = yield* GetServiceDefinitionUseCase;

      const found = yield* getUseCase.execute(
        createGetServiceDefinitionQuery({ serviceId: created.id }),
      );

      expect(found.id).toBe(created.id);
      expect(found.name).toBe(created.name);
      expect(found.description).toBe(created.description);
      expect(found.priceInCents).toBe(created.priceInCents);
      expect(found.phases).toHaveLength(1);
      expect(found.phases[0]?.name).toBe(created.phases[0]?.name);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.serviceUseCaseLayer)),
    );
  });

  it("should fail with NotFoundError for non-existent service", async () => {
    const program = Effect.gen(function* () {
      const getUseCase = yield* GetServiceDefinitionUseCase;

      const result = yield* getUseCase
        .execute({
          serviceId: "00000000-0000-0000-0000-000000000000",
        })
        .pipe(
          Effect.map(() => "should-not-reach" as const),
          Effect.catchTag("NotFoundError", (error) =>
            Effect.succeed(`not-found:${error.entity}` as const),
          ),
        );

      expect(result).toBe("not-found:ServiceDefinition");
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.serviceUseCaseLayer)),
    );
  });
});
