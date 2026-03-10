import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect } from "effect";
import {
  createSalon,
  createServiceDefinition,
  setupTestEnvironment,
  type TestEnvironment,
} from "./test-setup";
import { ListServiceDefinitionsUseCase } from "../list-service-definitions.use-case";

describe("ListServiceDefinitionsUseCase", () => {
  let env: TestEnvironment;
  let salonId: string;

  beforeAll(async () => {
    env = await setupTestEnvironment();
    salonId = (await createSalon(env)).id;
  }, 60_000);

  afterAll(async () => {
    await env.stop();
  });

  it("should list service definitions for a salon", async () => {
    await createServiceDefinition(env, {
      salonId,
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

    const program = Effect.gen(function* () {
      const listUseCase = yield* ListServiceDefinitionsUseCase;

      const services = yield* listUseCase.execute({
        salonId,
      });

      expect(services.length).toBeGreaterThanOrEqual(1);
      expect(services.some((s) => s.name === "List Test Service")).toBe(true);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.serviceUseCaseLayer)),
    );
  });
});
