import { useReducer, useCallback } from "react";
import type {
  ServicePhase,
  ResourceRequirement,
  SalonResource,
} from "@/lib/types/service-types";

// ─── State ───────────────────────────────────────────────────

export interface ServiceFormState {
  name: string;
  description: string;
  phases: ServicePhase[];
  isSaving: boolean;
  error: string | undefined;
}

// ─── Actions ─────────────────────────────────────────────────

type ServiceFormAction =
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_DESCRIPTION"; payload: string }
  | { type: "ADD_PHASE" }
  | { type: "REMOVE_PHASE"; payload: string }
  | { type: "UPDATE_PHASE_NAME"; payload: { phaseId: string; name: string } }
  | {
      type: "UPDATE_PHASE_DURATION";
      payload: { phaseId: string; durationMinutes: number };
    }
  | {
      type: "UPDATE_PHASE_REQUIRES_EMPLOYEE";
      payload: { phaseId: string; requiresEmployee: boolean };
    }
  | {
      type: "ADD_PHASE_RESOURCE";
      payload: { phaseId: string; resource: SalonResource };
    }
  | {
      type: "REMOVE_PHASE_RESOURCE";
      payload: { phaseId: string; resourceId: string };
    }
  | { type: "REORDER_PHASES"; payload: ServicePhase[] }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | undefined }
  | { type: "CLEAR_ERROR" };

// ─── Helpers ─────────────────────────────────────────────────

function createEmptyPhase(order: number): ServicePhase {
  return {
    id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: "",
    durationMinutes: 15,
    requiresEmployee: true,
    requiredResources: [],
    order,
  };
}

function updatePhase(
  phases: ServicePhase[],
  phaseId: string,
  updater: (phase: ServicePhase) => ServicePhase,
): ServicePhase[] {
  return phases.map((p) => (p.id === phaseId ? updater(p) : p));
}

// ─── Reducer ─────────────────────────────────────────────────

export function serviceFormReducer(
  state: ServiceFormState,
  action: ServiceFormAction,
): ServiceFormState {
  switch (action.type) {
    case "SET_NAME":
      return { ...state, name: action.payload };

    case "SET_DESCRIPTION":
      return { ...state, description: action.payload };

    case "ADD_PHASE":
      return {
        ...state,
        phases: [...state.phases, createEmptyPhase(state.phases.length)],
      };

    case "REMOVE_PHASE": {
      const filtered = state.phases
        .filter((p) => p.id !== action.payload)
        .map((p, idx) => ({ ...p, order: idx }));
      return { ...state, phases: filtered };
    }

    case "UPDATE_PHASE_NAME":
      return {
        ...state,
        phases: updatePhase(state.phases, action.payload.phaseId, (p) => ({
          ...p,
          name: action.payload.name,
        })),
      };

    case "UPDATE_PHASE_DURATION":
      return {
        ...state,
        phases: updatePhase(state.phases, action.payload.phaseId, (p) => ({
          ...p,
          durationMinutes: action.payload.durationMinutes,
        })),
      };

    case "UPDATE_PHASE_REQUIRES_EMPLOYEE":
      return {
        ...state,
        phases: updatePhase(state.phases, action.payload.phaseId, (p) => ({
          ...p,
          requiresEmployee: action.payload.requiresEmployee,
        })),
      };

    case "ADD_PHASE_RESOURCE":
      return {
        ...state,
        phases: updatePhase(state.phases, action.payload.phaseId, (p) => {
          if (
            p.requiredResources.some(
              (r) => r.resourceId === action.payload.resource.id,
            )
          ) {
            return p;
          }
          const newResource: ResourceRequirement = {
            resourceId: action.payload.resource.id,
            resourceName: action.payload.resource.name,
          };
          return {
            ...p,
            requiredResources: [...p.requiredResources, newResource],
          };
        }),
      };

    case "REMOVE_PHASE_RESOURCE":
      return {
        ...state,
        phases: updatePhase(state.phases, action.payload.phaseId, (p) => ({
          ...p,
          requiredResources: p.requiredResources.filter(
            (r) => r.resourceId !== action.payload.resourceId,
          ),
        })),
      };

    case "REORDER_PHASES":
      return {
        ...state,
        phases: action.payload.map((p, idx) => ({ ...p, order: idx })),
      };

    case "SET_SAVING":
      return { ...state, isSaving: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "CLEAR_ERROR":
      return { ...state, error: undefined };

    default:
      return state;
  }
}

// ─── Hook ────────────────────────────────────────────────────

export function useServiceFormState(initial?: {
  name?: string;
  description?: string;
  phases?: ServicePhase[];
}) {
  const [state, dispatch] = useReducer(serviceFormReducer, {
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    phases: initial?.phases ?? [],
    isSaving: false,
    error: undefined,
  });

  const setName = useCallback(
    (name: string) => dispatch({ type: "SET_NAME", payload: name }),
    [],
  );

  const setDescription = useCallback(
    (description: string) =>
      dispatch({ type: "SET_DESCRIPTION", payload: description }),
    [],
  );

  const addPhase = useCallback(
    () => dispatch({ type: "ADD_PHASE" }),
    [],
  );

  const removePhase = useCallback(
    (phaseId: string) =>
      dispatch({ type: "REMOVE_PHASE", payload: phaseId }),
    [],
  );

  const updatePhaseName = useCallback(
    (phaseId: string, name: string) =>
      dispatch({ type: "UPDATE_PHASE_NAME", payload: { phaseId, name } }),
    [],
  );

  const updatePhaseDuration = useCallback(
    (phaseId: string, durationMinutes: number) =>
      dispatch({
        type: "UPDATE_PHASE_DURATION",
        payload: { phaseId, durationMinutes },
      }),
    [],
  );

  const updatePhaseRequiresEmployee = useCallback(
    (phaseId: string, requiresEmployee: boolean) =>
      dispatch({
        type: "UPDATE_PHASE_REQUIRES_EMPLOYEE",
        payload: { phaseId, requiresEmployee },
      }),
    [],
  );

  const addPhaseResource = useCallback(
    (phaseId: string, resource: SalonResource) =>
      dispatch({
        type: "ADD_PHASE_RESOURCE",
        payload: { phaseId, resource },
      }),
    [],
  );

  const removePhaseResource = useCallback(
    (phaseId: string, resourceId: string) =>
      dispatch({
        type: "REMOVE_PHASE_RESOURCE",
        payload: { phaseId, resourceId },
      }),
    [],
  );

  const reorderPhases = useCallback(
    (phases: ServicePhase[]) =>
      dispatch({ type: "REORDER_PHASES", payload: phases }),
    [],
  );

  const setSaving = useCallback(
    (saving: boolean) =>
      dispatch({ type: "SET_SAVING", payload: saving }),
    [],
  );

  const setError = useCallback(
    (error: string | undefined) =>
      dispatch({ type: "SET_ERROR", payload: error }),
    [],
  );

  const clearError = useCallback(
    () => dispatch({ type: "CLEAR_ERROR" }),
    [],
  );

  return {
    state,
    setName,
    setDescription,
    addPhase,
    removePhase,
    updatePhaseName,
    updatePhaseDuration,
    updatePhaseRequiresEmployee,
    addPhaseResource,
    removePhaseResource,
    reorderPhases,
    setSaving,
    setError,
    clearError,
  };
}
