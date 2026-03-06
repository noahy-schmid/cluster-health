import { useReducer, useCallback } from "react";
import type { ServicePhase } from "@/lib/types/service-types";

// ─── State ───────────────────────────────────────────────────

export interface ServiceFormState {
  name: string;
  description: string;
  priceInCents: number;
  phases: ServicePhase[];
  isSaving: boolean;
  error: string | undefined;
}

// ─── Actions ─────────────────────────────────────────────────

type ServiceFormAction =
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_DESCRIPTION"; payload: string }
  | { type: "SET_PRICE"; payload: number }
  | { type: "ADD_PHASE" }
  | { type: "REMOVE_PHASE"; payload: string }
  | {
      type: "UPDATE_PHASE";
      payload: { phaseId: string; updates: Partial<ServicePhase> };
    }
  | { type: "REORDER_PHASES"; payload: ServicePhase[] }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | undefined }
  | { type: "CLEAR_ERROR" };

// ─── Helpers ─────────────────────────────────────────────────

function createEmptyPhase(order: number): ServicePhase {
  return {
    id: crypto.randomUUID(),
    name: "",
    durationMinutes: 15,
    requiresEmployee: true,
    requiredResources: [],
    order,
  };
}

function updatePhaseById(
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

    case "SET_PRICE":
      return { ...state, priceInCents: action.payload };

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

    case "UPDATE_PHASE":
      return {
        ...state,
        phases: updatePhaseById(state.phases, action.payload.phaseId, (p) => ({
          ...p,
          ...action.payload.updates,
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
  priceInCents?: number;
  phases?: ServicePhase[];
}) {
  const [state, dispatch] = useReducer(serviceFormReducer, {
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    priceInCents: initial?.priceInCents ?? 0,
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

  const setPrice = useCallback(
    (priceInCents: number) =>
      dispatch({ type: "SET_PRICE", payload: priceInCents }),
    [],
  );

  const addPhase = useCallback(() => dispatch({ type: "ADD_PHASE" }), []);

  const removePhase = useCallback(
    (phaseId: string) => dispatch({ type: "REMOVE_PHASE", payload: phaseId }),
    [],
  );

  const updatePhase = useCallback(
    (phaseId: string, updates: Partial<ServicePhase>) =>
      dispatch({ type: "UPDATE_PHASE", payload: { phaseId, updates } }),
    [],
  );

  const reorderPhases = useCallback(
    (phases: ServicePhase[]) =>
      dispatch({ type: "REORDER_PHASES", payload: phases }),
    [],
  );

  const setSaving = useCallback(
    (saving: boolean) => dispatch({ type: "SET_SAVING", payload: saving }),
    [],
  );

  const setError = useCallback(
    (error: string | undefined) =>
      dispatch({ type: "SET_ERROR", payload: error }),
    [],
  );

  const clearError = useCallback(() => dispatch({ type: "CLEAR_ERROR" }), []);

  return {
    state,
    setName,
    setDescription,
    setPrice,
    addPhase,
    removePhase,
    updatePhase,
    reorderPhases,
    setSaving,
    setError,
    clearError,
  };
}
