import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect, Either } from "effect";
import {
  CLIMAZON_SLUG,
  SEAT_SLUG,
} from "../../application/resource/resource.constants";
import {
  createColorationServiceCommand,
  createResourceCommand,
  createSalonInput,
} from "./fixtures";
import {
  createSalon,
  setupTestEnvironment,
  type TestEnvironment,
} from "./test-setup";
import { CreateResourceUseCase } from "../create-resource.use-case";
import { CreateColorationServiceUseCase } from "../create-coloration-service.use-case";

describe("CreateColorationServiceUseCase", () => {
  let env: TestEnvironment;
  let salonId: string;

  beforeAll(async () => {
    env = await setupTestEnvironment();
    salonId = (await createSalon(env, createSalonInput())).id;
    await Effect.runPromise(
      Effect.all([
        CreateResourceUseCase.execute(
          createResourceCommand({
            salonId,
            slug: SEAT_SLUG,
            name: "Mock Styling Chair",
            amount: 3,
          }),
        ),
        CreateResourceUseCase.execute(
          createResourceCommand({
            salonId,
            slug: CLIMAZON_SLUG,
            name: "Mock Climazon",
            amount: 2,
          }),
        ),
      ]).pipe(Effect.provide(env.resourceUseCaseLayer)),
    );
  }, 60_000);

  afterAll(async () => {
    await env.stop();
  });

  it("should create a coloration service with three phases", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* CreateColorationServiceUseCase;
      const command = createColorationServiceCommand({
        salonId,
        name: "Full Color",
        description: "Complete coloration service",
        priceInCents: 12000,
        applicationDurationMinutes: 20,
        processingDurationMinutes: 30,
        finishingDurationMinutes: 15,
      });
      const service = yield* useCase.execute(command);

      expect(service.id).toBeDefined();
      expect(service.salonId).toBe(salonId);
      expect(service.name).toBe("Full Color");
      expect(service.serviceType).toBe("coloration");
      expect(service.priceInCents).toBe(12000);
      expect(service.phases.length).toBe(3);
      expect(service.durationMinutes).toBe(65);

      expect(service.phases[0]?.name).toBe("Application");
      expect(service.phases[0]?.durationMinutes).toBe(20);
      expect(service.phases[0]?.employeeRequired).toBe(true);
      expect(service.phases[1]?.name).toBe("Processing");
      expect(service.phases[1]?.durationMinutes).toBe(30);
      expect(service.phases[1]?.employeeRequired).toBe(false);
      expect(service.phases[2]?.name).toBe("Finishing");
      expect(service.phases[2]?.durationMinutes).toBe(15);
      expect(service.phases[2]?.employeeRequired).toBe(true);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.simpleColorationUseCaseLayer)),
    );
  });

  it("should fail with NotFoundError when salon does not exist", async () => {
    const program = Effect.gen(function* () {
      const result = yield* CreateColorationServiceUseCase.execute(
        createColorationServiceCommand({
          salonId: crypto.randomUUID(),
          name: "No Salon Service",
          description: "Missing salon",
          priceInCents: 10000,
          applicationDurationMinutes: 20,
          processingDurationMinutes: 30,
          finishingDurationMinutes: 15,
        }),
      ).pipe(Effect.either);

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
