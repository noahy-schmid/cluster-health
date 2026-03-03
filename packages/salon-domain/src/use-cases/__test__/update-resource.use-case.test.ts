import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect } from "effect";
import { setupTestContext, type TestContext } from "./test-setup";
import { CreateResourceUseCase } from "../create-resource.use-case";
import { UpdateResourceUseCase } from "../update-resource.use-case";

describe("UpdateResourceUseCase", () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await setupTestContext();
  }, 60_000);

  afterAll(async () => {
    await ctx.stop();
  });

  it("should update a resource", async () => {
    const program = Effect.gen(function* () {
      const createUseCase = yield* CreateResourceUseCase;
      const updateUseCase = yield* UpdateResourceUseCase;

      const resource = yield* createUseCase.execute({
        salonId: ctx.salonId,
        name: "Old Name",
        amount: 2,
      });

      const updated = yield* updateUseCase.execute({
        resourceId: resource.id,
        name: "New Name",
        amount: 5,
      });

      expect(updated.name).toBe("New Name");
      expect(updated.amount).toBe(5);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.resourceUseCaseLayer)),
    );
  });
});
