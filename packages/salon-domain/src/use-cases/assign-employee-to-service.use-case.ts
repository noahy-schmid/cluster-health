import { Effect } from "effect";
import {
  EmployeeServiceAggregate,
  type EmployeeServiceAssignment,
} from "../application/employee-service/employee-service.aggregate";
import {
  InternalError,
  NotFoundError,
  ConflictError,
} from "../application/employee-service/errors";
import { ServiceDefinitionPort } from "../ports/service-definition.port";
import { StylistPort } from "../ports/stylist.port";

// --- Command DTO ---

export interface AssignEmployeeToServiceCommand {
  stylistId: string;
  serviceId: string;
}

// --- Result DTO ---

export type AssignEmployeeToServiceResult = EmployeeServiceAssignment;

// --- Use Case ---

/**
 * Assigns an employee (stylist) to a service definition.
 * Performs cross-aggregate validation to verify both the stylist and service exist.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* EmployeeServiceAggregate;
  const serviceDefPort = yield* ServiceDefinitionPort;
  const stylistPort = yield* StylistPort;

  return {
    /**
     * @param command - The assignment data including stylistId and serviceId.
     * @returns Effect resolving to the created assignment.
     */
    execute: (
      command: AssignEmployeeToServiceCommand,
    ): Effect.Effect<
      AssignEmployeeToServiceResult,
      InternalError | NotFoundError | ConflictError
    > =>
      Effect.gen(function* () {
        // Cross-aggregate: verify stylist exists
        const stylistExists = yield* stylistPort
          .stylistExists(command.stylistId)
          .pipe(
            Effect.mapError(
              (error) =>
                new InternalError({
                  message: `Failed to verify stylist: ${error.message}`,
                  cause: error,
                }),
            ),
          );

        if (!stylistExists) {
          return yield* Effect.fail(
            new NotFoundError({
              entity: "Stylist",
              id: command.stylistId,
            }),
          );
        }

        // Cross-aggregate: verify service exists
        const serviceExists = yield* serviceDefPort
          .serviceDefinitionExists(command.serviceId)
          .pipe(
            Effect.mapError(
              (error) =>
                new InternalError({
                  message: `Failed to verify service: ${error.message}`,
                  cause: error,
                }),
            ),
          );

        if (!serviceExists) {
          return yield* Effect.fail(
            new NotFoundError({
              entity: "ServiceDefinition",
              id: command.serviceId,
            }),
          );
        }

        // Delegate to aggregate (handles duplicate check internally)
        return yield* aggregate.assignEmployee(
          command.stylistId,
          command.serviceId,
        );
      }),
  };
});

export class AssignEmployeeToServiceUseCase extends Effect.Service<AssignEmployeeToServiceUseCase>()(
  "@repo/salon-domain/AssignEmployeeToServiceUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [EmployeeServiceAggregate.Default],
  },
) {}
