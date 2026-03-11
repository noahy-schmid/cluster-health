import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect, Either } from "effect";
import {
  createMockSalon,
  createMockWellKnownResources,
  setupTestEnvironment,
  type TestEnvironment,
} from "./test-setup";
import { CreateSimpleServiceUseCase } from "../create-simple-service.use-case";

describe("CreateSimpleServiceUseCase", () => {
  let env: TestEnvironment;
  let salonId: string;

  beforeAll(async () => {
    env = await setupTestEnvironment();
    salonId = (await createMockSalon(env)).id;
    await createMockWellKnownResources(env, salonId);
  }, 60_000);

  afterAll(async () => {
    await env.stop();
  });

  it("should create a simple service with one phase", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* CreateSimpleServiceUseCase;
      const service = yield* useCase.execute({
        salonId,
        name: "Quick Cut",
        description: "A simple haircut",
        priceInCents: 2500,
        durationMinutes: 30,
      });

      expect(service.id).toBeDefined();
      expect(service.salonId).toBe(salonId);
      expect(service.name).toBe("Quick Cut");
      expect(service.serviceType).toBe("simple");
      expect(service.priceInCents).toBe(2500);
      expect(service.phases.length).toBe(1);
      expect(service.durationMinutes).toBe(30);

      const phase = service.phases[0]!;
      expect(phase.name).toBe("Service");
      expect(phase.durationMinutes).toBe(30);
      expect(phase.employeeRequired).toBe(true);
      expect(phase.requiredResourceSlugs).toContain("seat");
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.simpleColorationUseCaseLayer)),
    );
  });

  it("should fail with NotFoundError when salon does not exist", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* CreateSimpleServiceUseCase;
      const result = yield* useCase
        .execute({
          salonId: crypto.randomUUID(),
          name: "No Salon Service",
          description: "Missing salon",
          priceInCents: 2000,
          durationMinutes: 20,
        })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("NotFoundError");
      }
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.simpleColorationUseCaseLayer)),
    );
  });
});
