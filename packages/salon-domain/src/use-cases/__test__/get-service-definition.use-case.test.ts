import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect } from "effect";
import { setupTestContext, type TestContext } from "./test-setup";
import { CreateCustomServiceUseCase } from "../create-custom-service.use-case";
import { GetServiceDefinitionUseCase } from "../get-service-definition.use-case";

describe("GetServiceDefinitionUseCase", () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await setupTestContext();
  }, 60_000);

  afterAll(async () => {
    await ctx.stop();
  });

  it("should return a service definition by id", async () => {
    const program = Effect.gen(function* () {
      const createUseCase = yield* CreateCustomServiceUseCase;
      const getUseCase = yield* GetServiceDefinitionUseCase;

      const created = yield* createUseCase.execute({
        salonId: ctx.salonId,
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

      const found = yield* getUseCase.execute({ serviceId: created.id });

      expect(found.id).toBe(created.id);
      expect(found.name).toBe("Get Test Service");
      expect(found.description).toBe("For getting");
      expect(found.priceInCents).toBe(2500);
      expect(found.phases).toHaveLength(1);
      expect(found.phases[0]?.name).toBe("Phase A");
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.serviceUseCaseLayer)),
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
      program.pipe(Effect.provide(ctx.serviceUseCaseLayer)),
    );
  });
});
