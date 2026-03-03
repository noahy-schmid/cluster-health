import { Effect, Layer } from "effect";
import { EmployeeServicePort } from "../../ports/employee-service.port";
import { ServiceDefinitionPort } from "../../ports/service-definition.port";
import { StylistPort } from "../../ports/stylist.port";
import {
  EmployeeServiceError,
  EmployeeServiceAlreadyAssignedError,
  EmployeeServiceNotFoundError,
} from "./errors";
import { DatabaseLayer } from "../../infrastructure/database.service";
import { ConfigurationLayer } from "../../infrastructure/config.service";
import { PostgresEmployeeServiceAdapter } from "../../adapters/postgres-employee-service.adapter";
import { PostgresServiceDefinitionAdapter } from "../../adapters/postgres-service-definition.adapter";
import { PostgresStylistPortAdapter } from "../../adapters/postgres-stylist-port.adapter";

// --- Domain types ---

export interface EmployeeServiceAssignment {
  stylistId: string;
  serviceDefinitionId: string;
  createdAt: Date;
}

// --- Aggregate service ---

const make = Effect.gen(function* () {
  const employeeServicePort = yield* EmployeeServicePort;
  const servicePort = yield* ServiceDefinitionPort;
  const stylistPort = yield* StylistPort;

  const assignEmployee = (stylistId: string, serviceId: string) =>
    Effect.gen(function* () {
      // Verify stylist exists
      const stylistExists = yield* stylistPort.stylistExists(stylistId).pipe(
        Effect.mapError(
          (error) =>
            new EmployeeServiceError({
              stylistId,
              serviceId,
              message: `Failed to verify stylist: ${error.message}`,
            }),
        ),
      );

      if (!stylistExists) {
        return yield* Effect.fail(
          new EmployeeServiceError({
            stylistId,
            serviceId,
            message: `Stylist not found: ${stylistId}`,
          }),
        );
      }

      // Verify service exists
      const service = yield* servicePort
        .findServiceDefinitionById(serviceId)
        .pipe(
          Effect.mapError(
            (error) =>
              new EmployeeServiceError({
                stylistId,
                serviceId,
                message: `Failed to verify service: ${error.message}`,
              }),
          ),
        );

      if (!service) {
        return yield* Effect.fail(
          new EmployeeServiceError({
            stylistId,
            serviceId,
            message: `Service not found: ${serviceId}`,
          }),
        );
      }

      // Check if already assigned
      const alreadyAssigned = yield* employeeServicePort
        .assignmentExists(stylistId, serviceId)
        .pipe(
          Effect.mapError(
            (error) =>
              new EmployeeServiceError({
                stylistId,
                serviceId,
                message: error.message,
              }),
          ),
        );

      if (alreadyAssigned) {
        return yield* Effect.fail(
          new EmployeeServiceAlreadyAssignedError({ stylistId, serviceId }),
        );
      }

      const assignment = yield* employeeServicePort
        .assignEmployee(stylistId, serviceId)
        .pipe(
          Effect.mapError(
            (error) =>
              new EmployeeServiceError({
                stylistId,
                serviceId,
                message: error.message,
              }),
          ),
        );

      yield* Effect.log("Employee assigned to service", stylistId, serviceId);

      return {
        stylistId: assignment.stylistId,
        serviceDefinitionId: assignment.serviceDefinitionId,
        createdAt: assignment.createdAt,
      } satisfies EmployeeServiceAssignment;
    });

  const unassignEmployee = (stylistId: string, serviceId: string) =>
    Effect.gen(function* () {
      const removed = yield* employeeServicePort
        .unassignEmployee(stylistId, serviceId)
        .pipe(
          Effect.mapError(
            (error) =>
              new EmployeeServiceError({
                stylistId,
                serviceId,
                message: error.message,
              }),
          ),
        );

      if (!removed) {
        return yield* Effect.fail(
          new EmployeeServiceNotFoundError({ stylistId, serviceId }),
        );
      }

      yield* Effect.log(
        "Employee unassigned from service",
        stylistId,
        serviceId,
      );
    });

  const listEmployeeServices = (stylistId: string) =>
    Effect.gen(function* () {
      const assignments = yield* employeeServicePort
        .listByEmployee(stylistId)
        .pipe(
          Effect.mapError(
            (error) =>
              new EmployeeServiceError({
                stylistId,
                message: error.message,
              }),
          ),
        );

      return assignments.map(
        (a) =>
          ({
            stylistId: a.stylistId,
            serviceDefinitionId: a.serviceDefinitionId,
            createdAt: a.createdAt,
          }) satisfies EmployeeServiceAssignment,
      );
    });

  const listServiceEmployees = (serviceId: string) =>
    Effect.gen(function* () {
      const assignments = yield* employeeServicePort
        .listByService(serviceId)
        .pipe(
          Effect.mapError(
            (error) =>
              new EmployeeServiceError({
                serviceId,
                message: error.message,
              }),
          ),
        );

      return assignments.map(
        (a) =>
          ({
            stylistId: a.stylistId,
            serviceDefinitionId: a.serviceDefinitionId,
            createdAt: a.createdAt,
          }) satisfies EmployeeServiceAssignment,
      );
    });

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
      PostgresServiceDefinitionAdapter.pipe(
        Layer.provide(DatabaseLayer),
        Layer.provide(ConfigurationLayer),
        Layer.orDie,
      ),
      PostgresStylistPortAdapter.pipe(
        Layer.provide(DatabaseLayer),
        Layer.provide(ConfigurationLayer),
        Layer.orDie,
      ),
    ],
  },
) {}
