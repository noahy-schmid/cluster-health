import { Effect, Layer } from "effect";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { getOrCreatePostgreSQLContainer } from "@repo/test-fixtures";
import { Configuration } from "../../infrastructure/config.interface";
import { Database } from "../../infrastructure/database.interface";
import { DatabaseLayer } from "../../infrastructure/database.service";
import { salonsTable, stylistsTable } from "../../schema";
import { PostgresResourceAdapter } from "../../adapters/postgres-resource.adapter";
import { PostgresServiceDefinitionAdapter } from "../../adapters/postgres-service-definition.adapter";
import { PostgresServicePhaseAdapter } from "../../adapters/postgres-service-phase.adapter";
import { PostgresReadServiceAdapter } from "../../adapters/postgres-read-service.adapter";
import { PostgresEmployeeServiceAdapter } from "../../adapters/postgres-employee-service.adapter";
import { PostgresStylistPortAdapter } from "../../adapters/postgres-stylist-port.adapter";
import { PostgresSalonPortAdapter } from "../../adapters/postgres-salon-port.adapter";
import { ResourceAggregate } from "../../application/resource/resource.aggregate";
import { ServiceAggregate } from "../../application/service/service.aggregate";
import { EmployeeServiceAggregate } from "../../application/employee-service/employee-service.aggregate";
import { CreateResourceUseCase } from "../create-resource.use-case";
import { UpdateResourceUseCase } from "../update-resource.use-case";
import { DeleteResourceUseCase } from "../delete-resource.use-case";
import { ListResourcesUseCase } from "../list-resources.use-case";
import { CreateCustomServiceUseCase } from "../create-custom-service.use-case";
import { UpdateCustomServiceUseCase } from "../update-custom-service.use-case";
import { DeleteServiceDefinitionUseCase } from "../delete-service-definition.use-case";
import { ListServiceDefinitionsUseCase } from "../list-service-definitions.use-case";
import { GetServiceDefinitionUseCase } from "../get-service-definition.use-case";
import { AssignEmployeeToServiceUseCase } from "../assign-employee-to-service.use-case";
import { UnassignEmployeeFromServiceUseCase } from "../unassign-employee-from-service.use-case";
import { ListEmployeeServicesUseCase } from "../list-employee-services.use-case";
import { ListServiceEmployeesUseCase } from "../list-service-employees.use-case";
import { CreateSimpleServiceUseCase } from "../create-simple-service.use-case";
import { CreateColorationServiceUseCase } from "../create-coloration-service.use-case";

type SalonInsert = typeof salonsTable.$inferInsert;
type StylistInsert = typeof stylistsTable.$inferInsert;

export interface TestEnvironment {
  resourceUseCaseLayer: Layer.Layer<
    | CreateResourceUseCase
    | UpdateResourceUseCase
    | DeleteResourceUseCase
    | ListResourcesUseCase
  >;
  serviceUseCaseLayer: Layer.Layer<
    | CreateCustomServiceUseCase
    | UpdateCustomServiceUseCase
    | DeleteServiceDefinitionUseCase
    | ListServiceDefinitionsUseCase
    | GetServiceDefinitionUseCase
  >;
  assignmentUseCaseLayer: Layer.Layer<
    | AssignEmployeeToServiceUseCase
    | UnassignEmployeeFromServiceUseCase
    | ListEmployeeServicesUseCase
    | ListServiceEmployeesUseCase
  >;
  simpleColorationUseCaseLayer: Layer.Layer<
    CreateSimpleServiceUseCase | CreateColorationServiceUseCase
  >;
  infrastructureLayer: Layer.Layer<Database | Configuration>;
  stop: () => Promise<void>;
}

export type CreateSalonInput = Partial<
  Omit<SalonInsert, "id" | "createdAt" | "updatedAt">
>;

export interface CreateStylistInput extends Partial<
  Omit<StylistInsert, "id" | "createdAt" | "updatedAt" | "salonId">
> {
  salonId: string;
}

function createFixtureSuffix() {
  return crypto.randomUUID().slice(0, 8);
}

async function withDatabase<A>(
  env: TestEnvironment,
  description: string,
  operation: (db: Database["db"]) => Promise<A>,
) {
  return Effect.runPromise(
    Effect.gen(function* () {
      const { db } = yield* Database;
      return yield* Effect.tryPromise({
        try: () => operation(db),
        catch: (error) =>
          new Error(`Failed to ${description}`, { cause: error }),
      });
    }).pipe(Effect.provide(env.infrastructureLayer)),
  );
}

export async function setupTestEnvironment(): Promise<TestEnvironment> {
  const pgContainer = await getOrCreatePostgreSQLContainer();

  const testConfigurationLayer = Layer.effect(
    Configuration,
    Effect.succeed({
      databaseUrl: pgContainer.databaseUrl,
      s3Url: "",
      s3Region: "us-east-1",
      s3AccessKey: "",
      s3SecretKey: "",
      s3BucketName: "test-bucket",
    }),
  );

  const infrastructureLayer = DatabaseLayer.pipe(
    Layer.provideMerge(testConfigurationLayer),
  );

  const resourcePortLayer = PostgresResourceAdapter.pipe(
    Layer.provide(infrastructureLayer),
  );
  const serviceDefPortLayer = PostgresServiceDefinitionAdapter.pipe(
    Layer.provide(infrastructureLayer),
  );
  const servicePhasePortLayer = PostgresServicePhaseAdapter.pipe(
    Layer.provide(infrastructureLayer),
  );
  const readServicePortLayer = PostgresReadServiceAdapter.pipe(
    Layer.provide(infrastructureLayer),
  );
  const employeeServicePortLayer = PostgresEmployeeServiceAdapter.pipe(
    Layer.provide(infrastructureLayer),
  );
  const stylistPortLayer = PostgresStylistPortAdapter.pipe(
    Layer.provide(infrastructureLayer),
  );
  const salonPortLayer = PostgresSalonPortAdapter.pipe(
    Layer.provide(infrastructureLayer),
  );

  const resourceAggregateLayer =
    ResourceAggregate.DefaultWithoutDependencies.pipe(
      Layer.provide(resourcePortLayer),
    );

  const serviceAggregateLayer =
    ServiceAggregate.DefaultWithoutDependencies.pipe(
      Layer.provide(
        Layer.mergeAll(
          serviceDefPortLayer,
          servicePhasePortLayer,
          readServicePortLayer,
        ),
      ),
    );

  const assignmentAggregateLayer =
    EmployeeServiceAggregate.DefaultWithoutDependencies.pipe(
      Layer.provide(employeeServicePortLayer),
    );

  const resourceUseCaseLayer = Layer.mergeAll(
    CreateResourceUseCase.DefaultWithoutDependencies.pipe(
      Layer.provide(salonPortLayer),
    ),
    UpdateResourceUseCase.DefaultWithoutDependencies,
    DeleteResourceUseCase.DefaultWithoutDependencies.pipe(
      Layer.provide(servicePhasePortLayer),
    ),
    ListResourcesUseCase.DefaultWithoutDependencies,
  ).pipe(Layer.provide(resourceAggregateLayer), Layer.orDie);

  const serviceUseCaseLayer = Layer.mergeAll(
    CreateCustomServiceUseCase.DefaultWithoutDependencies.pipe(
      Layer.provide(salonPortLayer),
      Layer.provide(resourcePortLayer),
    ),
    UpdateCustomServiceUseCase.DefaultWithoutDependencies.pipe(
      Layer.provide(serviceDefPortLayer),
      Layer.provide(resourcePortLayer),
    ),
    DeleteServiceDefinitionUseCase.DefaultWithoutDependencies,
    ListServiceDefinitionsUseCase.DefaultWithoutDependencies,
    GetServiceDefinitionUseCase.DefaultWithoutDependencies,
  ).pipe(Layer.provide(serviceAggregateLayer), Layer.orDie);

  const assignmentUseCaseLayer = Layer.mergeAll(
    AssignEmployeeToServiceUseCase.DefaultWithoutDependencies.pipe(
      Layer.provide(serviceDefPortLayer),
      Layer.provide(stylistPortLayer),
    ),
    UnassignEmployeeFromServiceUseCase.DefaultWithoutDependencies,
    ListEmployeeServicesUseCase.DefaultWithoutDependencies.pipe(
      Layer.provide(serviceDefPortLayer),
    ),
    ListServiceEmployeesUseCase.DefaultWithoutDependencies.pipe(
      Layer.provide(stylistPortLayer),
    ),
  ).pipe(Layer.provide(assignmentAggregateLayer), Layer.orDie);

  const simpleColorationUseCaseLayer = Layer.mergeAll(
    CreateSimpleServiceUseCase.DefaultWithoutDependencies.pipe(
      Layer.provide(resourcePortLayer),
      Layer.provide(salonPortLayer),
    ),
    CreateColorationServiceUseCase.DefaultWithoutDependencies.pipe(
      Layer.provide(resourcePortLayer),
      Layer.provide(salonPortLayer),
    ),
  ).pipe(Layer.provide(serviceAggregateLayer), Layer.orDie);

  await Effect.runPromise(
    Effect.gen(function* () {
      const databaseService = yield* Database;
      yield* Effect.tryPromise(() =>
        migrate(databaseService.db, { migrationsFolder: "drizzle" }),
      );
    }).pipe(Effect.provide(infrastructureLayer)),
  );

  return {
    resourceUseCaseLayer,
    serviceUseCaseLayer,
    assignmentUseCaseLayer,
    simpleColorationUseCaseLayer,
    infrastructureLayer,
    stop: () => pgContainer.stop(),
  };
}

export async function createSalon(
  env: TestEnvironment,
  input: CreateSalonInput = {},
) {
  const suffix = createFixtureSuffix();
  const [salon] = await withDatabase(env, "create mock salon", (db) =>
    db
      .insert(salonsTable)
      .values({
        name: `Mock Salon ${suffix}`,
        street: "Mock Street 1",
        postalCode: "12345",
        city: "Mock City",
        phone: "+49 123 456789",
        ...input,
      })
      .returning(),
  );

  if (!salon) {
    throw new Error("Failed to create mock salon");
  }

  return salon;
}

export async function createStylist(
  env: TestEnvironment,
  input: CreateStylistInput,
) {
  const suffix = createFixtureSuffix();
  const { salonId, ...stylistInput } = input;
  const [stylist] = await withDatabase(env, "create mock stylist", (db) =>
    db
      .insert(stylistsTable)
      .values({
        salonId,
        name: `Mock Stylist ${suffix}`,
        subtitle: "Senior Stylist",
        description: "Mock stylist description",
        profileImageMediaId: null,
        ...stylistInput,
      })
      .returning(),
  );

  if (!stylist) {
    throw new Error("Failed to create mock stylist");
  }

  return stylist;
}
