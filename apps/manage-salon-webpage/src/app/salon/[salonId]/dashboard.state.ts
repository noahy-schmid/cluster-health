"use client";

import { useReducer, useEffect } from "react";

export type WidgetType =
  | "appointments"
  | "clients"
  | "revenue"
  | "utilization"
  | "upcoming"
  | "quick-actions";

export type WidgetWidth = "narrow" | "medium" | "wide";

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  width: WidgetWidth;
}

export interface AvailableWidgetDef {
  type: WidgetType;
  label: string;
  width: WidgetWidth;
}

export const AVAILABLE_WIDGET_TYPES: AvailableWidgetDef[] = [
  { type: "appointments", label: "Heutige Termine", width: "narrow" },
  { type: "clients", label: "Gesamtkunden", width: "narrow" },
  { type: "revenue", label: "Umsatz (Heute)", width: "narrow" },
  { type: "utilization", label: "Auslastung", width: "narrow" },
  { type: "upcoming", label: "Kommende Termine", width: "medium" },
  { type: "quick-actions", label: "Schnellaktionen", width: "medium" },
];

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "w-appointments", type: "appointments", width: "narrow" },
  { id: "w-clients", type: "clients", width: "narrow" },
  { id: "w-revenue", type: "revenue", width: "narrow" },
  { id: "w-utilization", type: "utilization", width: "narrow" },
  { id: "w-upcoming", type: "upcoming", width: "medium" },
  { id: "w-quick-actions", type: "quick-actions", width: "medium" },
];

interface DashboardState {
  selectedStylistId: string | null;
  widgets: WidgetConfig[];
  isAddWidgetOpen: boolean;
}

type DashboardAction =
  | { type: "SELECT_STYLIST"; stylistId: string | null }
  | { type: "ADD_WIDGET"; widgetType: WidgetType }
  | { type: "REMOVE_WIDGET"; widgetId: string }
  | { type: "REORDER_WIDGETS"; widgets: WidgetConfig[] }
  | { type: "TOGGLE_ADD_WIDGET" }
  | {
      type: "LOAD_PERSISTED";
      state: Partial<Pick<DashboardState, "selectedStylistId" | "widgets">>;
    };

function reducer(
  state: DashboardState,
  action: DashboardAction,
): DashboardState {
  switch (action.type) {
    case "SELECT_STYLIST":
      return { ...state, selectedStylistId: action.stylistId };
    case "ADD_WIDGET": {
      const widgetDef = AVAILABLE_WIDGET_TYPES.find(
        (w) => w.type === action.widgetType,
      );
      if (!widgetDef) return state;
      const newWidget: WidgetConfig = {
        id: `w-${action.widgetType}-${Date.now()}`,
        type: action.widgetType,
        width: widgetDef.width,
      };
      return {
        ...state,
        widgets: [...state.widgets, newWidget],
        isAddWidgetOpen: false,
      };
    }
    case "REMOVE_WIDGET":
      return {
        ...state,
        widgets: state.widgets.filter((w) => w.id !== action.widgetId),
      };
    case "REORDER_WIDGETS":
      return { ...state, widgets: action.widgets };
    case "TOGGLE_ADD_WIDGET":
      return { ...state, isAddWidgetOpen: !state.isAddWidgetOpen };
    case "LOAD_PERSISTED":
      return { ...state, ...action.state };
    default:
      return state;
  }
}

interface PersistedDashboard {
  selectedStylistId: string | null;
  widgets: WidgetConfig[];
}

const STORAGE_KEY = "deinsalon-dashboard";

export function useDashboardState(salonId: string) {
  const storageKey = `${STORAGE_KEY}-${salonId}`;

  const [state, dispatch] = useReducer(reducer, {
    selectedStylistId: null,
    widgets: DEFAULT_WIDGETS,
    isAddWidgetOpen: false,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed: PersistedDashboard = JSON.parse(stored);
        dispatch({
          type: "LOAD_PERSISTED",
          state: {
            selectedStylistId: parsed.selectedStylistId ?? null,
            widgets: parsed.widgets?.length ? parsed.widgets : DEFAULT_WIDGETS,
          },
        });
      }
    } catch {
      // Ignore parse errors
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      const toSave: PersistedDashboard = {
        selectedStylistId: state.selectedStylistId,
        widgets: state.widgets,
      };
      localStorage.setItem(storageKey, JSON.stringify(toSave));
    } catch {
      // Ignore write errors
    }
  }, [storageKey, state.selectedStylistId, state.widgets]);

  return {
    state,
    selectStylist: (stylistId: string | null) =>
      dispatch({ type: "SELECT_STYLIST", stylistId }),
    addWidget: (widgetType: WidgetType) =>
      dispatch({ type: "ADD_WIDGET", widgetType }),
    removeWidget: (widgetId: string) =>
      dispatch({ type: "REMOVE_WIDGET", widgetId }),
    reorderWidgets: (widgets: WidgetConfig[]) =>
      dispatch({ type: "REORDER_WIDGETS", widgets }),
    toggleAddWidget: () => dispatch({ type: "TOGGLE_ADD_WIDGET" }),
  };
}
