import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect, Either } from "effect";
import {
  createAssignEmployeeToServiceCommand,
  createCustomServiceCommand,
  createListEmployeeServicesQuery,
  createListServiceEmployeesQuery,
  createSalonInput,
  createStylistInput,
  createUnassignEmployeeFromServiceCommand,
} from "./fixtures";
import {
  createSalon,
  createStylist,
  setupTestEnvironment,
  type TestEnvironment,
} from "./test-setup";
import { AssignEmployeeToServiceUseCase } from "../assign-employee-to-service.use-case";
import { CreateCustomServiceUseCase } from "../create-custom-service.use-case";
import { UnassignEmployeeFromServiceUseCase } from "../unassign-employee-from-service.use-case";
import { ListServiceEmployeesUseCase } from "../list-service-employees.use-case";
import { ListEmployeeServicesUseCase } from "../list-employee-services.use-case";

describe("Employee-Service Assignment Use Cases", () => {
  let env: TestEnvironment;
  let stylistId: string;
  let serviceId: string;
  let stylistName: string;
  let serviceName: string;

  beforeAll(async () => {
    env = await setupTestEnvironment();

    const salon = await createSalon(env, createSalonInput());
    const stylist = await createStylist(
      env,
      createStylistInput({ salonId: salon.id }),
    );
    const service = await Effect.runPromise(
      CreateCustomServiceUseCase.execute(
        createCustomServiceCommand({ salonId: salon.id }),
      ).pipe(Effect.provide(env.serviceUseCaseLayer)),
    );

    stylistId = stylist.id;
    stylistName = stylist.name;
    serviceId = service.id;
    serviceName = service.name;
  }, 60_000);

  afterAll(async () => {
    await env.stop();
  });

  it("should assign an employee to a service", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* AssignEmployeeToServiceUseCase;
      const assignment = yield* useCase.execute(
        createAssignEmployeeToServiceCommand({ stylistId, serviceId }),
      );

      expect(assignment.stylistId).toBe(stylistId);
      expect(assignment.serviceDefinitionId).toBe(serviceId);
      expect(assignment.createdAt).toBeDefined();
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.assignmentUseCaseLayer)),
    );
  });

  it("should list services for an employee", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* ListEmployeeServicesUseCase;
      const services = yield* useCase.execute(
        createListEmployeeServicesQuery({ stylistId }),
      );

      expect(services.length).toBeGreaterThanOrEqual(1);
      expect(services.some((s) => s.serviceDefinitionId === serviceId)).toBe(
        true,
      );
      // Verify enriched data includes service name
      const matched = services.find((s) => s.serviceDefinitionId === serviceId);
      expect(matched?.serviceName).toBe(serviceName);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.assignmentUseCaseLayer)),
    );
  });

  it("should list employees for a service", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* ListServiceEmployeesUseCase;
      const employees = yield* useCase.execute(
        createListServiceEmployeesQuery({ serviceId }),
      );

      expect(employees.length).toBeGreaterThanOrEqual(1);
      expect(employees.some((e) => e.stylistId === stylistId)).toBe(true);
      // Verify enriched data includes stylist name
      const matched = employees.find((e) => e.stylistId === stylistId);
      expect(matched?.stylistName).toBe(stylistName);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.assignmentUseCaseLayer)),
    );
  });

  it("should fail to assign same employee twice", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* AssignEmployeeToServiceUseCase;
      const result = yield* useCase
        .execute(createAssignEmployeeToServiceCommand({ stylistId, serviceId }))
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("ConflictError");
      }
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.assignmentUseCaseLayer)),
    );
  });

  it("should fail to assign a non-existent stylist", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* AssignEmployeeToServiceUseCase;
      const result = yield* useCase
        .execute(
          createAssignEmployeeToServiceCommand({
            stylistId: crypto.randomUUID(),
            serviceId,
          }),
        )
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("NotFoundError");
      }
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.assignmentUseCaseLayer)),
    );
  });

  it("should fail to assign to a non-existent service", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* AssignEmployeeToServiceUseCase;
      const result = yield* useCase
        .execute(
          createAssignEmployeeToServiceCommand({
            stylistId,
            serviceId: crypto.randomUUID(),
          }),
        )
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("NotFoundError");
      }
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.assignmentUseCaseLayer)),
    );
  });

  it("should unassign an employee from a service", async () => {
    const program = Effect.gen(function* () {
      const unassignUC = yield* UnassignEmployeeFromServiceUseCase;
      yield* unassignUC.execute(
        createUnassignEmployeeFromServiceCommand({ stylistId, serviceId }),
      );

      const listUC = yield* ListServiceEmployeesUseCase;
      const employees = yield* listUC.execute(
        createListServiceEmployeesQuery({ serviceId }),
      );
      expect(employees.some((e) => e.stylistId === stylistId)).toBe(false);
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.assignmentUseCaseLayer)),
    );
  });

  it("should fail to unassign when assignment does not exist", async () => {
    const program = Effect.gen(function* () {
      const useCase = yield* UnassignEmployeeFromServiceUseCase;
      const result = yield* useCase
        .execute(
          createUnassignEmployeeFromServiceCommand({ stylistId, serviceId }),
        )
        .pipe(Effect.either);

      expect(Either.isLeft(result)).toBe(true);
      if (Either.isLeft(result)) {
        expect(result.left._tag).toBe("NotFoundError");
      }
    });

    await Effect.runPromise(
      program.pipe(Effect.provide(env.assignmentUseCaseLayer)),
    );
  });
});
