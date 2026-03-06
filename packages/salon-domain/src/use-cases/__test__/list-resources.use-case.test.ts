import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect } from "effect";
import { setupTestContext, type TestContext } from "./test-setup";
import { CreateResourceUseCase } from "../create-resource.use-case";
import { ListResourcesUseCase } from "../list-resources.use-case";

describe("ListResourcesUseCase", () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await setupTestContext();
  }, 60_000);

  afterAll(async () => {
    await ctx.stop();
  });

  it("should list resources for a salon", async () => {
    const program = Effect.gen(function* () {
      const createUseCase = yield* CreateResourceUseCase;
      const listUseCase = yield* ListResourcesUseCase;

      yield* createUseCase.execute({
        salonId: ctx.salonId,
        slug: "list-test",
        name: "List Test Resource",
        amount: 1,
      });

      const resources = yield* listUseCase.execute({
        salonId: ctx.salonId,
      });

      expect(resources.length).toBeGreaterThanOrEqual(1);
      expect(resources.some((r) => r.name === "List Test Resource")).toBe(true);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.resourceUseCaseLayer)),
    );
  });
});
