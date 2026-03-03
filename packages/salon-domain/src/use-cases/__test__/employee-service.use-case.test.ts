import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect, Either } from "effect";
import { setupTestContext, type TestContext } from "./test-setup";
import { CreateServiceDefinitionUseCase } from "../create-service-definition.use-case";
import { AssignEmployeeToServiceUseCase } from "../assign-employee-to-service.use-case";
import { UnassignEmployeeFromServiceUseCase } from "../unassign-employee-from-service.use-case";
import { ListServiceEmployeesUseCase } from "../list-service-employees.use-case";
import { ListEmployeeServicesUseCase } from "../list-employee-services.use-case";

describe("Employee-Service Assignment Use Cases", () => {
  let ctx: TestContext;
  let serviceId: string;

  beforeAll(async () => {
    ctx = await setupTestContext();

    // Create a service for these tests
    await Effect.runPromise(
      Effect.gen(function* () {
        const createService = yield* CreateServiceDefinitionUseCase;
        const service = yield* createService.execute({
          salonId: ctx.salonId,
          name: "Assignment Test Service",
          description: "For assignment tests",
          priceInCents: 8000,
          phases: [
            {
              name: "Apply Color",
              durationMinutes: 30,
              requiredResourceIds: [],
            },
          ],
        });
        serviceId = service.id;
      }).pipe(Effect.provide(ctx.serviceUseCaseLayer)),
    );
  }, 60_000);

  afterAll(async () => {
    await ctx.stop();
  });

  it("should assign an employee to a service", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* AssignEmployeeToServiceUseCase;
      const assignment = yield* useCase.execute({
        stylistId: ctx.stylistId,
        serviceId,
      });

      expect(assignment.stylistId).toBe(ctx.stylistId);
      expect(assignment.serviceDefinitionId).toBe(serviceId);
      expect(assignment.createdAt).toBeDefined();
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.assignmentUseCaseLayer)),
    );
  });

  it("should list services for an employee", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* ListEmployeeServicesUseCase;
      const assignments = yield* useCase.execute({
        stylistId: ctx.stylistId,
      });

      expect(assignments.length).toBeGreaterThanOrEqual(1);
      expect(assignments.some((a) => a.serviceDefinitionId === serviceId)).toBe(
        true,
      );
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.assignmentUseCaseLayer)),
    );
  });

  it("should list employees for a service", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* ListServiceEmployeesUseCase;
      const assignments = yield* useCase.execute({ serviceId });

      expect(assignments.length).toBeGreaterThanOrEqual(1);
      expect(assignments.some((a) => a.stylistId === ctx.stylistId)).toBe(true);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.assignmentUseCaseLayer)),
    );
  });

  it("should fail to assign same employee twice", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* AssignEmployeeToServiceUseCase;
      const result = yield* useCase
        .execute({ stylistId: ctx.stylistId, serviceId })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("ConflictError");
      }
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.assignmentUseCaseLayer)),
    );
  });

  it("should fail to assign a non-existent stylist", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* AssignEmployeeToServiceUseCase;
      const result = yield* useCase
        .execute({ stylistId: crypto.randomUUID(), serviceId })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("NotFoundError");
      }
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.assignmentUseCaseLayer)),
    );
  });

  it("should fail to assign to a non-existent service", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* AssignEmployeeToServiceUseCase;
      const result = yield* useCase
        .execute({
          stylistId: ctx.stylistId,
          serviceId: crypto.randomUUID(),
        })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("NotFoundError");
      }
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.assignmentUseCaseLayer)),
    );
  });

  it("should unassign an employee from a service", async () => {
    const program = Effect.gen(function* () {
      const unassignUC = yield* UnassignEmployeeFromServiceUseCase;
      yield* unassignUC.execute({
        stylistId: ctx.stylistId,
        serviceId,
      });

      const listUC = yield* ListServiceEmployeesUseCase;
      const assignments = yield* listUC.execute({ serviceId });
      expect(assignments.some((a) => a.stylistId === ctx.stylistId)).toBe(
        false,
      );
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.assignmentUseCaseLayer)),
    );
  });

  it("should fail to unassign when assignment does not exist", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* UnassignEmployeeFromServiceUseCase;
      const result = yield* useCase
        .execute({ stylistId: ctx.stylistId, serviceId })
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("NotFoundError");
      }
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(ctx.assignmentUseCaseLayer)),
    );
  });
});
