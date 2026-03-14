import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect } from "effect";
import {
  createCustomServiceCommand,
  createListServiceDefinitionsQuery,
  createSalonInput,
} from "./fixtures";
import {
  createSalon,
  setupTestEnvironment,
  type TestEnvironment,
} from "./test-setup";
import { CreateCustomServiceUseCase } from "../create-custom-service.use-case";
import { ListServiceDefinitionsUseCase } from "../list-service-definitions.use-case";

describe("ListServiceDefinitionsUseCase", () => {
  let env: TestEnvironment;
  let salonId: string;

  beforeAll(async () => {
    env = await setupTestEnvironment();
    salonId = (await createSalon(env, createSalonInput())).id;
  }, 60_000);

  afterAll(async () => {
    await env.stop();
  });

  it("should list service definitions for a salon", async () => {
    const created = await Effect.runPromise(
      CreateCustomServiceUseCase.execute(
        createCustomServiceCommand({ salonId }),
      ).pipe(Effect.provide(env.serviceUseCaseLayer)),
    );

    const program = Effect.gen(function* () {
      const listUseCase = yield* ListServiceDefinitionsUseCase;

      const services = yield* listUseCase.execute(
        createListServiceDefinitionsQuery({ salonId }),
      );

      expect(services.length).toBeGreaterThanOrEqual(1);
      expect(services.some((s) => s.name === created.name)).toBe(true);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.serviceUseCaseLayer)),
    );
  });
});
