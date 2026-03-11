import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect } from "effect";
import {
  createMockSalon,
  createMockServiceDefinition,
  setupTestEnvironment,
  type TestEnvironment,
} from "./test-setup";
import { ListServiceDefinitionsUseCase } from "../list-service-definitions.use-case";

describe("ListServiceDefinitionsUseCase", () => {
  let env: TestEnvironment;
  let salonId: string;

  beforeAll(async () => {
    env = await setupTestEnvironment();
    salonId = (await createMockSalon(env)).id;
  }, 60_000);

  afterAll(async () => {
    await env.stop();
  });

  it("should list service definitions for a salon", async () => {
    const created = await createMockServiceDefinition(env, salonId);

    const program = Effect.gen(function* () {
      const listUseCase = yield* ListServiceDefinitionsUseCase;

      const services = yield* listUseCase.execute({
        salonId,
      });

      expect(services.length).toBeGreaterThanOrEqual(1);
      expect(services.some((s) => s.name === created.name)).toBe(true);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.serviceUseCaseLayer)),
    );
  });
});
