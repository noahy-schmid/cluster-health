import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Effect, Either, Layer } from "effect";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { getOrCreatePostgreSQLContainer } from "@repo/test-fixtures";
import { Configuration } from "./infrastructure/config.interface";
import { Database } from "./infrastructure/database.interface";
import { DatabaseLayer } from "./infrastructure/database.service";
import { salonsTable, stylistsTable } from "./schema";

// Resource imports
import { PostgresResourceAdapter } from "./adapters/postgres-resource.adapter";
import { ResourceAggregate } from "./application/resource/resource.aggregate";
import {
  CreateResourceUseCase,
  type CreateResourceCommand,
} from "./use-cases/create-resource.use-case";
import {
  UpdateResourceUseCase,
  type UpdateResourceCommand,
} from "./use-cases/update-resource.use-case";
import {
  DeleteResourceUseCase,
} from "./use-cases/delete-resource.use-case";
import {
  ListResourcesUseCase,
  type ListResourcesQuery,
} from "./use-cases/list-resources.use-case";

// Service definition imports
import { PostgresServiceDefinitionAdapter } from "./adapters/postgres-service-definition.adapter";
import { ServiceAggregate } from "./application/service/service.aggregate";
import {
  CreateServiceDefinitionUseCase,
  type CreateServiceDefinitionCommand,
} from "./use-cases/create-service-definition.use-case";
import {
  UpdateServiceDefinitionUseCase,
  type UpdateServiceDefinitionCommand,
} from "./use-cases/update-service-definition.use-case";
import {
  DeleteServiceDefinitionUseCase,
  type DeleteServiceDefinitionCommand,
} from "./use-cases/delete-service-definition.use-case";
import {
  ListServiceDefinitionsUseCase,
  type ListServiceDefinitionsQuery,
} from "./use-cases/list-service-definitions.use-case";

// Employee-service imports
import { PostgresEmployeeServiceAdapter } from "./adapters/postgres-employee-service.adapter";
import { PostgresStylistPortAdapter } from "./adapters/postgres-stylist-port.adapter";
import { EmployeeServiceAggregate } from "./application/employee-service/employee-service.aggregate";
import {
  AssignEmployeeToServiceUseCase,
  type AssignEmployeeToServiceCommand,
} from "./use-cases/assign-employee-to-service.use-case";
import {
  UnassignEmployeeFromServiceUseCase,
  type UnassignEmployeeFromServiceCommand,
} from "./use-cases/unassign-employee-from-service.use-case";
import {
  ListEmployeeServicesUseCase,
  type ListEmployeeServicesQuery,
} from "./use-cases/list-employee-services.use-case";
import {
  ListServiceEmployeesUseCase,
  type ListServiceEmployeesQuery,
} from "./use-cases/list-service-employees.use-case";

describe("Service Domain Integration Tests", () => {
  let pgContainer: Awaited<ReturnType<typeof getOrCreatePostgreSQLContainer>>;
  let theSalonId: string;
  let theStylistId: string;
  let infrastructureLayer: Layer.Layer<Database | Configuration, never, never>;
  let resourceUseCaseLayer: Layer.Layer<
    | CreateResourceUseCase
    | UpdateResourceUseCase
    | DeleteResourceUseCase
    | ListResourcesUseCase,
    never,
    never
  >;
  let serviceUseCaseLayer: Layer.Layer<
    | CreateServiceDefinitionUseCase
    | UpdateServiceDefinitionUseCase
    | DeleteServiceDefinitionUseCase
    | ListServiceDefinitionsUseCase,
    never,
    never
  >;
  let assignmentUseCaseLayer: Layer.Layer<
    | AssignEmployeeToServiceUseCase
    | UnassignEmployeeFromServiceUseCase
    | ListEmployeeServicesUseCase
    | ListServiceEmployeesUseCase,
    never,
    never
  >;

  beforeAll(async () => {
    pgContainer = await getOrCreatePostgreSQLContainer();

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

    infrastructureLayer = DatabaseLayer.pipe(
      Layer.provideMerge(testConfigurationLayer),
    );

    // Resource layers
    const resourcePortLayer = PostgresResourceAdapter.pipe(
      Layer.provide(infrastructureLayer),
    );

    const resourceAggregateLayer =
      ResourceAggregate.DefaultWithoutDependencies.pipe(
        Layer.provide(resourcePortLayer),
      );

    resourceUseCaseLayer = Layer.mergeAll(
      CreateResourceUseCase.DefaultWithoutDependencies,
      UpdateResourceUseCase.DefaultWithoutDependencies,
      DeleteResourceUseCase.DefaultWithoutDependencies,
      ListResourcesUseCase.DefaultWithoutDependencies,
    ).pipe(Layer.provide(resourceAggregateLayer), Layer.orDie);

    // Service definition layers
    const servicePortLayer = PostgresServiceDefinitionAdapter.pipe(
      Layer.provide(infrastructureLayer),
    );

    const serviceAggregateLayer =
      ServiceAggregate.DefaultWithoutDependencies.pipe(
        Layer.provide(servicePortLayer),
      );

    serviceUseCaseLayer = Layer.mergeAll(
      CreateServiceDefinitionUseCase.DefaultWithoutDependencies,
      UpdateServiceDefinitionUseCase.DefaultWithoutDependencies,
      DeleteServiceDefinitionUseCase.DefaultWithoutDependencies,
      ListServiceDefinitionsUseCase.DefaultWithoutDependencies,
    ).pipe(Layer.provide(serviceAggregateLayer), Layer.orDie);

    // Employee-service assignment layers
    const employeeServicePortLayer = PostgresEmployeeServiceAdapter.pipe(
      Layer.provide(infrastructureLayer),
    );

    const stylistPortLayer = PostgresStylistPortAdapter.pipe(
      Layer.provide(infrastructureLayer),
    );

    const assignmentAggregateLayer =
      EmployeeServiceAggregate.DefaultWithoutDependencies.pipe(
        Layer.provide(
          Layer.mergeAll(
            employeeServicePortLayer,
            servicePortLayer,
            stylistPortLayer,
          ),
        ),
      );

    assignmentUseCaseLayer = Layer.mergeAll(
      AssignEmployeeToServiceUseCase.DefaultWithoutDependencies,
      UnassignEmployeeFromServiceUseCase.DefaultWithoutDependencies,
      ListEmployeeServicesUseCase.DefaultWithoutDependencies,
      ListServiceEmployeesUseCase.DefaultWithoutDependencies,
    ).pipe(Layer.provide(assignmentAggregateLayer), Layer.orDie);

    // Run migrations and seed data
    await Effect.runPromise(
      Effect.gen(function* () {
        const { db } = yield* Database;
        yield* Effect.tryPromise(() =>
          migrate(db, { migrationsFolder: "drizzle" }),
        );

        // Create a salon
        const [salon] = yield* Effect.tryPromise(() =>
          db
            .insert(salonsTable)
            .values({
              name: "Test Service Salon",
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

        // Create a stylist
        const [stylist] = yield* Effect.tryPromise(() =>
          db
            .insert(stylistsTable)
            .values({
              salonId: theSalonId,
              name: "Test Stylist",
              subtitle: "Senior Stylist",
              description: "An experienced stylist",
              profileImage: "https://example.com/image.jpg",
            })
            .returning({ id: stylistsTable.id }),
        );
        if (!stylist) {
          return yield* Effect.fail(
            new Error("Failed to create test stylist"),
          );
        }
        theStylistId = stylist.id;
      }).pipe(Effect.provide(infrastructureLayer)),
    );
  }, 60_000);

  afterAll(async () => {
    if (pgContainer) {
      await pgContainer.stop();
    }
  });

  // ---- Resource Use Cases ----

  describe("Resource Use Cases", () => {
    let createdResourceId: string;

    it("should create a resource", async () => {
      const command: CreateResourceCommand = {
        salonId: theSalonId,
        type: "seat",
        name: "Styling Chair",
        amount: 3,
      };

      const program = Effect.gen(function* () {
        const useCase = yield* CreateResourceUseCase;
        const resource = yield* useCase.execute(command);

        expect(resource).toBeDefined();
        expect(resource.id).toBeDefined();
        expect(resource.salonId).toBe(theSalonId);
        expect(resource.type).toBe("seat");
        expect(resource.name).toBe("Styling Chair");
        expect(resource.amount).toBe(3);

        createdResourceId = resource.id;
        return resource;
      });

      await Effect.runPromise(program.pipe(Effect.provide(resourceUseCaseLayer)));
    });

    it("should list resources for a salon", async () => {
      const query: ListResourcesQuery = { salonId: theSalonId };

      const program = Effect.gen(function* () {
        const useCase = yield* ListResourcesUseCase;
        const resources = yield* useCase.execute(query);

        expect(resources.length).toBeGreaterThanOrEqual(1);
        expect(resources.some((r) => r.type === "seat")).toBe(true);
      });

      await Effect.runPromise(program.pipe(Effect.provide(resourceUseCaseLayer)));
    });

    it("should update a resource", async () => {
      const command: UpdateResourceCommand = {
        resourceId: createdResourceId,
        name: "Updated Chair",
        amount: 5,
      };

      const program = Effect.gen(function* () {
        const useCase = yield* UpdateResourceUseCase;
        const updated = yield* useCase.execute(command);

        expect(updated.name).toBe("Updated Chair");
        expect(updated.amount).toBe(5);
      });

      await Effect.runPromise(program.pipe(Effect.provide(resourceUseCaseLayer)));
    });

    it("should fail to create a resource with empty type", async () => {
      const command: CreateResourceCommand = {
        salonId: theSalonId,
        type: "  ",
        name: "Invalid",
        amount: 1,
      };

      const program = Effect.gen(function* () {
        const useCase = yield* CreateResourceUseCase;
        const result = yield* useCase.execute(command).pipe(Effect.either);

        expect(Either.isLeft(result)).toBe(true);
        if (Either.isLeft(result)) {
          expect(result.left._tag).toBe("ResourceValidationError");
        }
      });

      await Effect.runPromise(program.pipe(Effect.provide(resourceUseCaseLayer)));
    });

    it("should fail to create a resource with amount < 1", async () => {
      const command: CreateResourceCommand = {
        salonId: theSalonId,
        type: "dryer",
        name: "Dryer",
        amount: 0,
      };

      const program = Effect.gen(function* () {
        const useCase = yield* CreateResourceUseCase;
        const result = yield* useCase.execute(command).pipe(Effect.either);

        expect(Either.isLeft(result)).toBe(true);
        if (Either.isLeft(result)) {
          expect(result.left._tag).toBe("ResourceValidationError");
        }
      });

      await Effect.runPromise(program.pipe(Effect.provide(resourceUseCaseLayer)));
    });

    it("should delete a resource that is not referenced", async () => {
      // Create a resource just to delete it
      const program = Effect.gen(function* () {
        const createUseCase = yield* CreateResourceUseCase;
        const deleteUseCase = yield* DeleteResourceUseCase;
        const listUseCase = yield* ListResourcesUseCase;

        const resource = yield* createUseCase.execute({
          salonId: theSalonId,
          type: "climazon-deletable",
          name: "Deletable Climazon",
          amount: 1,
        });

        const beforeDelete = yield* listUseCase.execute({
          salonId: theSalonId,
        });
        const countBefore = beforeDelete.length;

        yield* deleteUseCase.execute({ resourceId: resource.id });

        const afterDelete = yield* listUseCase.execute({
          salonId: theSalonId,
        });
        expect(afterDelete.length).toBe(countBefore - 1);
      });

      await Effect.runPromise(program.pipe(Effect.provide(resourceUseCaseLayer)));
    });
  });

  // ---- Service Definition Use Cases ----

  describe("Service Definition Use Cases", () => {
    let createdServiceId: string;

    it("should create a service definition with phases", async () => {
      const command: CreateServiceDefinitionCommand = {
        salonId: theSalonId,
        name: "Haircut & Style",
        description: "A complete haircut and styling service",
        price: "45.00",
        phases: [
          {
            name: "Wash",
            durationMinutes: 10,
            requiredResources: [{ resourceType: "seat" }],
          },
          {
            name: "Cut",
            durationMinutes: 30,
            requiredResources: [{ resourceType: "seat" }],
          },
          {
            name: "Style",
            durationMinutes: 15,
            requiredResources: [{ resourceType: "seat" }],
          },
        ],
      };

      const program = Effect.gen(function* () {
        const useCase = yield* CreateServiceDefinitionUseCase;
        const service = yield* useCase.execute(command);

        expect(service).toBeDefined();
        expect(service.id).toBeDefined();
        expect(service.salonId).toBe(theSalonId);
        expect(service.name).toBe("Haircut & Style");
        expect(service.description).toBe(
          "A complete haircut and styling service",
        );
        expect(service.price).toBe("45.00");
        expect(service.phases.length).toBe(3);
        expect(service.durationMinutes).toBe(55); // 10 + 30 + 15
        expect(service.phases[0]?.name).toBe("Wash");
        expect(service.phases[0]?.order).toBe(0);
        expect(service.phases[1]?.name).toBe("Cut");
        expect(service.phases[1]?.order).toBe(1);
        expect(service.phases[2]?.name).toBe("Style");
        expect(service.phases[2]?.order).toBe(2);
        expect(service.phases[0]?.requiredResources.length).toBe(1);
        expect(service.phases[0]?.requiredResources[0]?.resourceType).toBe(
          "seat",
        );

        createdServiceId = service.id;
        return service;
      });

      await Effect.runPromise(program.pipe(Effect.provide(serviceUseCaseLayer)));
    });

    it("should list service definitions for a salon", async () => {
      const query: ListServiceDefinitionsQuery = { salonId: theSalonId };

      const program = Effect.gen(function* () {
        const useCase = yield* ListServiceDefinitionsUseCase;
        const services = yield* useCase.execute(query);

        expect(services.length).toBeGreaterThanOrEqual(1);
        expect(services.some((s) => s.name === "Haircut & Style")).toBe(true);
      });

      await Effect.runPromise(program.pipe(Effect.provide(serviceUseCaseLayer)));
    });

    it("should update a service definition with new phases", async () => {
      const command: UpdateServiceDefinitionCommand = {
        serviceId: createdServiceId,
        name: "Updated Haircut",
        description: "Updated description",
        price: "55.00",
        phases: [
          {
            name: "Consultation",
            durationMinutes: 5,
            requiredResources: [],
          },
          {
            name: "Wash & Cut",
            durationMinutes: 40,
            requiredResources: [{ resourceType: "seat" }],
          },
        ],
      };

      const program = Effect.gen(function* () {
        const useCase = yield* UpdateServiceDefinitionUseCase;
        const updated = yield* useCase.execute(command);

        expect(updated.name).toBe("Updated Haircut");
        expect(updated.description).toBe("Updated description");
        expect(updated.price).toBe("55.00");
        expect(updated.phases.length).toBe(2);
        expect(updated.durationMinutes).toBe(45); // 5 + 40
        expect(updated.phases[0]?.name).toBe("Consultation");
        expect(updated.phases[0]?.requiredResources.length).toBe(0);
        expect(updated.phases[1]?.name).toBe("Wash & Cut");
        expect(updated.phases[1]?.requiredResources.length).toBe(1);
      });

      await Effect.runPromise(program.pipe(Effect.provide(serviceUseCaseLayer)));
    });

    it("should fail to create a service with no phases", async () => {
      const command: CreateServiceDefinitionCommand = {
        salonId: theSalonId,
        name: "Empty Service",
        description: "No phases",
        price: "10.00",
        phases: [],
      };

      const program = Effect.gen(function* () {
        const useCase = yield* CreateServiceDefinitionUseCase;
        const result = yield* useCase.execute(command).pipe(Effect.either);

        expect(Either.isLeft(result)).toBe(true);
        if (Either.isLeft(result)) {
          expect(result.left._tag).toBe("ServiceValidationError");
        }
      });

      await Effect.runPromise(program.pipe(Effect.provide(serviceUseCaseLayer)));
    });

    it("should fail to create a service with empty name", async () => {
      const command: CreateServiceDefinitionCommand = {
        salonId: theSalonId,
        name: "  ",
        description: "Description",
        price: "10.00",
        phases: [
          { name: "Phase", durationMinutes: 10, requiredResources: [] },
        ],
      };

      const program = Effect.gen(function* () {
        const useCase = yield* CreateServiceDefinitionUseCase;
        const result = yield* useCase.execute(command).pipe(Effect.either);

        expect(Either.isLeft(result)).toBe(true);
        if (Either.isLeft(result)) {
          expect(result.left._tag).toBe("ServiceValidationError");
        }
      });

      await Effect.runPromise(program.pipe(Effect.provide(serviceUseCaseLayer)));
    });

    it("should fail to update a non-existent service", async () => {
      const command: UpdateServiceDefinitionCommand = {
        serviceId: crypto.randomUUID(),
        name: "Ghost Service",
        description: "Does not exist",
        price: "10.00",
        phases: [
          { name: "Phase", durationMinutes: 10, requiredResources: [] },
        ],
      };

      const program = Effect.gen(function* () {
        const useCase = yield* UpdateServiceDefinitionUseCase;
        const result = yield* useCase.execute(command).pipe(Effect.either);

        expect(Either.isLeft(result)).toBe(true);
        if (Either.isLeft(result)) {
          expect(result.left._tag).toBe("ServiceNotFoundError");
        }
      });

      await Effect.runPromise(program.pipe(Effect.provide(serviceUseCaseLayer)));
    });

    it("should delete a service definition", async () => {
      // Create one to delete
      const program = Effect.gen(function* () {
        const createUseCase = yield* CreateServiceDefinitionUseCase;
        const deleteUseCase = yield* DeleteServiceDefinitionUseCase;
        const listUseCase = yield* ListServiceDefinitionsUseCase;

        const service = yield* createUseCase.execute({
          salonId: theSalonId,
          name: "Temporary Service",
          description: "Will be deleted",
          price: "20.00",
          phases: [
            { name: "Quick Phase", durationMinutes: 15, requiredResources: [] },
          ],
        });

        const beforeDelete = yield* listUseCase.execute({
          salonId: theSalonId,
        });
        const countBefore = beforeDelete.length;

        yield* deleteUseCase.execute({ serviceId: service.id });

        const afterDelete = yield* listUseCase.execute({
          salonId: theSalonId,
        });
        expect(afterDelete.length).toBe(countBefore - 1);
      });

      await Effect.runPromise(program.pipe(Effect.provide(serviceUseCaseLayer)));
    });

    it("should fail to delete a non-existent service", async () => {
      const command: DeleteServiceDefinitionCommand = {
        serviceId: crypto.randomUUID(),
      };

      const program = Effect.gen(function* () {
        const useCase = yield* DeleteServiceDefinitionUseCase;
        const result = yield* useCase.execute(command).pipe(Effect.either);

        expect(Either.isLeft(result)).toBe(true);
        if (Either.isLeft(result)) {
          expect(result.left._tag).toBe("ServiceNotFoundError");
        }
      });

      await Effect.runPromise(program.pipe(Effect.provide(serviceUseCaseLayer)));
    });
  });

  // ---- Resource deletion with reference check ----

  describe("Resource In-Use Check", () => {
    it("should fail to delete a resource type that is referenced by a service phase", async () => {
      // The "seat" type is referenced by the Haircut & Style service we created above
      const program = Effect.gen(function* () {
        const listResources = yield* ListResourcesUseCase;
        const deleteResource = yield* DeleteResourceUseCase;

        const resources = yield* listResources.execute({
          salonId: theSalonId,
        });
        const seatResource = resources.find((r) => r.type === "seat");
        expect(seatResource).toBeDefined();

        if (seatResource) {
          const result = yield* deleteResource
            .execute({ resourceId: seatResource.id })
            .pipe(Effect.either);

          expect(Either.isLeft(result)).toBe(true);
          if (Either.isLeft(result)) {
            expect(result.left._tag).toBe("ResourceInUseError");
          }
        }
      });

      await Effect.runPromise(program.pipe(Effect.provide(resourceUseCaseLayer)));
    });
  });

  // ---- Employee-Service Assignment Use Cases ----

  describe("Employee-Service Assignment Use Cases", () => {
    let assignmentServiceId: string;

    // We need both service and assignment layers together
    let combinedLayer: Layer.Layer<
      | AssignEmployeeToServiceUseCase
      | UnassignEmployeeFromServiceUseCase
      | ListEmployeeServicesUseCase
      | ListServiceEmployeesUseCase
      | CreateServiceDefinitionUseCase
      | DeleteServiceDefinitionUseCase
      | ListServiceDefinitionsUseCase,
      never,
      never
    >;

    beforeAll(() => {
      combinedLayer = Layer.mergeAll(assignmentUseCaseLayer, serviceUseCaseLayer);
    });

    it("should create a service and assign an employee to it", async () => {
      const program = Effect.gen(function* () {
        // Create a service for this test
        const createService = yield* CreateServiceDefinitionUseCase;
        const service = yield* createService.execute({
          salonId: theSalonId,
          name: "Coloring Service",
          description: "Hair coloring",
          price: "80.00",
          phases: [
            {
              name: "Apply Color",
              durationMinutes: 30,
              requiredResources: [],
            },
            {
              name: "Wait",
              durationMinutes: 20,
              requiredResources: [],
            },
            {
              name: "Rinse",
              durationMinutes: 10,
              requiredResources: [],
            },
          ],
        });
        assignmentServiceId = service.id;

        // Assign the stylist
        const assignUseCase = yield* AssignEmployeeToServiceUseCase;
        const assignment = yield* assignUseCase.execute({
          stylistId: theStylistId,
          serviceId: assignmentServiceId,
        });

        expect(assignment).toBeDefined();
        expect(assignment.stylistId).toBe(theStylistId);
        expect(assignment.serviceDefinitionId).toBe(assignmentServiceId);
        expect(assignment.createdAt).toBeDefined();
      });

      await Effect.runPromise(program.pipe(Effect.provide(combinedLayer)));
    });

    it("should list services for an employee", async () => {
      const query: ListEmployeeServicesQuery = {
        stylistId: theStylistId,
      };

      const program = Effect.gen(function* () {
        const useCase = yield* ListEmployeeServicesUseCase;
        const assignments = yield* useCase.execute(query);

        expect(assignments.length).toBeGreaterThanOrEqual(1);
        expect(
          assignments.some(
            (a) => a.serviceDefinitionId === assignmentServiceId,
          ),
        ).toBe(true);
      });

      await Effect.runPromise(
        program.pipe(Effect.provide(assignmentUseCaseLayer)),
      );
    });

    it("should list employees for a service", async () => {
      const query: ListServiceEmployeesQuery = {
        serviceId: assignmentServiceId,
      };

      const program = Effect.gen(function* () {
        const useCase = yield* ListServiceEmployeesUseCase;
        const assignments = yield* useCase.execute(query);

        expect(assignments.length).toBeGreaterThanOrEqual(1);
        expect(
          assignments.some((a) => a.stylistId === theStylistId),
        ).toBe(true);
      });

      await Effect.runPromise(
        program.pipe(Effect.provide(assignmentUseCaseLayer)),
      );
    });

    it("should fail to assign the same employee twice", async () => {
      const command: AssignEmployeeToServiceCommand = {
        stylistId: theStylistId,
        serviceId: assignmentServiceId,
      };

      const program = Effect.gen(function* () {
        const useCase = yield* AssignEmployeeToServiceUseCase;
        const result = yield* useCase.execute(command).pipe(Effect.either);

        expect(Either.isLeft(result)).toBe(true);
        if (Either.isLeft(result)) {
          expect(result.left._tag).toBe(
            "EmployeeServiceAlreadyAssignedError",
          );
        }
      });

      await Effect.runPromise(
        program.pipe(Effect.provide(assignmentUseCaseLayer)),
      );
    });

    it("should fail to assign a non-existent stylist", async () => {
      const command: AssignEmployeeToServiceCommand = {
        stylistId: crypto.randomUUID(),
        serviceId: assignmentServiceId,
      };

      const program = Effect.gen(function* () {
        const useCase = yield* AssignEmployeeToServiceUseCase;
        const result = yield* useCase.execute(command).pipe(Effect.either);

        expect(Either.isLeft(result)).toBe(true);
        if (Either.isLeft(result)) {
          expect(result.left._tag).toBe("EmployeeServiceError");
        }
      });

      await Effect.runPromise(
        program.pipe(Effect.provide(assignmentUseCaseLayer)),
      );
    });

    it("should fail to assign to a non-existent service", async () => {
      const command: AssignEmployeeToServiceCommand = {
        stylistId: theStylistId,
        serviceId: crypto.randomUUID(),
      };

      const program = Effect.gen(function* () {
        const useCase = yield* AssignEmployeeToServiceUseCase;
        const result = yield* useCase.execute(command).pipe(Effect.either);

        expect(Either.isLeft(result)).toBe(true);
        if (Either.isLeft(result)) {
          expect(result.left._tag).toBe("EmployeeServiceError");
        }
      });

      await Effect.runPromise(
        program.pipe(Effect.provide(assignmentUseCaseLayer)),
      );
    });

    it("should unassign an employee from a service", async () => {
      const command: UnassignEmployeeFromServiceCommand = {
        stylistId: theStylistId,
        serviceId: assignmentServiceId,
      };

      const program = Effect.gen(function* () {
        const useCase = yield* UnassignEmployeeFromServiceUseCase;
        yield* useCase.execute(command);

        // Verify the assignment is gone
        const listUseCase = yield* ListServiceEmployeesUseCase;
        const assignments = yield* listUseCase.execute({
          serviceId: assignmentServiceId,
        });

        expect(
          assignments.some((a) => a.stylistId === theStylistId),
        ).toBe(false);
      });

      await Effect.runPromise(
        program.pipe(Effect.provide(assignmentUseCaseLayer)),
      );
    });

    it("should fail to unassign when assignment does not exist", async () => {
      const command: UnassignEmployeeFromServiceCommand = {
        stylistId: theStylistId,
        serviceId: assignmentServiceId,
      };

      const program = Effect.gen(function* () {
        const useCase = yield* UnassignEmployeeFromServiceUseCase;
        const result = yield* useCase.execute(command).pipe(Effect.either);

        expect(Either.isLeft(result)).toBe(true);
        if (Either.isLeft(result)) {
          expect(result.left._tag).toBe("EmployeeServiceNotFoundError");
        }
      });

      await Effect.runPromise(
        program.pipe(Effect.provide(assignmentUseCaseLayer)),
      );
    });

    it("should cascade delete assignments when service is deleted", async () => {
      const program = Effect.gen(function* () {
        // Re-assign
        const assignUseCase = yield* AssignEmployeeToServiceUseCase;
        yield* assignUseCase.execute({
          stylistId: theStylistId,
          serviceId: assignmentServiceId,
        });

        // Verify it exists
        const listBefore = yield* ListServiceEmployeesUseCase;
        const beforeAssignments = yield* listBefore.execute({
          serviceId: assignmentServiceId,
        });
        expect(beforeAssignments.length).toBe(1);

        // Delete the service
        const deleteUseCase = yield* DeleteServiceDefinitionUseCase;
        yield* deleteUseCase.execute({ serviceId: assignmentServiceId });

        // Verify assignments are gone (the service no longer exists, assignments should be cascade-deleted)
        const listAfter = yield* ListServiceEmployeesUseCase;
        const afterAssignments = yield* listAfter.execute({
          serviceId: assignmentServiceId,
        });
        expect(afterAssignments.length).toBe(0);
      });

      await Effect.runPromise(program.pipe(Effect.provide(combinedLayer)));
    });
  });
});
