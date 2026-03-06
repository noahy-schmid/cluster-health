import { Layer } from "effect";
import { MediaServiceLive } from "./services/media/media.service";
import { PostgresMediaAdapter } from "./adapters/postgres-media.adapter";
import { S3FileStorageAdapter } from "./adapters/s3-file-storage.adapter";
import { ConfigurationLayer } from "./infrastructure/config.service";
import { DatabaseLayer } from "./infrastructure/database.service";
import { PostgresServicePhaseAdapter } from "./adapters/postgres-service-phase.adapter";
import { PostgresServiceDefinitionAdapter } from "./adapters/postgres-service-definition.adapter";
import { PostgresStylistPortAdapter } from "./adapters/postgres-stylist-port.adapter";
import { PostgresResourceAdapter } from "./adapters/postgres-resource.adapter";
import { ValidateServiceResourcesDomainService } from "./application/domain-services/validate-service-resources.domain-service";
import { CreateResourceUseCase } from "./use-cases/create-resource.use-case";
import { UpdateResourceUseCase } from "./use-cases/update-resource.use-case";
import { DeleteResourceUseCase } from "./use-cases/delete-resource.use-case";
import { ListResourcesUseCase } from "./use-cases/list-resources.use-case";
import { CreateServiceDefinitionUseCase } from "./use-cases/create-service-definition.use-case";
import { UpdateServiceDefinitionUseCase } from "./use-cases/update-service-definition.use-case";
import { DeleteServiceDefinitionUseCase } from "./use-cases/delete-service-definition.use-case";
import { ListServiceDefinitionsUseCase } from "./use-cases/list-service-definitions.use-case";
import { CreateSimpleServiceUseCase } from "./use-cases/create-simple-service.use-case";
import { CreateColorationServiceUseCase } from "./use-cases/create-coloration-service.use-case";
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

// External port layers needed by use cases that do cross-aggregate checks
const ServicePhasePortLayer = PostgresServicePhaseAdapter.pipe(
  Layer.provide(InfrastructureLayer),
  Layer.orDie,
);

const ServiceDefinitionPortLayer = PostgresServiceDefinitionAdapter.pipe(
  Layer.provide(InfrastructureLayer),
  Layer.orDie,
);

const StylistPortLayer = PostgresStylistPortAdapter.pipe(
  Layer.provide(InfrastructureLayer),
  Layer.orDie,
);

const ResourcePortLayer = PostgresResourceAdapter.pipe(
  Layer.provide(InfrastructureLayer),
  Layer.orDie,
);

const ValidateServiceResourcesLayer =
  ValidateServiceResourcesDomainService.Default.pipe(
    Layer.provide(ResourcePortLayer),
  );

// Resource use case layers
export const CreateResourceUseCaseLayer = CreateResourceUseCase.Default;
export const UpdateResourceUseCaseLayer = UpdateResourceUseCase.Default;
export const DeleteResourceUseCaseLayer = DeleteResourceUseCase.Default.pipe(
  Layer.provide(ServicePhasePortLayer),
);
export const ListResourcesUseCaseLayer = ListResourcesUseCase.Default;

// Service definition use case layers
export const CreateServiceDefinitionUseCaseLayer =
  CreateServiceDefinitionUseCase.Default.pipe(
    Layer.provide(ValidateServiceResourcesLayer),
  );
export const UpdateServiceDefinitionUseCaseLayer =
  UpdateServiceDefinitionUseCase.Default.pipe(
    Layer.provide(ServiceDefinitionPortLayer),
    Layer.provide(ValidateServiceResourcesLayer),
  );
export const DeleteServiceDefinitionUseCaseLayer =
  DeleteServiceDefinitionUseCase.Default;
export const ListServiceDefinitionsUseCaseLayer =
  ListServiceDefinitionsUseCase.Default;

// Simplified service use case layers
export const CreateSimpleServiceUseCaseLayer =
  CreateSimpleServiceUseCase.Default.pipe(Layer.provide(ResourcePortLayer));
export const CreateColorationServiceUseCaseLayer =
  CreateColorationServiceUseCase.Default.pipe(Layer.provide(ResourcePortLayer));

// Employee-service assignment use case layers
export const AssignEmployeeToServiceUseCaseLayer =
  AssignEmployeeToServiceUseCase.Default.pipe(
    Layer.provide(ServiceDefinitionPortLayer),
    Layer.provide(StylistPortLayer),
  );
export const UnassignEmployeeFromServiceUseCaseLayer =
  UnassignEmployeeFromServiceUseCase.Default;
export const ListEmployeeServicesUseCaseLayer =
  ListEmployeeServicesUseCase.Default.pipe(
    Layer.provide(ServiceDefinitionPortLayer),
  );
export const ListServiceEmployeesUseCaseLayer =
  ListServiceEmployeesUseCase.Default.pipe(Layer.provide(StylistPortLayer));
