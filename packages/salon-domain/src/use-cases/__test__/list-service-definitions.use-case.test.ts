import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect } from "effect";
import { setupTestContext, type TestContext } from "./test-setup";
import { CreateCustomServiceUseCase } from "../create-custom-service.use-case";
import { ListServiceDefinitionsUseCase } from "../list-service-definitions.use-case";

describe("ListServiceDefinitionsUseCase", () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await setupTestContext();
  }, 60_000);

  afterAll(async () => {
    await ctx.stop();
  });

  it("should list service definitions for a salon", async () => {
    const program = Effect.gen(function* () {
      const createUseCase = yield* CreateCustomServiceUseCase;
      const listUseCase = yield* ListServiceDefinitionsUseCase;

      yield* createUseCase.execute({
        salonId: ctx.salonId,
        name: "List Test Service",
        description: "For listing",
        priceInCents: 3000,
        phases: [
          {
            name: "Phase 1",
            durationMinutes: 20,
            employeeRequired: true,
            requiredResourceSlugs: [],
          },
        ],
      });

      const services = yield* listUseCase.execute({
        salonId: ctx.salonId,
      });

      expect(services.length).toBeGreaterThanOrEqual(1);
      expect(services.some((s) => s.name === "List Test Service")).toBe(true);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.serviceUseCaseLayer)),
    );
  });
});
