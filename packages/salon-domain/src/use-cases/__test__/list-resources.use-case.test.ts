import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect } from "effect";
import {
  createMockResource,
  createMockSalon,
  setupTestEnvironment,
  type TestEnvironment,
} from "./test-setup";
import { ListResourcesUseCase } from "../list-resources.use-case";

describe("ListResourcesUseCase", () => {
  let env: TestEnvironment;
  let salonId: string;

  beforeAll(async () => {
    env = await setupTestEnvironment();
    salonId = (await createMockSalon(env)).id;
  }, 60_000);

  afterAll(async () => {
    await env.stop();
  });

  it("should list resources for a salon", async () => {
    const resource = await createMockResource(env, salonId);

    const program = Effect.gen(function* () {
      const listUseCase = yield* ListResourcesUseCase;

      const resources = yield* listUseCase.execute({
        salonId,
      });

      expect(resources.length).toBeGreaterThanOrEqual(1);
      expect(resources.some((r) => r.slug === resource.slug)).toBe(true);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.resourceUseCaseLayer)),
    );
  });
});
