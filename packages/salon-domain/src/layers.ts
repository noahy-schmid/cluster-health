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
import { PostgresSalonPortAdapter } from "./adapters/postgres-salon-port.adapter";
import { CreateSalonUseCase } from "./use-cases/create-salon.use-case";
import { GetSalonUseCase } from "./use-cases/get-salon.use-case";
import { UpdateSalonUseCase } from "./use-cases/update-salon.use-case";
import { CreateResourceUseCase } from "./use-cases/create-resource.use-case";
import { UpdateResourceUseCase } from "./use-cases/update-resource.use-case";
import { DeleteResourceUseCase } from "./use-cases/delete-resource.use-case";
import { ListResourcesUseCase } from "./use-cases/list-resources.use-case";
import { CreateCustomServiceUseCase } from "./use-cases/create-custom-service.use-case";
import { UpdateCustomServiceUseCase } from "./use-cases/update-custom-service.use-case";
import { DeleteServiceDefinitionUseCase } from "./use-cases/delete-service-definition.use-case";
import { ListServiceDefinitionsUseCase } from "./use-cases/list-service-definitions.use-case";
import { GetServiceDefinitionUseCase } from "./use-cases/get-service-definition.use-case";
import { CreateSimpleServiceUseCase } from "./use-cases/create-simple-service.use-case";
import { CreateColorationServiceUseCase } from "./use-cases/create-coloration-service.use-case";
import { AssignEmployeeToServiceUseCase } from "./use-cases/assign-employee-to-service.use-case";
import { UnassignEmployeeFromServiceUseCase } from "./use-cases/unassign-employee-from-service.use-case";
import { ListEmployeeServicesUseCase } from "./use-cases/list-employee-services.use-case";
import { ListServiceEmployeesUseCase } from "./use-cases/list-service-employees.use-case";
import { SetSalonOpeningHoursUseCase } from "./use-cases/set-salon-opening-hours.use-case";
import { DeleteSalonOpeningHoursUseCase } from "./use-cases/delete-salon-opening-hours.use-case";
import { ListSalonOpeningHoursUseCase } from "./use-cases/list-salon-opening-hours.use-case";
import { CreateSalonOpeningHoursExceptionUseCase } from "./use-cases/create-salon-opening-hours-exception.use-case";
import { DeleteSalonOpeningHoursExceptionUseCase } from "./use-cases/delete-salon-opening-hours-exception.use-case";
import { ListSalonOpeningHoursExceptionsUseCase } from "./use-cases/list-salon-opening-hours-exceptions.use-case";
import { SetStylistAvailabilityUseCase } from "./use-cases/set-stylist-availability.use-case";
import { DeleteStylistAvailabilityUseCase } from "./use-cases/delete-stylist-availability.use-case";
import { ListStylistAvailabilityUseCase } from "./use-cases/list-stylist-availability.use-case";
import { CreateStylistAvailabilityExceptionUseCase } from "./use-cases/create-stylist-availability-exception.use-case";
import { DeleteStylistAvailabilityExceptionUseCase } from "./use-cases/delete-stylist-availability-exception.use-case";
import { ListStylistAvailabilityExceptionsUseCase } from "./use-cases/list-stylist-availability-exceptions.use-case";

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

const SalonPortLayer = PostgresSalonPortAdapter.pipe(
  Layer.provide(InfrastructureLayer),
  Layer.orDie,
);

// Salon use case layers
export const CreateSalonUseCaseLayer = CreateSalonUseCase.Default;
export const GetSalonUseCaseLayer = GetSalonUseCase.Default;
export const UpdateSalonUseCaseLayer = UpdateSalonUseCase.Default;

// Resource use case layers
export const CreateResourceUseCaseLayer = CreateResourceUseCase.Default.pipe(
  Layer.provide(SalonPortLayer),
);
export const UpdateResourceUseCaseLayer = UpdateResourceUseCase.Default;
export const DeleteResourceUseCaseLayer = DeleteResourceUseCase.Default.pipe(
  Layer.provide(ServicePhasePortLayer),
);
export const ListResourcesUseCaseLayer = ListResourcesUseCase.Default;

// Service definition use case layers
export const CreateCustomServiceUseCaseLayer =
  CreateCustomServiceUseCase.Default.pipe(
    Layer.provide(SalonPortLayer),
    Layer.provide(ResourcePortLayer),
  );
export const UpdateCustomServiceUseCaseLayer =
  UpdateCustomServiceUseCase.Default.pipe(
    Layer.provide(ServiceDefinitionPortLayer),
    Layer.provide(ResourcePortLayer),
  );
export const DeleteServiceDefinitionUseCaseLayer =
  DeleteServiceDefinitionUseCase.Default;
export const ListServiceDefinitionsUseCaseLayer =
  ListServiceDefinitionsUseCase.Default;
export const GetServiceDefinitionUseCaseLayer =
  GetServiceDefinitionUseCase.Default;

// Simplified service use case layers
export const CreateSimpleServiceUseCaseLayer =
  CreateSimpleServiceUseCase.Default.pipe(
    Layer.provide(ResourcePortLayer),
    Layer.provide(SalonPortLayer),
  );
export const CreateColorationServiceUseCaseLayer =
  CreateColorationServiceUseCase.Default.pipe(
    Layer.provide(ResourcePortLayer),
    Layer.provide(SalonPortLayer),
  );

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

// Opening hours use case layers
// OpeningHoursAggregate.Default already bundles its port, so only externally-used
// ports (SalonPort) need to be explicitly provided here.
export const SetSalonOpeningHoursUseCaseLayer =
  SetSalonOpeningHoursUseCase.Default.pipe(Layer.provide(SalonPortLayer));
export const DeleteSalonOpeningHoursUseCaseLayer =
  DeleteSalonOpeningHoursUseCase.Default;
export const ListSalonOpeningHoursUseCaseLayer =
  ListSalonOpeningHoursUseCase.Default;
export const CreateSalonOpeningHoursExceptionUseCaseLayer =
  CreateSalonOpeningHoursExceptionUseCase.Default.pipe(
    Layer.provide(SalonPortLayer),
  );
export const DeleteSalonOpeningHoursExceptionUseCaseLayer =
  DeleteSalonOpeningHoursExceptionUseCase.Default;
export const ListSalonOpeningHoursExceptionsUseCaseLayer =
  ListSalonOpeningHoursExceptionsUseCase.Default;

// Stylist availability use case layers
// StylistAvailabilityAggregate.Default already bundles its port.
export const SetStylistAvailabilityUseCaseLayer =
  SetStylistAvailabilityUseCase.Default.pipe(Layer.provide(StylistPortLayer));
export const DeleteStylistAvailabilityUseCaseLayer =
  DeleteStylistAvailabilityUseCase.Default;
export const ListStylistAvailabilityUseCaseLayer =
  ListStylistAvailabilityUseCase.Default;
export const CreateStylistAvailabilityExceptionUseCaseLayer =
  CreateStylistAvailabilityExceptionUseCase.Default.pipe(
    Layer.provide(StylistPortLayer),
  );
export const DeleteStylistAvailabilityExceptionUseCaseLayer =
  DeleteStylistAvailabilityExceptionUseCase.Default;
export const ListStylistAvailabilityExceptionsUseCaseLayer =
  ListStylistAvailabilityExceptionsUseCase.Default;
