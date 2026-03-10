import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect } from "effect";
import {
  createResource,
  createSalon,
  setupTestEnvironment,
  type TestEnvironment,
} from "./test-setup";
import { ListResourcesUseCase } from "../list-resources.use-case";

describe("ListResourcesUseCase", () => {
  let env: TestEnvironment;
  let salonId: string;

  beforeAll(async () => {
    env = await setupTestEnvironment();
    salonId = (await createSalon(env)).id;
  }, 60_000);

  afterAll(async () => {
    await env.stop();
  });

  it("should list resources for a salon", async () => {
    await createResource(env, {
      salonId,
      slug: "list-test",
      name: "List Test Resource",
      amount: 1,
    });

    const program = Effect.gen(function* () {
      const listUseCase = yield* ListResourcesUseCase;

      const resources = yield* listUseCase.execute({
        salonId,
      });

      expect(resources.length).toBeGreaterThanOrEqual(1);
      expect(resources.some((r) => r.name === "List Test Resource")).toBe(true);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.resourceUseCaseLayer)),
    );
  });
});
