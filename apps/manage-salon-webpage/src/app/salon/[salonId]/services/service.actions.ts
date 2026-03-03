"use server";

import type {
  ServiceDefinition,
  CreateServiceDefinitionInput,
  UpdateServiceDefinitionInput,
  SalonResource,
  StylistServiceAssignment,
} from "@/lib/types/service-types";

// ─── Mock Data ───────────────────────────────────────────────

const EMPLOYEE_RESOURCE_ID = "resource-employee";

const mockResources: SalonResource[] = [
  { id: EMPLOYEE_RESOURCE_ID, salonId: "mock", name: "Mitarbeiter" },
  { id: "resource-seat", salonId: "mock", name: "Stuhl" },
  { id: "resource-wash-sink", salonId: "mock", name: "Waschbecken" },
  { id: "resource-heating-lamp", salonId: "mock", name: "Wärmehaube" },
];

const mockServices: ServiceDefinition[] = [
  {
    id: "service-1",
    salonId: "mock",
    name: "Haarschnitt Damen",
    description: "Klassischer Damen-Haarschnitt mit Waschen und Föhnen",
    phases: [
      {
        id: "phase-1-1",
        name: "Haare waschen",
        durationMinutes: 10,
        requiresEmployee: true,
        requiredResources: [
          { resourceId: "resource-wash-sink", resourceName: "Waschbecken" },
        ],
        order: 0,
      },
      {
        id: "phase-1-2",
        name: "Schneiden",
        durationMinutes: 30,
        requiresEmployee: true,
        requiredResources: [
          { resourceId: "resource-seat", resourceName: "Stuhl" },
        ],
        order: 1,
      },
      {
        id: "phase-1-3",
        name: "Föhnen & Styling",
        durationMinutes: 15,
        requiresEmployee: true,
        requiredResources: [
          { resourceId: "resource-seat", resourceName: "Stuhl" },
        ],
        order: 2,
      },
    ],
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: "service-2",
    salonId: "mock",
    name: "Coloration",
    description: "Professionelle Haarfärbung mit Pflege",
    phases: [
      {
        id: "phase-2-1",
        name: "Farbe auftragen",
        durationMinutes: 20,
        requiresEmployee: true,
        requiredResources: [
          { resourceId: "resource-seat", resourceName: "Stuhl" },
        ],
        order: 0,
      },
      {
        id: "phase-2-2",
        name: "Einwirkzeit",
        durationMinutes: 30,
        requiresEmployee: false,
        requiredResources: [
          {
            resourceId: "resource-heating-lamp",
            resourceName: "Wärmehaube",
          },
        ],
        order: 1,
      },
      {
        id: "phase-2-3",
        name: "Auswaschen",
        durationMinutes: 10,
        requiresEmployee: true,
        requiredResources: [
          { resourceId: "resource-wash-sink", resourceName: "Waschbecken" },
        ],
        order: 2,
      },
    ],
    createdAt: new Date("2025-02-10"),
    updatedAt: new Date("2025-02-10"),
  },
];

const mockAssignments: StylistServiceAssignment[] = [
  {
    stylistId: "stylist-1",
    stylistName: "Anna Müller",
    serviceId: "service-1",
    serviceName: "Haarschnitt Damen",
  },
  {
    stylistId: "stylist-1",
    stylistName: "Anna Müller",
    serviceId: "service-2",
    serviceName: "Coloration",
  },
];

// ─── Server Actions ──────────────────────────────────────────

/**
 * Fetches all service definitions for a given salon.
 */
export async function fetchServiceDefinitions(
  salonId: string,
): Promise<
  { success: true; data: ServiceDefinition[] } | { success: false; error: string }
> {
  void salonId;
  return { success: true, data: mockServices };
}

/**
 * Fetches a single service definition by ID.
 */
export async function fetchServiceDefinition(
  salonId: string,
  serviceId: string,
): Promise<
  { success: true; data: ServiceDefinition } | { success: false; error: string }
> {
  void salonId;
  const service = mockServices.find((s) => s.id === serviceId);
  if (!service) {
    return { success: false, error: "Dienstleistung nicht gefunden" };
  }
  return { success: true, data: service };
}

/**
 * Creates a new service definition.
 */
export async function createServiceDefinition(
  input: CreateServiceDefinitionInput,
): Promise<
  { success: true; data: ServiceDefinition } | { success: false; error: string }
> {
  const newService: ServiceDefinition = {
    id: `service-${Date.now()}`,
    salonId: input.salonId,
    name: input.name,
    description: input.description,
    phases: input.phases.map((p, idx) => ({
      ...p,
      id: `phase-${Date.now()}-${idx}`,
    })),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  return { success: true, data: newService };
}

/**
 * Updates an existing service definition.
 */
export async function updateServiceDefinition(
  salonId: string,
  serviceId: string,
  input: UpdateServiceDefinitionInput,
): Promise<
  { success: true; data: ServiceDefinition } | { success: false; error: string }
> {
  void salonId;
  const existing = mockServices.find((s) => s.id === serviceId);
  if (!existing) {
    return { success: false, error: "Dienstleistung nicht gefunden" };
  }
  const updated: ServiceDefinition = {
    ...existing,
    name: input.name,
    description: input.description,
    phases: input.phases.map((p, idx) => ({
      ...p,
      id: `phase-${Date.now()}-${idx}`,
    })),
    updatedAt: new Date(),
  };
  return { success: true, data: updated };
}

/**
 * Deletes a service definition.
 */
export async function deleteServiceDefinition(
  salonId: string,
  serviceId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  void salonId;
  const exists = mockServices.find((s) => s.id === serviceId);
  if (!exists) {
    return { success: false, error: "Dienstleistung nicht gefunden" };
  }
  return { success: true };
}

/**
 * Fetches all available salon resources.
 */
export async function fetchSalonResources(
  salonId: string,
): Promise<
  { success: true; data: SalonResource[] } | { success: false; error: string }
> {
  void salonId;
  return { success: true, data: mockResources };
}

/**
 * Fetches all stylists assigned to a specific service.
 */
export async function fetchStylistsForService(
  salonId: string,
  serviceId: string,
): Promise<
  | { success: true; data: StylistServiceAssignment[] }
  | { success: false; error: string }
> {
  void salonId;
  const assignments = mockAssignments.filter((a) => a.serviceId === serviceId);
  return { success: true, data: assignments };
}

/**
 * Fetches all services assigned to a specific stylist.
 */
export async function fetchServicesForStylist(
  salonId: string,
  stylistId: string,
): Promise<
  | { success: true; data: StylistServiceAssignment[] }
  | { success: false; error: string }
> {
  void salonId;
  const assignments = mockAssignments.filter((a) => a.stylistId === stylistId);
  return { success: true, data: assignments };
}

/**
 * Assigns a stylist to a service.
 */
export async function assignStylistToService(
  salonId: string,
  stylistId: string,
  serviceId: string,
): Promise<
  | { success: true; data: StylistServiceAssignment }
  | { success: false; error: string }
> {
  void salonId;
  const service = mockServices.find((s) => s.id === serviceId);
  return {
    success: true,
    data: {
      stylistId,
      stylistName: "Neuer Stylist",
      serviceId,
      serviceName: service?.name ?? "Unbekannt",
    },
  };
}

/**
 * Unassigns a stylist from a service.
 */
export async function unassignStylistFromService(
  salonId: string,
  stylistId: string,
  serviceId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  void salonId;
  void stylistId;
  void serviceId;
  return { success: true };
}
