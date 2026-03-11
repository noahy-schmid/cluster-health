import type { CreateColorationServiceCommand } from "../create-coloration-service.use-case";
import type { CreateCustomServiceCommand } from "../create-custom-service.use-case";
import type { CreateResourceCommand } from "../create-resource.use-case";
import type { CreateSimpleServiceCommand } from "../create-simple-service.use-case";
import type { DeleteResourceCommand } from "../delete-resource.use-case";
import type { DeleteServiceDefinitionCommand } from "../delete-service-definition.use-case";
import type { GetServiceDefinitionQuery } from "../get-service-definition.use-case";
import type { ListResourcesQuery } from "../list-resources.use-case";
import type { ListServiceDefinitionsQuery } from "../list-service-definitions.use-case";
import type { UpdateCustomServiceCommand } from "../update-custom-service.use-case";
import type { UpdateResourceCommand } from "../update-resource.use-case";
import type { AssignEmployeeToServiceCommand } from "../assign-employee-to-service.use-case";
import type { UnassignEmployeeFromServiceCommand } from "../unassign-employee-from-service.use-case";
import type { ListEmployeeServicesQuery } from "../list-employee-services.use-case";
import type { ListServiceEmployeesQuery } from "../list-service-employees.use-case";
import type { CreateSalonInput, CreateStylistInput } from "./test-setup";

function createFixtureSuffix() {
  return crypto.randomUUID().slice(0, 8);
}

function createServicePhases() {
  const suffix = createFixtureSuffix();

  return [
    {
      name: `Mock Phase ${suffix}`,
      durationMinutes: 30,
      employeeRequired: true,
      requiredResourceSlugs: [],
    },
  ] satisfies CreateCustomServiceCommand["phases"];
}

export function createSalonInput(
  overrides: Partial<CreateSalonInput> = {},
): CreateSalonInput {
  const suffix = createFixtureSuffix();

  return {
    name: `Mock Salon ${suffix}`,
    street: `${suffix} Mock Street`,
    postalCode: "12345",
    city: `Mock City ${suffix}`,
    phone: `+49 123 ${suffix}`,
    ...overrides,
  };
}

export function createStylistInput(
  overrides: Partial<CreateStylistInput> = {},
): CreateStylistInput {
  const suffix = createFixtureSuffix();

  return {
    salonId: crypto.randomUUID(),
    name: `Mock Stylist ${suffix}`,
    subtitle: `Senior Stylist ${suffix}`,
    description: `Mock stylist description ${suffix}`,
    profileImageMediaId: null,
    ...overrides,
  };
}

export function createResourceCommand(
  overrides: Partial<CreateResourceCommand> = {},
): CreateResourceCommand {
  const suffix = createFixtureSuffix();

  return {
    salonId: crypto.randomUUID(),
    slug: `mock-resource-${suffix}`,
    name: `Mock Resource ${suffix}`,
    amount: 1,
    ...overrides,
  };
}

export function createUpdateResourceCommand(
  overrides: Partial<UpdateResourceCommand> = {},
): UpdateResourceCommand {
  const suffix = createFixtureSuffix();

  return {
    salonId: crypto.randomUUID(),
    slug: `mock-resource-${suffix}`,
    name: `Updated Resource ${suffix}`,
    amount: 2,
    ...overrides,
  };
}

export function createDeleteResourceCommand(
  overrides: Partial<DeleteResourceCommand> = {},
): DeleteResourceCommand {
  return {
    salonId: crypto.randomUUID(),
    slug: `mock-resource-${createFixtureSuffix()}`,
    ...overrides,
  };
}

export function createListResourcesQuery(
  overrides: Partial<ListResourcesQuery> = {},
): ListResourcesQuery {
  return {
    salonId: crypto.randomUUID(),
    ...overrides,
  };
}

export function createCustomServiceCommand(
  overrides: Partial<CreateCustomServiceCommand> = {},
): CreateCustomServiceCommand {
  const suffix = createFixtureSuffix();

  return {
    salonId: crypto.randomUUID(),
    name: `Mock Custom Service ${suffix}`,
    description: `Mock custom service description ${suffix}`,
    priceInCents: 2500,
    phases: createServicePhases(),
    ...overrides,
  };
}

export function createSimpleServiceCommand(
  overrides: Partial<CreateSimpleServiceCommand> = {},
): CreateSimpleServiceCommand {
  const suffix = createFixtureSuffix();

  return {
    salonId: crypto.randomUUID(),
    name: `Mock Simple Service ${suffix}`,
    description: `Mock simple service description ${suffix}`,
    priceInCents: 2500,
    durationMinutes: 30,
    ...overrides,
  };
}

export function createColorationServiceCommand(
  overrides: Partial<CreateColorationServiceCommand> = {},
): CreateColorationServiceCommand {
  const suffix = createFixtureSuffix();

  return {
    salonId: crypto.randomUUID(),
    name: `Mock Coloration Service ${suffix}`,
    description: `Mock coloration service description ${suffix}`,
    priceInCents: 9500,
    applicationDurationMinutes: 20,
    processingDurationMinutes: 30,
    finishingDurationMinutes: 15,
    ...overrides,
  };
}

export function createUpdateCustomServiceCommand(
  overrides: Partial<UpdateCustomServiceCommand> = {},
): UpdateCustomServiceCommand {
  const suffix = createFixtureSuffix();

  return {
    serviceId: crypto.randomUUID(),
    name: `Updated Service ${suffix}`,
    description: `Updated service description ${suffix}`,
    priceInCents: 4500,
    phases: [
      {
        name: `Consultation ${suffix}`,
        durationMinutes: 10,
        employeeRequired: true,
        requiredResourceSlugs: [],
      },
      {
        name: `Service ${suffix}`,
        durationMinutes: 35,
        employeeRequired: true,
        requiredResourceSlugs: [],
      },
    ],
    ...overrides,
  };
}

export function createDeleteServiceDefinitionCommand(
  overrides: Partial<DeleteServiceDefinitionCommand> = {},
): DeleteServiceDefinitionCommand {
  return {
    serviceId: crypto.randomUUID(),
    ...overrides,
  };
}

export function createListServiceDefinitionsQuery(
  overrides: Partial<ListServiceDefinitionsQuery> = {},
): ListServiceDefinitionsQuery {
  return {
    salonId: crypto.randomUUID(),
    includeDeleted: false,
    ...overrides,
  };
}

export function createGetServiceDefinitionQuery(
  overrides: Partial<GetServiceDefinitionQuery> = {},
): GetServiceDefinitionQuery {
  return {
    serviceId: crypto.randomUUID(),
    ...overrides,
  };
}

export function createAssignEmployeeToServiceCommand(
  overrides: Partial<AssignEmployeeToServiceCommand> = {},
): AssignEmployeeToServiceCommand {
  return {
    stylistId: crypto.randomUUID(),
    serviceId: crypto.randomUUID(),
    ...overrides,
  };
}

export function createUnassignEmployeeFromServiceCommand(
  overrides: Partial<UnassignEmployeeFromServiceCommand> = {},
): UnassignEmployeeFromServiceCommand {
  return {
    stylistId: crypto.randomUUID(),
    serviceId: crypto.randomUUID(),
    ...overrides,
  };
}

export function createListEmployeeServicesQuery(
  overrides: Partial<ListEmployeeServicesQuery> = {},
): ListEmployeeServicesQuery {
  return {
    stylistId: crypto.randomUUID(),
    ...overrides,
  };
}

export function createListServiceEmployeesQuery(
  overrides: Partial<ListServiceEmployeesQuery> = {},
): ListServiceEmployeesQuery {
  return {
    serviceId: crypto.randomUUID(),
    ...overrides,
  };
}
