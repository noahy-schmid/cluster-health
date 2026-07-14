"use client";

import { AVAILABLE_WIDGET_TYPES, useDashboardState } from "./dashboard.state";
import { DashboardWidgetGrid } from "./DashboardWidgetGrid.component";
import { StylistSelector } from "./StylistSelector.component";
import type { StylistDto } from "./stylists/stylist.dto";

interface SalonDashboardClientProps {
  salonId: string;
  stylists: StylistDto[];
}

export function SalonDashboardClient({
  salonId,
  stylists,
}: SalonDashboardClientProps) {
  const {
    state,
    selectStylist,
    addWidget,
    removeWidget,
    reorderWidgets,
    toggleAddWidget,
  } = useDashboardState(salonId);

  return (
    <div className="space-y-lg">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-md">
        <div>
          <h1 className="text-2xl font-bold text-fg-strong">Dashboard</h1>
          <p className="mt-1 text-sm text-fg-muted">
            Willkommen zurück! Hier siehst du, was heute in deinem Salon
            passiert.
          </p>
        </div>

        <StylistSelector
          stylists={stylists}
          selectedStylistId={state.selectedStylistId}
          onSelect={selectStylist}
        />
      </div>

      {/* Widget grid */}
      <DashboardWidgetGrid
        widgets={state.widgets}
        availableTypes={AVAILABLE_WIDGET_TYPES}
        isAddWidgetOpen={state.isAddWidgetOpen}
        onAdd={addWidget}
        onRemove={removeWidget}
        onReorder={reorderWidgets}
        onToggleAddWidget={toggleAddWidget}
      />
    </div>
  );
}
