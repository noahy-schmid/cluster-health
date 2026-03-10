"use server";

import {
  ListServiceDefinitionsUseCase,
  ListServiceDefinitionsUseCaseLayer,
  GetServiceDefinitionUseCase,
  GetServiceDefinitionUseCaseLayer,
  CreateCustomServiceUseCase,
  CreateCustomServiceUseCaseLayer,
  CreateSimpleServiceUseCase,
  CreateSimpleServiceUseCaseLayer,
  CreateColorationServiceUseCase,
  CreateColorationServiceUseCaseLayer,
  UpdateCustomServiceUseCase,
  UpdateCustomServiceUseCaseLayer,
  DeleteServiceDefinitionUseCase,
  DeleteServiceDefinitionUseCaseLayer,
  ListResourcesUseCase,
  ListResourcesUseCaseLayer,
  ListServiceEmployeesUseCase,
  ListServiceEmployeesUseCaseLayer,
  ListEmployeeServicesUseCase,
  ListEmployeeServicesUseCaseLayer,
  AssignEmployeeToServiceUseCase,
  AssignEmployeeToServiceUseCaseLayer,
  UnassignEmployeeFromServiceUseCase,
  UnassignEmployeeFromServiceUseCaseLayer,
} from "@repo/salon-domain";
import type {
  ServiceDefinition,
  Resource,
  ServiceEmployeeItem,
  EmployeeServiceItem,
  CreateServicePhaseInput,
  EmployeeServiceAssignment,
} from "@repo/salon-domain";
import { ServiceGuard } from "@/api/guards/service.guard";
import { EmployeeGuard } from "@/api/guards/employee.guard";
import { SalonAccessGuard } from "@/api/guards/salon.guard";
import { Effect, Layer } from "effect";

// ─── Server Actions ──────────────────────────────────────────

/**
 * Fetches all service definitions for a given salon.
 */
export async function fetchServiceDefinitions(
  salonId: string,
): Promise<
  | { success: true; data: ServiceDefinition[] }
  | { success: false; error: string }
> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) {
    return { success: false, error: access.error };
  }

  const program = Effect.gen(function* () {
    const useCase = yield* ListServiceDefinitionsUseCase;
    const services = yield* useCase.execute({ salonId });
    return { success: true as const, data: services };
  }).pipe(
    Effect.catchTag("InternalError", (error) =>
      Effect.succeed({ success: false as const, error: error.message }),
    ),
    Effect.provide(ListServiceDefinitionsUseCaseLayer),
  );

  return Effect.runPromise(program);
}

/**
 * Fetches a single service definition by ID.
 * Verifies service ownership via serviceId.
 */
export async function fetchServiceDefinition(
  serviceId: string,
): Promise<
  { success: true; data: ServiceDefinition } | { success: false; error: string }
> {
  const access = await ServiceGuard.canAccessService(serviceId);
  if (!access.success) {
    return { success: false, error: access.error };
  }

  const program = Effect.gen(function* () {
    const useCase = yield* GetServiceDefinitionUseCase;
    const service = yield* useCase.execute({ serviceId });
    return { success: true as const, data: service };
  }).pipe(
    Effect.catchTags({
      NotFoundError: () =>
        Effect.succeed({
          success: false as const,
          error: "Dienstleistung nicht gefunden",
        }),
      InternalError: (error) =>
        Effect.succeed({ success: false as const, error: error.message }),
    }),
    Effect.provide(GetServiceDefinitionUseCaseLayer),
  );

  return Effect.runPromise(program);
}

/**
 * Creates a simple service (single phase with employee + seat).
 */
export async function createSimpleService(input: {
  salonId: string;
  name: string;
  description: string;
  priceInCents: number;
  durationMinutes: number;
}): Promise<
  { success: true; data: ServiceDefinition } | { success: false; error: string }
> {
  const guard = await SalonAccessGuard.canAccessSalon(input.salonId);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const program = Effect.gen(function* () {
    const useCase = yield* CreateSimpleServiceUseCase;
    const service = yield* useCase.execute({
      salonId: input.salonId,
      name: input.name,
      description: input.description,
      priceInCents: input.priceInCents,
      durationMinutes: input.durationMinutes,
    });
    return { success: true as const, data: service };
  }).pipe(
    Effect.catchTags({
      ValidationError: (error) =>
        Effect.succeed({ success: false as const, error: error.message }),
      NotFoundError: () =>
        Effect.succeed({
          success: false as const,
          error: "Salon nicht gefunden",
        }),
      InternalError: (error) =>
        Effect.succeed({ success: false as const, error: error.message }),
      ResourceMissingError: (error) =>
        Effect.succeed({
          success: false as const,
          error: `Ressource "${error.resourceSlug}" fehlt im Salon`,
        }),
    }),
    Effect.provide(CreateSimpleServiceUseCaseLayer),
  );

  return Effect.runPromise(program);
}

/**
 * Creates a coloration service (3 phases: application, processing, finishing).
 */
export async function createColorationService(input: {
  salonId: string;
  name: string;
  description: string;
  priceInCents: number;
  applicationDurationMinutes: number;
  processingDurationMinutes: number;
  finishingDurationMinutes: number;
}): Promise<
  { success: true; data: ServiceDefinition } | { success: false; error: string }
> {
  const guard = await SalonAccessGuard.canAccessSalon(input.salonId);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const program = Effect.gen(function* () {
    const useCase = yield* CreateColorationServiceUseCase;
    const service = yield* useCase.execute({
      salonId: input.salonId,
      name: input.name,
      description: input.description,
      priceInCents: input.priceInCents,
      applicationDurationMinutes: input.applicationDurationMinutes,
      processingDurationMinutes: input.processingDurationMinutes,
      finishingDurationMinutes: input.finishingDurationMinutes,
    });
    return { success: true as const, data: service };
  }).pipe(
    Effect.catchTags({
      ValidationError: (error) =>
        Effect.succeed({ success: false as const, error: error.message }),
      NotFoundError: () =>
        Effect.succeed({
          success: false as const,
          error: "Salon nicht gefunden",
        }),
      InternalError: (error) =>
        Effect.succeed({ success: false as const, error: error.message }),
      ResourceMissingError: (error) =>
        Effect.succeed({
          success: false as const,
          error: `Ressource "${error.resourceSlug}" fehlt im Salon`,
        }),
    }),
    Effect.provide(CreateColorationServiceUseCaseLayer),
  );

  return Effect.runPromise(program);
}

/**
 * Creates a custom service with user-defined phases.
 */
export async function createCustomService(input: {
  salonId: string;
  name: string;
  description: string;
  priceInCents: number;
  phases: CreateServicePhaseInput[];
}): Promise<
  { success: true; data: ServiceDefinition } | { success: false; error: string }
> {
  const guard = await SalonAccessGuard.canAccessSalon(input.salonId);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const program = Effect.gen(function* () {
    const useCase = yield* CreateCustomServiceUseCase;
    const service = yield* useCase.execute({
      salonId: input.salonId,
      name: input.name,
      description: input.description,
      priceInCents: input.priceInCents,
      phases: input.phases,
    });
    return { success: true as const, data: service };
  }).pipe(
    Effect.catchTags({
      ValidationError: (error) =>
        Effect.succeed({ success: false as const, error: error.message }),
      NotFoundError: () =>
        Effect.succeed({
          success: false as const,
          error: "Salon nicht gefunden",
        }),
      InternalError: (error) =>
        Effect.succeed({ success: false as const, error: error.message }),
      ResourceMissingError: (error) =>
        Effect.succeed({
          success: false as const,
          error: `Ressource "${error.resourceSlug}" fehlt im Salon`,
        }),
    }),
    Effect.provide(CreateCustomServiceUseCaseLayer),
  );

  return Effect.runPromise(program);
}

/**
 * Updates an existing service definition.
 * Verifies service ownership via serviceId (not client-provided salonId).
 */
export async function updateServiceDefinition(
  serviceId: string,
  input: {
    name: string;
    description: string;
    priceInCents: number;
    phases: CreateServicePhaseInput[];
  },
): Promise<
  { success: true; data: ServiceDefinition } | { success: false; error: string }
> {
  const guard = await ServiceGuard.canEditService(serviceId);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const program = Effect.gen(function* () {
    const useCase = yield* UpdateCustomServiceUseCase;
    const service = yield* useCase.execute({
      serviceId,
      name: input.name,
      description: input.description,
      priceInCents: input.priceInCents,
      phases: input.phases,
    });
    return { success: true as const, data: service };
  }).pipe(
    Effect.catchTags({
      ValidationError: (error) =>
        Effect.succeed({ success: false as const, error: error.message }),
      NotFoundError: () =>
        Effect.succeed({
          success: false as const,
          error: "Dienstleistung nicht gefunden",
        }),
      InternalError: (error) =>
        Effect.succeed({ success: false as const, error: error.message }),
      ResourceMissingError: (error) =>
        Effect.succeed({
          success: false as const,
          error: `Ressource "${error.resourceSlug}" fehlt im Salon`,
        }),
    }),
    Effect.provide(UpdateCustomServiceUseCaseLayer),
  );

  return Effect.runPromise(program);
}

/**
 * Deletes a service definition (soft delete).
 * Verifies service ownership via serviceId.
 */
export async function deleteServiceDefinition(
  serviceId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const guard = await ServiceGuard.canEditService(serviceId);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const program = Effect.gen(function* () {
    const useCase = yield* DeleteServiceDefinitionUseCase;
    yield* useCase.execute({ serviceId });
    return { success: true as const };
  }).pipe(
    Effect.catchTags({
      NotFoundError: () =>
        Effect.succeed({
          success: false as const,
          error: "Dienstleistung nicht gefunden",
        }),
      InternalError: (error) =>
        Effect.succeed({ success: false as const, error: error.message }),
    }),
    Effect.provide(DeleteServiceDefinitionUseCaseLayer),
  );

  return Effect.runPromise(program);
}

/**
 * Fetches all available salon resources.
 */
export async function fetchSalonResources(
  salonId: string,
): Promise<
  { success: true; data: Resource[] } | { success: false; error: string }
> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) {
    return { success: false, error: access.error };
  }

  const program = Effect.gen(function* () {
    const useCase = yield* ListResourcesUseCase;
    const resources = yield* useCase.execute({ salonId });
    return { success: true as const, data: resources };
  }).pipe(
    Effect.catchTag("InternalError", (error) =>
      Effect.succeed({ success: false as const, error: error.message }),
    ),
    Effect.provide(ListResourcesUseCaseLayer),
  );

  return Effect.runPromise(program);
}

/**
 * Fetches all stylists assigned to a specific service.
 * Verifies service ownership via serviceId.
 */
export async function fetchStylistsForService(
  serviceId: string,
): Promise<
  | { success: true; data: ServiceEmployeeItem[] }
  | { success: false; error: string }
> {
  const access = await ServiceGuard.canAccessService(serviceId);
  if (!access.success) {
    return { success: false, error: access.error };
  }

  const program = Effect.gen(function* () {
    const useCase = yield* ListServiceEmployeesUseCase;
    const employees = yield* useCase.execute({ serviceId });
    return { success: true as const, data: employees };
  }).pipe(
    Effect.catchTag("InternalError", (error) =>
      Effect.succeed({ success: false as const, error: error.message }),
    ),
    Effect.provide(ListServiceEmployeesUseCaseLayer),
  );

  return Effect.runPromise(program);
}

/**
 * Assigns a stylist to a service.
 * Requires canEditEmployee guard.
 * Verifies service ownership via serviceId.
 */
export async function assignStylistToService(
  stylistId: string,
  serviceId: string,
): Promise<
  | { success: true; data: EmployeeServiceAssignment }
  | { success: false; error: string }
> {
  const serviceAccess = await ServiceGuard.canAccessService(serviceId);
  if (!serviceAccess.success) {
    return { success: false, error: serviceAccess.error };
  }

  const guard = await EmployeeGuard.canEditEmployee(serviceAccess.salonId);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const program = Effect.gen(function* () {
    const result = yield* AssignEmployeeToServiceUseCase.execute({
      stylistId,
      serviceId,
    });
    return { success: true as const, data: result };
  }).pipe(
    Effect.catchTags({
      NotFoundError: () =>
        Effect.succeed({
          success: false as const,
          error: "Stylist oder Dienstleistung nicht gefunden",
        }),
      ConflictError: () =>
        Effect.succeed({
          success: false as const,
          error: "Stylist ist bereits dieser Dienstleistung zugewiesen",
        }),
      ValidationError: (error) =>
        Effect.succeed({ success: false as const, error: error.message }),
      InternalError: (error) =>
        Effect.succeed({ success: false as const, error: error.message }),
    }),
    Effect.provide(
      Layer.mergeAll(
        AssignEmployeeToServiceUseCaseLayer,
        ListServiceEmployeesUseCaseLayer,
      ),
    ),
  );

  return Effect.runPromise(program);
}

/**
 * Unassigns a stylist from a service.
 * Verifies service ownership via serviceId.
 */
export async function unassignStylistFromService(
  stylistId: string,
  serviceId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const serviceAccess = await ServiceGuard.canAccessService(serviceId);
  if (!serviceAccess.success) {
    return { success: false, error: serviceAccess.error };
  }

  const guard = await EmployeeGuard.canEditEmployee(serviceAccess.salonId);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const program = Effect.gen(function* () {
    const useCase = yield* UnassignEmployeeFromServiceUseCase;
    yield* useCase.execute({ stylistId, serviceId });
    return { success: true as const };
  }).pipe(
    Effect.catchTags({
      NotFoundError: () =>
        Effect.succeed({
          success: false as const,
          error: "Zuweisung nicht gefunden",
        }),
      InternalError: (error) =>
        Effect.succeed({ success: false as const, error: error.message }),
    }),
    Effect.provide(UnassignEmployeeFromServiceUseCaseLayer),
  );

  return Effect.runPromise(program);
}

/**
 * Fetches all services assigned to a specific stylist.
 */
export async function fetchServicesForStylist(
  salonId: string,
  stylistId: string,
): Promise<
  | { success: true; data: EmployeeServiceItem[] }
  | { success: false; error: string }
> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) {
    return { success: false, error: access.error };
  }

  const program = Effect.gen(function* () {
    const useCase = yield* ListEmployeeServicesUseCase;
    const services = yield* useCase.execute({ stylistId });
    return { success: true as const, data: services };
  }).pipe(
    Effect.catchTag("InternalError", (error) =>
      Effect.succeed({ success: false as const, error: error.message }),
    ),
    Effect.provide(ListEmployeeServicesUseCaseLayer),
  );

  return Effect.runPromise(program);
}
