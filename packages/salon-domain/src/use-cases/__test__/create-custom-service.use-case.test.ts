import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect, Either } from "effect";
import {
  createSalon,
  setupTestEnvironment,
  type TestEnvironment,
} from "./test-setup";
import { CreateCustomServiceUseCase } from "../create-custom-service.use-case";

describe("CreateCustomServiceUseCase", () => {
  let env: TestEnvironment;
  let salonId: string;

  beforeAll(async () => {
    env = await setupTestEnvironment();
    salonId = (await createSalon(env)).id;
  }, 60_000);

  afterAll(async () => {
    await env.stop();
  });

  it("should create a custom service definition with phases", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* CreateCustomServiceUseCase;
      const service = yield* useCase.execute({
        salonId,
        name: "Haircut & Style",
        description: "A complete haircut and styling service",
        priceInCents: 4500,
        phases: [
          {
            name: "Wash",
            durationMinutes: 10,
            employeeRequired: true,
            requiredResourceSlugs: [],
          },
          {
            name: "Cut",
            durationMinutes: 30,
            employeeRequired: true,
            requiredResourceSlugs: [],
          },
          {
            name: "Style",
            durationMinutes: 15,
            employeeRequired: false,
            requiredResourceSlugs: [],
          },
        ],
      });

      expect(service.id).toBeDefined();
      expect(service.salonId).toBe(salonId);
      expect(service.name).toBe("Haircut & Style");
      expect(service.serviceType).toBe("custom");
      expect(service.priceInCents).toBe(4500);
      expect(service.phases.length).toBe(3);
      expect(service.durationMinutes).toBe(55);
      expect(service.phases[0]?.name).toBe("Wash");
      expect(service.phases[0]?.order).toBe(0);
      expect(service.phases[0]?.employeeRequired).toBe(true);
      expect(service.phases[1]?.name).toBe("Cut");
      expect(service.phases[2]?.name).toBe("Style");
      expect(service.phases[2]?.employeeRequired).toBe(false);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.serviceUseCaseLayer)),
    );
  });

  it("should fail to create a service with no phases", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* CreateCustomServiceUseCase;
      const result = yield* useCase
        .execute({
          salonId,
          name: "Empty Service",
          description: "",
          priceInCents: 1000,
          phases: [],
        })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("ValidationError");
      }
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.serviceUseCaseLayer)),
    );
  });

  it("should fail to create a service with empty name", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* CreateCustomServiceUseCase;
      const result = yield* useCase
        .execute({
          salonId,
          name: "  ",
          description: "",
          priceInCents: 1000,
          phases: [
            {
              name: "Phase",
              durationMinutes: 10,
              employeeRequired: true,
              requiredResourceSlugs: [],
            },
          ],
        })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("ValidationError");
      }
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.serviceUseCaseLayer)),
    );
  });

  it("should fail when salon does not exist", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* CreateCustomServiceUseCase;
      const result = yield* useCase
        .execute({
          salonId: crypto.randomUUID(),
          name: "Ghost Service",
          description: "",
          priceInCents: 1000,
          phases: [
            {
              name: "Phase",
              durationMinutes: 10,
              employeeRequired: true,
              requiredResourceSlugs: [],
            },
          ],
        })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("NotFoundError");
      }
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.serviceUseCaseLayer)),
    );
  });
});
