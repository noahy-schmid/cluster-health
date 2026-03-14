import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect } from "effect";
import {
  createResourceCommand,
  createSalonInput,
  createUpdateResourceCommand,
} from "./fixtures";
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
    salonId = (await createSalon(env, createSalonInput())).id;
  }, 60_000);

  afterAll(async () => {
    await env.stop();
  });

  it("should update a resource", async () => {
    const resource = await Effect.runPromise(
      CreateResourceUseCase.execute(createResourceCommand({ salonId })).pipe(
        Effect.provide(env.resourceUseCaseLayer),
      ),
    );

    const program = Effect.gen(function* () {
      const updateUseCase = yield* UpdateResourceUseCase;

      const updated = yield* updateUseCase.execute(
        createUpdateResourceCommand({
          salonId,
          slug: resource.slug,
          name: "New Name",
          amount: 5,
        }),
      );

      expect(updated.name).toBe("New Name");
      expect(updated.amount).toBe(5);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.resourceUseCaseLayer)),
    );
  });
});
