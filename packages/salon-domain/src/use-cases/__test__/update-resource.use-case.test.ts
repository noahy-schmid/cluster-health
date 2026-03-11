import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect } from "effect";
import {
  createMockResource,
  createMockSalon,
  setupTestEnvironment,
  type TestEnvironment,
} from "./test-setup";
import { UpdateResourceUseCase } from "../update-resource.use-case";

describe("UpdateResourceUseCase", () => {
  let env: TestEnvironment;
  let salonId: string;

  beforeAll(async () => {
    env = await setupTestEnvironment();
    salonId = (await createMockSalon(env)).id;
  }, 60_000);

  afterAll(async () => {
    await env.stop();
  });

  it("should update a resource", async () => {
    const resource = await createMockResource(env, {
      salonId,
      slug: "old-resource",
      name: "Old Name",
      amount: 2,
    });

    const program = Effect.gen(function* () {
      const updateUseCase = yield* UpdateResourceUseCase;

      const updated = yield* updateUseCase.execute({
        salonId,
        slug: resource.slug,
        name: "New Name",
        amount: 5,
      });

      expect(updated.name).toBe("New Name");
      expect(updated.amount).toBe(5);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.resourceUseCaseLayer)),
    );
  });
});
