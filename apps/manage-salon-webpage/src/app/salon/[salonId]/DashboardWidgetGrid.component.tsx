"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  BarChart3,
  Calendar,
  GripVertical,
  Plus,
  Trash2,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import type {
  WidgetConfig,
  WidgetType,
  AvailableWidgetDef,
} from "./dashboard.state";

/* ─── Mock data ────────────────────────────────────────────────────────────── */

const MOCK_APPOINTMENTS = [
  { time: "09:00", client: "Anna Müller", service: "Schnitt & Style" },
  { time: "10:30", client: "Jonas Weber", service: "Färbung" },
  { time: "14:00", client: "Lisa Schmidt", service: "Maniküre" },
];

/* ─── Widget rendering ─────────────────────────────────────────────────────── */

function WidgetContent({ type }: { type: WidgetType }) {
  switch (type) {
    case "appointments":
      return (
        <StatWidget
          icon={<Calendar className="w-5 h-5 text-fg-muted" />}
          title="Heutige Termine"
          value="12"
          change="+3 vs. gestern"
          positive
        />
      );
    case "clients":
      return (
        <StatWidget
          icon={<Users className="w-5 h-5 text-fg-muted" />}
          title="Gesamtkunden"
          value="247"
          change="+18 diesen Monat"
          positive
        />
      );
    case "revenue":
      return (
        <StatWidget
          icon={<TrendingUp className="w-5 h-5 text-fg-muted" />}
          title="Umsatz (Heute)"
          value="1.240 €"
          change="+12 % vs. Ø"
          positive
        />
      );
    case "utilization":
      return (
        <StatWidget
          icon={<BarChart3 className="w-5 h-5 text-fg-muted" />}
          title="Auslastung"
          value="78 %"
          change="-5 % vs. letzte Woche"
          positive={false}
        />
      );
    case "upcoming":
      return (
        <div>
          <p className="text-sm font-medium text-fg-muted mb-md">
            Kommende Termine
          </p>
          <div className="space-y-sm">
            {MOCK_APPOINTMENTS.map((a) => (
              <div key={a.time} className="flex items-start gap-sm">
                <span className="w-12 text-xs text-fg-muted shrink-0">
                  {a.time}
                </span>
                <div>
                  <p className="text-sm text-fg-strong">{a.client}</p>
                  <p className="text-xs text-fg-muted">{a.service}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "quick-actions":
      return (
        <div>
          <p className="text-sm font-medium text-fg-muted mb-md">
            Schnellaktionen
          </p>
          <div className="grid grid-cols-2 gap-sm">
            {["Neuer Termin", "Kunde anlegen", "Zeitplan", "Berichte"].map(
              (label) => (
                <button
                  key={label}
                  type="button"
                  className="p-sm rounded-md border border-border text-xs font-medium text-fg-normal hover:bg-bg-2 transition-colors text-center"
                >
                  <Zap className="w-3 h-3 inline mr-1 text-fg-muted" />
                  {label}
                </button>
              ),
            )}
          </div>
        </div>
      );
    default:
      return null;
  }
}

interface StatWidgetProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  positive: boolean;
}

function StatWidget({ icon, title, value, change, positive }: StatWidgetProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-md">
        <span className="text-sm font-medium text-fg-muted">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-fg-strong">{value}</div>
      <div
        className={`mt-1 text-xs ${positive ? "text-green-600" : "text-orange-600"}`}
      >
        {change}
      </div>
    </div>
  );
}

/* ─── Sortable widget item ─────────────────────────────────────────────────── */

interface SortableWidgetProps {
  widget: WidgetConfig;
  onRemove: (id: string) => void;
}

function SortableWidget({ widget, onRemove }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const colSpanClass =
    widget.width === "wide"
      ? "col-span-1 sm:col-span-2 lg:col-span-4"
      : widget.width === "medium"
        ? "col-span-1 sm:col-span-2 lg:col-span-2"
        : "col-span-1";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${colSpanClass} bg-bg-1 border border-border rounded-lg p-lg flex flex-col h-40`}
    >
      {/* Widget toolbar */}
      <div className="flex items-center justify-between mb-sm">
        <button
          type="button"
          aria-label="Widget verschieben"
          className="cursor-grab active:cursor-grabbing text-fg-muted hover:text-fg-normal touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <button
          type="button"
          aria-label="Widget entfernen"
          onClick={() => onRemove(widget.id)}
          className="text-fg-muted hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Widget body */}
      <div className="flex-1 overflow-hidden">
        <WidgetContent type={widget.type} />
      </div>
    </div>
  );
}

/* ─── Add widget panel ─────────────────────────────────────────────────────── */

interface AddWidgetPanelProps {
  availableTypes: AvailableWidgetDef[];
  onAdd: (type: WidgetType) => void;
  onClose: () => void;
}

function AddWidgetPanel({
  availableTypes,
  onAdd,
  onClose,
}: AddWidgetPanelProps) {
  return (
    <div className="border border-border rounded-lg bg-bg-1 p-lg">
      <div className="flex items-center justify-between mb-md">
        <p className="text-sm font-medium text-fg-strong">Widget hinzufügen</p>
        <button
          type="button"
          onClick={onClose}
          className="text-fg-muted hover:text-fg-normal transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-sm">
        {availableTypes.map((def) => (
          <button
            key={def.type}
            type="button"
            onClick={() => onAdd(def.type)}
            className="px-md py-sm rounded-md border border-border text-sm text-fg-normal hover:bg-bg-2 transition-colors"
          >
            {def.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Main grid component ──────────────────────────────────────────────────── */

interface DashboardWidgetGridProps {
  widgets: WidgetConfig[];
  availableTypes: AvailableWidgetDef[];
  isAddWidgetOpen: boolean;
  onAdd: (type: WidgetType) => void;
  onRemove: (id: string) => void;
  onReorder: (widgets: WidgetConfig[]) => void;
  onToggleAddWidget: () => void;
}

export function DashboardWidgetGrid({
  widgets,
  availableTypes,
  isAddWidgetOpen,
  onAdd,
  onRemove,
  onReorder,
  onToggleAddWidget,
}: DashboardWidgetGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);
      onReorder(arrayMove(widgets, oldIndex, newIndex));
    }
  }

  return (
    <div className="space-y-md">
      {/* Widget grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={widgets.map((w) => w.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md auto-rows-fr">
            {widgets.map((widget) => (
              <SortableWidget
                key={widget.id}
                widget={widget}
                onRemove={onRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add widget panel / button */}
      {isAddWidgetOpen ? (
        <AddWidgetPanel
          availableTypes={availableTypes}
          onAdd={onAdd}
          onClose={onToggleAddWidget}
        />
      ) : (
        <button
          type="button"
          onClick={onToggleAddWidget}
          className="flex items-center gap-sm text-sm text-fg-muted hover:text-fg-normal transition-colors"
        >
          <Plus className="w-4 h-4" />
          Widget hinzufügen
        </button>
      )}
    </div>
  );
}
