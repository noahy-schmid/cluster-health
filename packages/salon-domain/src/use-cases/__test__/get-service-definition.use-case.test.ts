import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect } from "effect";
import {
  createMockSalon,
  createMockServiceDefinition,
  setupTestEnvironment,
  type TestEnvironment,
} from "./test-setup";
import { GetServiceDefinitionUseCase } from "../get-service-definition.use-case";

describe("GetServiceDefinitionUseCase", () => {
  let env: TestEnvironment;
  let salonId: string;

  beforeAll(async () => {
    env = await setupTestEnvironment();
    salonId = (await createMockSalon(env)).id;
  }, 60_000);

  afterAll(async () => {
    await env.stop();
  });

  it("should return a service definition by id", async () => {
    const created = await createMockServiceDefinition(env, {
      salonId,
      name: "Get Test Service",
      description: "For getting",
      priceInCents: 2500,
      phases: [
        {
          name: "Phase A",
          durationMinutes: 15,
          employeeRequired: true,
          requiredResourceSlugs: [],
        },
      ],
    });

    const program = Effect.gen(function* () {
      const getUseCase = yield* GetServiceDefinitionUseCase;

      const found = yield* getUseCase.execute({ serviceId: created.id });

      expect(found.id).toBe(created.id);
      expect(found.name).toBe("Get Test Service");
      expect(found.description).toBe("For getting");
      expect(found.priceInCents).toBe(2500);
      expect(found.phases).toHaveLength(1);
      expect(found.phases[0]?.name).toBe("Phase A");
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
