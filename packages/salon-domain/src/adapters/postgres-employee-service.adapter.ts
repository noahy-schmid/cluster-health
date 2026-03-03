import { Effect, Layer } from "effect";
import { and, eq } from "drizzle-orm";
import { Database } from "../infrastructure/database.interface";
import { employeeServiceAssignmentsTable } from "../schema";
import {
  EmployeeServicePort,
  EmployeeServicePersistenceError,
} from "../ports/employee-service.port";

/**
 * PostgreSQL implementation of the EmployeeServicePort using Drizzle ORM.
 */
const make = Effect.gen(function* () {
  const { db } = yield* Database;

  const assignEmployee: EmployeeServicePort["assignEmployee"] = (
    stylistId,
    serviceId,
  ) =>
    Effect.gen(function* () {
      const [created] = yield* Effect.tryPromise(() =>
        db
          .insert(employeeServiceAssignmentsTable)
          .values({
            stylistId,
            serviceDefinitionId: serviceId,
          })
          .returning(),
      ).pipe(
        Effect.mapError(
          (error) =>
            new EmployeeServicePersistenceError({
              message: "Failed to assign employee to service",
              cause: error,
            }),
        ),
      );

      if (!created) {
        return yield* Effect.fail(
          new EmployeeServicePersistenceError({
            message: "Failed to assign employee: no row returned",
          }),
        );
      }

      return created;
    });

  const unassignEmployee: EmployeeServicePort["unassignEmployee"] = (
    stylistId,
    serviceId,
  ) =>
    Effect.gen(function* () {
      const rows = yield* Effect.tryPromise(() =>
        db
          .delete(employeeServiceAssignmentsTable)
          .where(
            and(
              eq(employeeServiceAssignmentsTable.stylistId, stylistId),
              eq(
                employeeServiceAssignmentsTable.serviceDefinitionId,
                serviceId,
              ),
            ),
          )
          .returning(),
      ).pipe(
        Effect.mapError(
          (error) =>
            new EmployeeServicePersistenceError({
              message: "Failed to unassign employee from service",
              cause: error,
            }),
        ),
      );

      return rows.length > 0;
    });

  const listByEmployee: EmployeeServicePort["listByEmployee"] = (stylistId) =>
    Effect.gen(function* () {
      const rows = yield* Effect.tryPromise(() =>
        db
          .select()
          .from(employeeServiceAssignmentsTable)
          .where(eq(employeeServiceAssignmentsTable.stylistId, stylistId)),
      ).pipe(
        Effect.mapError(
          (error) =>
            new EmployeeServicePersistenceError({
              message: "Failed to list assignments by employee",
              cause: error,
            }),
        ),
      );

      return rows;
    });

  const listByService: EmployeeServicePort["listByService"] = (serviceId) =>
    Effect.gen(function* () {
      const rows = yield* Effect.tryPromise(() =>
        db
          .select()
          .from(employeeServiceAssignmentsTable)
          .where(
            eq(employeeServiceAssignmentsTable.serviceDefinitionId, serviceId),
          ),
      ).pipe(
        Effect.mapError(
          (error) =>
            new EmployeeServicePersistenceError({
              message: "Failed to list assignments by service",
              cause: error,
            }),
        ),
      );

      return rows;
    });

  const assignmentExists: EmployeeServicePort["assignmentExists"] = (
    stylistId,
    serviceId,
  ) =>
    Effect.gen(function* () {
      const [row] = yield* Effect.tryPromise(() =>
        db
          .select()
          .from(employeeServiceAssignmentsTable)
          .where(
            and(
              eq(employeeServiceAssignmentsTable.stylistId, stylistId),
              eq(
                employeeServiceAssignmentsTable.serviceDefinitionId,
                serviceId,
              ),
            ),
          )
          .limit(1),
      ).pipe(
        Effect.mapError(
          (error) =>
            new EmployeeServicePersistenceError({
              message: "Failed to check assignment existence",
              cause: error,
            }),
        ),
      );

      return !!row;
    });

  return {
    assignEmployee,
    unassignEmployee,
    listByEmployee,
    listByService,
    assignmentExists,
  } satisfies EmployeeServicePort;
});

/**
 * Layer that provides the PostgreSQL EmployeeServicePort implementation.
 */
export const PostgresEmployeeServiceAdapter = Layer.effect(
  EmployeeServicePort,
  make,
);
