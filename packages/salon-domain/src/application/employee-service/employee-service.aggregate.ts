import { Effect, Layer } from "effect";
import { EmployeeServicePort } from "../../ports/employee-service.port";
import { InternalError, NotFoundError, ConflictError } from "./errors";
import { DatabaseLayer } from "../../infrastructure/database.service";
import { ConfigurationLayer } from "../../infrastructure/config.service";
import { PostgresEmployeeServiceAdapter } from "../../adapters/postgres-employee-service.adapter";

// --- Domain types ---

export interface EmployeeServiceAssignment {
  stylistId: string;
  serviceDefinitionId: string;
  createdAt: Date;
}

// --- Aggregate service ---

const make = Effect.gen(function* () {
  const employeeServicePort = yield* EmployeeServicePort;

  const assignEmployee = (stylistId: string, serviceId: string) =>
    Effect.gen(function* () {
      // Check if already assigned (within-aggregate check)
      const alreadyAssigned = yield* employeeServicePort
        .assignmentExists(stylistId, serviceId)
        .pipe(
          Effect.mapError(
            (error) =>
              new InternalError({ message: error.message, cause: error }),
          ),
        );

      if (alreadyAssigned) {
        return yield* Effect.fail(
          new ConflictError({
            message: `Employee ${stylistId} is already assigned to service ${serviceId}`,
          }),
        );
      }

      const assignment = yield* employeeServicePort
        .assignEmployee(stylistId, serviceId)
        .pipe(
          Effect.mapError(
            (error) =>
              new InternalError({ message: error.message, cause: error }),
          ),
        );

      yield* Effect.log("Employee assigned to service", stylistId, serviceId);
      return assignment satisfies EmployeeServiceAssignment;
    });

  const unassignEmployee = (stylistId: string, serviceId: string) =>
    Effect.gen(function* () {
      const removed = yield* employeeServicePort
        .unassignEmployee(stylistId, serviceId)
        .pipe(
          Effect.mapError(
            (error) =>
              new InternalError({ message: error.message, cause: error }),
          ),
        );

      if (!removed) {
        return yield* Effect.fail(
          new NotFoundError({
            entity: "EmployeeServiceAssignment",
            id: `${stylistId}:${serviceId}`,
          }),
        );
      }

      yield* Effect.log(
        "Employee unassigned from service",
        stylistId,
        serviceId,
      );
    });

  const listEmployeeServices = (stylistId: string) =>
    employeeServicePort
      .listByEmployee(stylistId)
      .pipe(
        Effect.mapError(
          (error) =>
            new InternalError({ message: error.message, cause: error }),
        ),
      );

  const listServiceEmployees = (serviceId: string) =>
    employeeServicePort
      .listByService(serviceId)
      .pipe(
        Effect.mapError(
          (error) =>
            new InternalError({ message: error.message, cause: error }),
        ),
      );

  return {
    assignEmployee,
    unassignEmployee,
    listEmployeeServices,
    listServiceEmployees,
  };
});

export class EmployeeServiceAggregate extends Effect.Service<EmployeeServiceAggregate>()(
  "@repo/salon-domain/EmployeeServiceAggregate",
  {
    effect: make,
    accessors: true,
    dependencies: [
      PostgresEmployeeServiceAdapter.pipe(
        Layer.provide(DatabaseLayer),
        Layer.provide(ConfigurationLayer),
        Layer.orDie,
      ),
    ],
  },
) {}
