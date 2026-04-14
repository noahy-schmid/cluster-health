import "dotenv/config";

export * from "./types";
export { SalonRepository } from "./repository/salon-repository";
export {
  StylistNotFoundError,
  StylistDatabaseError,
  StylistValidationError,
} from "./repository/stylist-errors";
export { StylistService, StylistServiceLive } from "./services/stylist-service";
export {
  type CreateStylistInput,
  type UpdateStylistInput,
  type Stylist,
} from "./types/stylists";
export {
  stylistsTable,
  mediaFilesTable,
  salonResourcesTable,
  serviceDefinitionsTable,
  servicePhasesTable,
  phaseResourceRequirementsTable,
  employeeServiceAssignmentsTable,
} from "./schema";
export * from "./types/media-errors";
export * from "./services/media/media.interface";
export * from "./layers";

export { type ServiceType } from "./application/service/service.aggregate";

// Shared domain errors
export {
  InternalError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InfrastructureError,
  ResourceMissingError,
  collapseErrorsToInternalError,
} from "./application/errors";

// Salon domain types
export type { Salon } from "./application/salon/salon.aggregate";

// Salon use cases
export {
  CreateSalonUseCase,
  type CreateSalonCommand,
  type CreateSalonResult,
} from "./use-cases/create-salon.use-case";

export {
  GetSalonUseCase,
  type GetSalonQuery,
  type GetSalonResult,
} from "./use-cases/get-salon.use-case";

export {
  UpdateSalonUseCase,
  type UpdateSalonCommand,
  type UpdateSalonResult,
} from "./use-cases/update-salon.use-case";

// Resource domain types
export type { Resource } from "./application/resource/resource.aggregate";
export {
  SEAT_SLUG,
  CLIMAZON_SLUG,
} from "./application/resource/resource.constants";

// Resource use cases
export {
  CreateResourceUseCase,
  type CreateResourceCommand,
  type CreateResourceResult,
} from "./use-cases/create-resource.use-case";

export {
  UpdateResourceUseCase,
  type UpdateResourceCommand,
  type UpdateResourceResult,
} from "./use-cases/update-resource.use-case";

export {
  DeleteResourceUseCase,
  type DeleteResourceCommand,
} from "./use-cases/delete-resource.use-case";

export {
  ListResourcesUseCase,
  type ListResourcesQuery,
  type ListResourcesResult,
} from "./use-cases/list-resources.use-case";

// Service definition domain types
export type {
  ServiceDefinition,
  ServicePhase,
  CreateServicePhaseInput,
} from "./application/service/service.aggregate";

// Service definition use cases
export {
  CreateCustomServiceUseCase,
  type CreateCustomServiceCommand,
  type CreateCustomServiceResult,
} from "./use-cases/create-custom-service.use-case";

export {
  UpdateCustomServiceUseCase,
  type UpdateCustomServiceCommand,
  type UpdateCustomServiceResult,
} from "./use-cases/update-custom-service.use-case";

export {
  DeleteServiceDefinitionUseCase,
  type DeleteServiceDefinitionCommand,
} from "./use-cases/delete-service-definition.use-case";

export {
  ListServiceDefinitionsUseCase,
  type ListServiceDefinitionsQuery,
  type ListServiceDefinitionsResult,
} from "./use-cases/list-service-definitions.use-case";

export {
  GetServiceDefinitionUseCase,
  type GetServiceDefinitionQuery,
  type GetServiceDefinitionResult,
} from "./use-cases/get-service-definition.use-case";

// Simplified service use cases
export {
  CreateSimpleServiceUseCase,
  type CreateSimpleServiceCommand,
  type CreateSimpleServiceResult,
} from "./use-cases/create-simple-service.use-case";

export {
  CreateColorationServiceUseCase,
  type CreateColorationServiceCommand,
  type CreateColorationServiceResult,
} from "./use-cases/create-coloration-service.use-case";

// Employee-service assignment domain types
export type { EmployeeServiceAssignment } from "./application/employee-service/employee-service.aggregate";

// Employee-service assignment use cases
export {
  AssignEmployeeToServiceUseCase,
  type AssignEmployeeToServiceCommand,
  type AssignEmployeeToServiceResult,
} from "./use-cases/assign-employee-to-service.use-case";

export {
  UnassignEmployeeFromServiceUseCase,
  type UnassignEmployeeFromServiceCommand,
} from "./use-cases/unassign-employee-from-service.use-case";

export {
  ListEmployeeServicesUseCase,
  type ListEmployeeServicesQuery,
  type ListEmployeeServicesResult,
  type EmployeeServiceItem,
} from "./use-cases/list-employee-services.use-case";

export {
  ListServiceEmployeesUseCase,
  type ListServiceEmployeesQuery,
  type ListServiceEmployeesResult,
  type ServiceEmployeeItem,
} from "./use-cases/list-service-employees.use-case";

// Opening hours domain types
export type {
  OpeningHours,
  OpeningHoursException,
} from "./application/opening-hours/opening-hours.aggregate";
export {
  OpeningHoursValidationError,
  OpeningHoursNotFoundError,
  OpeningHoursInternalError,
} from "./application/opening-hours/errors";

// Opening hours use cases
export {
  SetSalonOpeningHoursUseCase,
  type SetSalonOpeningHoursCommand,
  type SetSalonOpeningHoursResult,
} from "./use-cases/set-salon-opening-hours.use-case";

export {
  DeleteSalonOpeningHoursUseCase,
  type DeleteSalonOpeningHoursCommand,
} from "./use-cases/delete-salon-opening-hours.use-case";

export {
  ListSalonOpeningHoursUseCase,
  type ListSalonOpeningHoursQuery,
  type ListSalonOpeningHoursResult,
} from "./use-cases/list-salon-opening-hours.use-case";

export {
  CreateSalonOpeningHoursExceptionUseCase,
  type CreateSalonOpeningHoursExceptionCommand,
  type CreateSalonOpeningHoursExceptionResult,
} from "./use-cases/create-salon-opening-hours-exception.use-case";

export {
  DeleteSalonOpeningHoursExceptionUseCase,
  type DeleteSalonOpeningHoursExceptionCommand,
} from "./use-cases/delete-salon-opening-hours-exception.use-case";

export {
  ListSalonOpeningHoursExceptionsUseCase,
  type ListSalonOpeningHoursExceptionsQuery,
  type ListSalonOpeningHoursExceptionsResult,
} from "./use-cases/list-salon-opening-hours-exceptions.use-case";

// Stylist availability domain types
export type {
  StylistAvailability,
  StylistAvailabilityException,
} from "./application/stylist-availability/stylist-availability.aggregate";
export {
  StylistAvailabilityValidationError,
  StylistAvailabilityNotFoundError,
  StylistAvailabilityInternalError,
} from "./application/stylist-availability/errors";

// Stylist availability use cases
export {
  SetStylistAvailabilityUseCase,
  type SetStylistAvailabilityCommand,
  type SetStylistAvailabilityResult,
} from "./use-cases/set-stylist-availability.use-case";

export {
  DeleteStylistAvailabilityUseCase,
  type DeleteStylistAvailabilityCommand,
} from "./use-cases/delete-stylist-availability.use-case";

export {
  ListStylistAvailabilityUseCase,
  type ListStylistAvailabilityQuery,
  type ListStylistAvailabilityResult,
} from "./use-cases/list-stylist-availability.use-case";

export {
  CreateStylistAvailabilityExceptionUseCase,
  type CreateStylistAvailabilityExceptionCommand,
  type CreateStylistAvailabilityExceptionResult,
} from "./use-cases/create-stylist-availability-exception.use-case";

export {
  DeleteStylistAvailabilityExceptionUseCase,
  type DeleteStylistAvailabilityExceptionCommand,
} from "./use-cases/delete-stylist-availability-exception.use-case";

export {
  ListStylistAvailabilityExceptionsUseCase,
  type ListStylistAvailabilityExceptionsQuery,
  type ListStylistAvailabilityExceptionsResult,
} from "./use-cases/list-stylist-availability-exceptions.use-case";

// Layer exports for opening hours and stylist availability
export {
  SetSalonOpeningHoursUseCaseLayer,
  DeleteSalonOpeningHoursUseCaseLayer,
  ListSalonOpeningHoursUseCaseLayer,
  CreateSalonOpeningHoursExceptionUseCaseLayer,
  DeleteSalonOpeningHoursExceptionUseCaseLayer,
  ListSalonOpeningHoursExceptionsUseCaseLayer,
  SetStylistAvailabilityUseCaseLayer,
  DeleteStylistAvailabilityUseCaseLayer,
  ListStylistAvailabilityUseCaseLayer,
  CreateStylistAvailabilityExceptionUseCaseLayer,
  DeleteStylistAvailabilityExceptionUseCaseLayer,
  ListStylistAvailabilityExceptionsUseCaseLayer,
} from "./layers";

// Schema exports for new tables
export {
  salonOpeningHoursTable,
  salonOpeningHoursExceptionsTable,
  stylistAvailabilityTable,
  stylistAvailabilityExceptionsTable,
} from "./schema";
