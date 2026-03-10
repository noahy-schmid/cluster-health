import { Effect, Layer } from "effect";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { getOrCreatePostgreSQLContainer } from "@repo/test-fixtures";
import { Configuration } from "../../infrastructure/config.interface";
import { Database } from "../../infrastructure/database.interface";
import { DatabaseLayer } from "../../infrastructure/database.service";
import { salonsTable, stylistsTable, salonResourcesTable } from "../../schema";
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

export interface TestContext {
  salonId: string;
  stylistId: string;
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

export async function setupTestContext(): Promise<TestContext> {
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

  // Port layers
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

  // Aggregate layers
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

  // Use case layers
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

  // Run migrations and seed data
  let theSalonId = "";
  let theStylistId = "";

  await Effect.runPromise(
    Effect.gen(function* () {
      const { db } = yield* Database;
      yield* Effect.tryPromise(() =>
        migrate(db, { migrationsFolder: "drizzle" }),
      );

      const [salon] = yield* Effect.tryPromise(() =>
        db
          .insert(salonsTable)
          .values({
            name: `Test Service Salon ${Date.now()}`,
            street: "Test Street 1",
            postalCode: "12345",
            city: "Test City",
            phone: "+49 123 456789",
          })
          .returning({ id: salonsTable.id }),
      );
      if (!salon) {
        return yield* Effect.fail(new Error("Failed to create test salon"));
      }
      theSalonId = salon.id;

      const [stylist] = yield* Effect.tryPromise(() =>
        db
          .insert(stylistsTable)
          .values({
            salonId: theSalonId,
            name: "Test Stylist",
            subtitle: "Senior Stylist",
            description: "An experienced stylist",
            profileImageMediaId: null,
          })
          .returning({ id: stylistsTable.id }),
      );
      if (!stylist) {
        return yield* Effect.fail(new Error("Failed to create test stylist"));
      }
      theStylistId = stylist.id;

      // Create resources for service phase tests (no "employee" resource - that's modeled via employeeRequired)
      yield* Effect.tryPromise(() =>
        db.insert(salonResourcesTable).values([
          {
            salonId: theSalonId,
            slug: "seat",
            name: "Styling Chair",
            amount: 3,
          },
          {
            salonId: theSalonId,
            slug: "climazon",
            name: "Climazon",
            amount: 2,
          },
        ]),
      );
    }).pipe(Effect.provide(infrastructureLayer)),
  );

  return {
    salonId: theSalonId,
    stylistId: theStylistId,
    resourceUseCaseLayer,
    serviceUseCaseLayer,
    assignmentUseCaseLayer,
    simpleColorationUseCaseLayer,
    infrastructureLayer,
    stop: () => pgContainer.stop(),
  };
}
