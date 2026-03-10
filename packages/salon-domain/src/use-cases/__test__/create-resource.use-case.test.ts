import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect, Either } from "effect";
import {
  createSalon,
  setupTestEnvironment,
  type TestEnvironment,
} from "./test-setup";
import { CreateResourceUseCase } from "../create-resource.use-case";

describe("CreateResourceUseCase", () => {
  let env: TestEnvironment;
  let salonId: string;

  beforeAll(async () => {
    env = await setupTestEnvironment();
    salonId = (await createSalon(env)).id;
  }, 60_000);

  afterAll(async () => {
    await env.stop();
  });

  it("should create a resource", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* CreateResourceUseCase;
      const resource = yield* useCase.execute({
        salonId,
        slug: "dryer",
        name: "Dryer",
        amount: 3,
      });

      expect(resource.slug).toBe("dryer");
      expect(resource.salonId).toBe(salonId);
      expect(resource.name).toBe("Dryer");
      expect(resource.amount).toBe(3);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.resourceUseCaseLayer)),
    );
  });

  it("should fail with empty name", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* CreateResourceUseCase;
      const result = yield* useCase
        .execute({ salonId, slug: "blank", name: "  ", amount: 1 })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("ValidationError");
      }
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.resourceUseCaseLayer)),
    );
  });

  it("should fail with amount < 1", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* CreateResourceUseCase;
      const result = yield* useCase
        .execute({
          salonId,
          slug: "bad",
          name: "Dryer",
          amount: 0,
        })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("ValidationError");
      }
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.resourceUseCaseLayer)),
    );
  });
});
