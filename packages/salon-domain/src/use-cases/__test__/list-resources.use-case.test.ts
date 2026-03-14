import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect } from "effect";
import {
  createListResourcesQuery,
  createResourceCommand,
  createSalonInput,
} from "./fixtures";
import {
  createSalon,
  setupTestEnvironment,
  type TestEnvironment,
} from "./test-setup";
import { CreateResourceUseCase } from "../create-resource.use-case";
import { ListResourcesUseCase } from "../list-resources.use-case";

describe("ListResourcesUseCase", () => {
  let env: TestEnvironment;
  let salonId: string;

  beforeAll(async () => {
    env = await setupTestEnvironment();
    salonId = (await createSalon(env, createSalonInput())).id;
  }, 60_000);

  afterAll(async () => {
    await env.stop();
  });

  it("should list resources for a salon", async () => {
    const resource = await Effect.runPromise(
      CreateResourceUseCase.execute(createResourceCommand({ salonId })).pipe(
        Effect.provide(env.resourceUseCaseLayer),
      ),
    );

    const program = Effect.gen(function* () {
      const listUseCase = yield* ListResourcesUseCase;

      const resources = yield* listUseCase.execute(
        createListResourcesQuery({ salonId }),
      );

      expect(resources.length).toBeGreaterThanOrEqual(1);
      expect(resources.some((r) => r.slug === resource.slug)).toBe(true);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.resourceUseCaseLayer)),
    );
  });
});
