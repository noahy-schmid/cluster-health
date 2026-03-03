import { Layer } from "effect";
import { MediaServiceLive } from "./services/media/media.service";
import { PostgresMediaAdapter } from "./adapters/postgres-media.adapter";
import { S3FileStorageAdapter } from "./adapters/s3-file-storage.adapter";
import { ConfigurationLayer } from "./infrastructure/config.service";
import { DatabaseLayer } from "./infrastructure/database.service";
import { CreateResourceUseCase } from "./use-cases/create-resource.use-case";
import { UpdateResourceUseCase } from "./use-cases/update-resource.use-case";
import { DeleteResourceUseCase } from "./use-cases/delete-resource.use-case";
import { ListResourcesUseCase } from "./use-cases/list-resources.use-case";
import { CreateServiceDefinitionUseCase } from "./use-cases/create-service-definition.use-case";
import { UpdateServiceDefinitionUseCase } from "./use-cases/update-service-definition.use-case";
import { DeleteServiceDefinitionUseCase } from "./use-cases/delete-service-definition.use-case";
import { ListServiceDefinitionsUseCase } from "./use-cases/list-service-definitions.use-case";
import { AssignEmployeeToServiceUseCase } from "./use-cases/assign-employee-to-service.use-case";
import { UnassignEmployeeFromServiceUseCase } from "./use-cases/unassign-employee-from-service.use-case";
import { ListEmployeeServicesUseCase } from "./use-cases/list-employee-services.use-case";
import { ListServiceEmployeesUseCase } from "./use-cases/list-service-employees.use-case";

const InfrastructureLayer = DatabaseLayer.pipe(
  Layer.provideMerge(ConfigurationLayer),
);

export const MediaLayer = MediaServiceLive.pipe(
  Layer.provide(PostgresMediaAdapter),
  Layer.provide(S3FileStorageAdapter),
  Layer.provide(InfrastructureLayer),
);

// Resource use case layers
export const CreateResourceUseCaseLayer = CreateResourceUseCase.Default;
export const UpdateResourceUseCaseLayer = UpdateResourceUseCase.Default;
export const DeleteResourceUseCaseLayer = DeleteResourceUseCase.Default;
export const ListResourcesUseCaseLayer = ListResourcesUseCase.Default;

// Service definition use case layers
export const CreateServiceDefinitionUseCaseLayer =
  CreateServiceDefinitionUseCase.Default;
export const UpdateServiceDefinitionUseCaseLayer =
  UpdateServiceDefinitionUseCase.Default;
export const DeleteServiceDefinitionUseCaseLayer =
  DeleteServiceDefinitionUseCase.Default;
export const ListServiceDefinitionsUseCaseLayer =
  ListServiceDefinitionsUseCase.Default;

// Employee-service assignment use case layers
export const AssignEmployeeToServiceUseCaseLayer =
  AssignEmployeeToServiceUseCase.Default;
export const UnassignEmployeeFromServiceUseCaseLayer =
  UnassignEmployeeFromServiceUseCase.Default;
export const ListEmployeeServicesUseCaseLayer =
  ListEmployeeServicesUseCase.Default;
export const ListServiceEmployeesUseCaseLayer =
  ListServiceEmployeesUseCase.Default;
