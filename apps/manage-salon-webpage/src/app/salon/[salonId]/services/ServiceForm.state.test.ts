import { describe, it, expect } from "vitest";
import { serviceFormReducer, type ServiceFormState } from "./ServiceForm.state";
import type { ServicePhase, SalonResource } from "@/lib/types/service-types";

function createInitialState(
  overrides?: Partial<ServiceFormState>,
): ServiceFormState {
  return {
    name: "",
    description: "",
    priceInCents: 0,
    phases: [],
    isSaving: false,
    error: undefined,
    ...overrides,
  };
}

function createPhase(overrides?: Partial<ServicePhase>): ServicePhase {
  return {
    id: "phase-1",
    name: "Test Phase",
    durationMinutes: 15,
    requiresEmployee: true,
    requiredResources: [],
    order: 0,
    ...overrides,
  };
}

describe("serviceFormReducer", () => {
  describe("SET_NAME", () => {
    it("should update the name", () => {
      const state = createInitialState();
      const result = serviceFormReducer(state, {
        type: "SET_NAME",
        payload: "Haarschnitt",
      });
      expect(result.name).toBe("Haarschnitt");
    });
  });

  describe("SET_DESCRIPTION", () => {
    it("should update the description", () => {
      const state = createInitialState();
      const result = serviceFormReducer(state, {
        type: "SET_DESCRIPTION",
        payload: "Ein toller Haarschnitt",
      });
      expect(result.description).toBe("Ein toller Haarschnitt");
    });
  });

  describe("SET_PRICE", () => {
    it("should update the price", () => {
      const state = createInitialState();
      const result = serviceFormReducer(state, {
        type: "SET_PRICE",
        payload: 4500,
      });
      expect(result.priceInCents).toBe(4500);
    });
  });

  describe("ADD_PHASE", () => {
    it("should add a new phase with correct order", () => {
      const state = createInitialState();
      const result = serviceFormReducer(state, { type: "ADD_PHASE" });
      expect(result.phases).toHaveLength(1);
      expect(result.phases[0].order).toBe(0);
      expect(result.phases[0].durationMinutes).toBe(15);
      expect(result.phases[0].requiresEmployee).toBe(true);
      expect(result.phases[0].requiredResources).toEqual([]);
    });

    it("should add phases with incrementing order", () => {
      let state = createInitialState();
      state = serviceFormReducer(state, { type: "ADD_PHASE" });
      state = serviceFormReducer(state, { type: "ADD_PHASE" });
      expect(state.phases).toHaveLength(2);
      expect(state.phases[0].order).toBe(0);
      expect(state.phases[1].order).toBe(1);
    });
  });

  describe("REMOVE_PHASE", () => {
    it("should remove a phase by id", () => {
      const state = createInitialState({
        phases: [
          createPhase({ id: "p1", order: 0 }),
          createPhase({ id: "p2", order: 1 }),
          createPhase({ id: "p3", order: 2 }),
        ],
      });
      const result = serviceFormReducer(state, {
        type: "REMOVE_PHASE",
        payload: "p2",
      });
      expect(result.phases).toHaveLength(2);
      expect(result.phases.map((p) => p.id)).toEqual(["p1", "p3"]);
    });

    it("should recalculate order after removal", () => {
      const state = createInitialState({
        phases: [
          createPhase({ id: "p1", order: 0 }),
          createPhase({ id: "p2", order: 1 }),
          createPhase({ id: "p3", order: 2 }),
        ],
      });
      const result = serviceFormReducer(state, {
        type: "REMOVE_PHASE",
        payload: "p1",
      });
      expect(result.phases[0].order).toBe(0);
      expect(result.phases[1].order).toBe(1);
    });
  });

  describe("UPDATE_PHASE", () => {
    it("should update phase name", () => {
      const state = createInitialState({
        phases: [createPhase({ id: "p1" })],
      });
      const result = serviceFormReducer(state, {
        type: "UPDATE_PHASE",
        payload: { phaseId: "p1", updates: { name: "Waschen" } },
      });
      expect(result.phases[0].name).toBe("Waschen");
    });

    it("should not affect other phases", () => {
      const state = createInitialState({
        phases: [
          createPhase({ id: "p1", name: "Phase 1" }),
          createPhase({ id: "p2", name: "Phase 2" }),
        ],
      });
      const result = serviceFormReducer(state, {
        type: "UPDATE_PHASE",
        payload: { phaseId: "p1", updates: { name: "Updated" } },
      });
      expect(result.phases[1].name).toBe("Phase 2");
    });

    it("should update phase duration", () => {
      const state = createInitialState({
        phases: [createPhase({ id: "p1", durationMinutes: 15 })],
      });
      const result = serviceFormReducer(state, {
        type: "UPDATE_PHASE",
        payload: { phaseId: "p1", updates: { durationMinutes: 30 } },
      });
      expect(result.phases[0].durationMinutes).toBe(30);
    });

    it("should toggle requiresEmployee", () => {
      const state = createInitialState({
        phases: [createPhase({ id: "p1", requiresEmployee: true })],
      });
      const result = serviceFormReducer(state, {
        type: "UPDATE_PHASE",
        payload: { phaseId: "p1", updates: { requiresEmployee: false } },
      });
      expect(result.phases[0].requiresEmployee).toBe(false);
    });

    it("should update multiple properties at once", () => {
      const state = createInitialState({
        phases: [createPhase({ id: "p1" })],
      });
      const result = serviceFormReducer(state, {
        type: "UPDATE_PHASE",
        payload: {
          phaseId: "p1",
          updates: { name: "New Name", durationMinutes: 45 },
        },
      });
      expect(result.phases[0].name).toBe("New Name");
      expect(result.phases[0].durationMinutes).toBe(45);
    });
  });

  describe("ADD_PHASE_RESOURCE", () => {
    it("should add a resource to a phase", () => {
      const state = createInitialState({
        phases: [createPhase({ id: "p1" })],
      });
      const resource: SalonResource = {
        id: "r1",
        salonId: "s1",
        name: "Stuhl",
      };
      const result = serviceFormReducer(state, {
        type: "ADD_PHASE_RESOURCE",
        payload: { phaseId: "p1", resource },
      });
      expect(result.phases[0].requiredResources).toHaveLength(1);
      expect(result.phases[0].requiredResources[0].resourceId).toBe("r1");
      expect(result.phases[0].requiredResources[0].resourceName).toBe("Stuhl");
    });

    it("should not add duplicate resources", () => {
      const state = createInitialState({
        phases: [
          createPhase({
            id: "p1",
            requiredResources: [{ resourceId: "r1", resourceName: "Stuhl" }],
          }),
        ],
      });
      const resource: SalonResource = {
        id: "r1",
        salonId: "s1",
        name: "Stuhl",
      };
      const result = serviceFormReducer(state, {
        type: "ADD_PHASE_RESOURCE",
        payload: { phaseId: "p1", resource },
      });
      expect(result.phases[0].requiredResources).toHaveLength(1);
    });
  });

  describe("REMOVE_PHASE_RESOURCE", () => {
    it("should remove a resource from a phase", () => {
      const state = createInitialState({
        phases: [
          createPhase({
            id: "p1",
            requiredResources: [
              { resourceId: "r1", resourceName: "Stuhl" },
              { resourceId: "r2", resourceName: "Waschbecken" },
            ],
          }),
        ],
      });
      const result = serviceFormReducer(state, {
        type: "REMOVE_PHASE_RESOURCE",
        payload: { phaseId: "p1", resourceId: "r1" },
      });
      expect(result.phases[0].requiredResources).toHaveLength(1);
      expect(result.phases[0].requiredResources[0].resourceId).toBe("r2");
    });
  });

  describe("REORDER_PHASES", () => {
    it("should reorder phases and update order indices", () => {
      const p1 = createPhase({ id: "p1", name: "First", order: 0 });
      const p2 = createPhase({ id: "p2", name: "Second", order: 1 });
      const p3 = createPhase({ id: "p3", name: "Third", order: 2 });

      const state = createInitialState({ phases: [p1, p2, p3] });
      const result = serviceFormReducer(state, {
        type: "REORDER_PHASES",
        payload: [p3, p1, p2],
      });

      expect(result.phases[0].id).toBe("p3");
      expect(result.phases[0].order).toBe(0);
      expect(result.phases[1].id).toBe("p1");
      expect(result.phases[1].order).toBe(1);
      expect(result.phases[2].id).toBe("p2");
      expect(result.phases[2].order).toBe(2);
    });
  });

  describe("SET_SAVING", () => {
    it("should set saving state", () => {
      const state = createInitialState();
      const result = serviceFormReducer(state, {
        type: "SET_SAVING",
        payload: true,
      });
      expect(result.isSaving).toBe(true);
    });
  });

  describe("SET_ERROR", () => {
    it("should set error message", () => {
      const state = createInitialState();
      const result = serviceFormReducer(state, {
        type: "SET_ERROR",
        payload: "Etwas ist schiefgelaufen",
      });
      expect(result.error).toBe("Etwas ist schiefgelaufen");
    });
  });

  describe("CLEAR_ERROR", () => {
    it("should clear error message", () => {
      const state = createInitialState({ error: "Some error" });
      const result = serviceFormReducer(state, { type: "CLEAR_ERROR" });
      expect(result.error).toBeUndefined();
    });
  });

  describe("complex scenarios", () => {
    it("should handle a complete service creation flow", () => {
      let state = createInitialState();

      // Set name and description
      state = serviceFormReducer(state, {
        type: "SET_NAME",
        payload: "Haarschnitt Damen",
      });
      state = serviceFormReducer(state, {
        type: "SET_DESCRIPTION",
        payload: "Klassischer Damen-Haarschnitt",
      });

      // Add two phases
      state = serviceFormReducer(state, { type: "ADD_PHASE" });
      state = serviceFormReducer(state, { type: "ADD_PHASE" });

      const phase1Id = state.phases[0].id;
      const phase2Id = state.phases[1].id;

      // Configure first phase
      state = serviceFormReducer(state, {
        type: "UPDATE_PHASE",
        payload: { phaseId: phase1Id, updates: { name: "Waschen" } },
      });
      state = serviceFormReducer(state, {
        type: "UPDATE_PHASE",
        payload: {
          phaseId: phase1Id,
          updates: { durationMinutes: 10 },
        },
      });

      // Configure second phase
      state = serviceFormReducer(state, {
        type: "UPDATE_PHASE",
        payload: { phaseId: phase2Id, updates: { name: "Schneiden" } },
      });
      state = serviceFormReducer(state, {
        type: "UPDATE_PHASE",
        payload: {
          phaseId: phase2Id,
          updates: { durationMinutes: 30 },
        },
      });

      // Add resource to first phase
      state = serviceFormReducer(state, {
        type: "ADD_PHASE_RESOURCE",
        payload: {
          phaseId: phase1Id,
          resource: { id: "r1", salonId: "s1", name: "Waschbecken" },
        },
      });

      // Verify final state
      expect(state.name).toBe("Haarschnitt Damen");
      expect(state.description).toBe("Klassischer Damen-Haarschnitt");
      expect(state.phases).toHaveLength(2);
      expect(state.phases[0].name).toBe("Waschen");
      expect(state.phases[0].durationMinutes).toBe(10);
      expect(state.phases[0].requiredResources).toHaveLength(1);
      expect(state.phases[1].name).toBe("Schneiden");
      expect(state.phases[1].durationMinutes).toBe(30);
    });
  });
});
