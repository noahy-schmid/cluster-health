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

// Shared domain errors
export {
  InternalError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InfrastructureError,
  ResourceMissingError,
} from "./application/errors";

// Resource domain types
export type { Resource } from "./application/resource/resource.aggregate";

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
  CreateServiceDefinitionUseCase,
  type CreateServiceDefinitionCommand,
  type CreateServiceDefinitionResult,
} from "./use-cases/create-service-definition.use-case";

export {
  UpdateServiceDefinitionUseCase,
  type UpdateServiceDefinitionCommand,
  type UpdateServiceDefinitionResult,
} from "./use-cases/update-service-definition.use-case";

export {
  DeleteServiceDefinitionUseCase,
  type DeleteServiceDefinitionCommand,
} from "./use-cases/delete-service-definition.use-case";

export {
  ListServiceDefinitionsUseCase,
  type ListServiceDefinitionsQuery,
  type ListServiceDefinitionsResult,
} from "./use-cases/list-service-definitions.use-case";

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
