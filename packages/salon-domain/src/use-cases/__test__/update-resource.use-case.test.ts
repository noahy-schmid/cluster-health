import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect } from "effect";
import {
  createSalon,
  setupTestEnvironment,
  type TestEnvironment,
} from "./test-setup";
import { CreateResourceUseCase } from "../create-resource.use-case";
import { UpdateResourceUseCase } from "../update-resource.use-case";

describe("UpdateResourceUseCase", () => {
  let env: TestEnvironment;
  let salonId: string;

  beforeAll(async () => {
    env = await setupTestEnvironment();
    salonId = (await createSalon(env)).id;
  }, 60_000);

  afterAll(async () => {
    await env.stop();
  });

  it("should update a resource", async () => {
    const program = Effect.gen(function* () {
      const createUseCase = yield* CreateResourceUseCase;
      const updateUseCase = yield* UpdateResourceUseCase;

      const resource = yield* createUseCase.execute({
        salonId,
        slug: "old-resource",
        name: "Old Name",
        amount: 2,
      });

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
