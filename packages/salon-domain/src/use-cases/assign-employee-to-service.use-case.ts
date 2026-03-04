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
import { ValidationError } from "../application/errors";

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
 * Performs cross-aggregate validation to verify both the stylist and service exist
 * and belong to the same salon.
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
      InternalError | NotFoundError | ConflictError | ValidationError
    > =>
      Effect.gen(function* () {
        // Cross-aggregate: verify stylist exists and get salonId
        const stylist = yield* stylistPort
          .getStylistById(command.stylistId)
          .pipe(
            Effect.mapError(
              (error) =>
                new InternalError({
                  message: `Failed to verify stylist: ${error.message}`,
                  cause: error,
                }),
            ),
          );

        if (!stylist) {
          return yield* Effect.fail(
            new NotFoundError({
              entity: "Stylist",
              id: command.stylistId,
            }),
          );
        }

        // Cross-aggregate: verify service exists and get salonId
        const serviceDef = yield* serviceDefPort
          .findServiceDefinitionById(command.serviceId)
          .pipe(
            Effect.mapError(
              (error) =>
                new InternalError({
                  message: `Failed to verify service: ${error.message}`,
                  cause: error,
                }),
            ),
          );

        if (!serviceDef) {
          return yield* Effect.fail(
            new NotFoundError({
              entity: "ServiceDefinition",
              id: command.serviceId,
            }),
          );
        }

        // Verify stylist and service belong to the same salon
        if (stylist.salonId !== serviceDef.salonId) {
          return yield* Effect.fail(
            new ValidationError({
              message: `Stylist and service must belong to the same salon`,
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
