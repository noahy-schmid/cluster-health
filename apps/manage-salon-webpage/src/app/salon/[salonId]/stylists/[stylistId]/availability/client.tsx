"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import {
  Clock,
  AlertCircle,
  Check,
  X,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import BackButton from "@/components/BackButton";
import type {
  StylistAvailabilityDto,
  StylistAvailabilityExceptionDto,
} from "./availability.actions";
import {
  setStylistAvailability,
  deleteStylistAvailability,
  createStylistAvailabilityException,
  deleteStylistAvailabilityException,
} from "./availability.actions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EffectiveSchedule {
  isAvailable: boolean;
  startTime: string | null;
  endTime: string | null;
  source: "weekly" | "exception" | "default";
  exceptionId?: string;
}

interface EditFormState {
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

interface ApplyDialogState {
  dateStr: string;
  dayLabel: string;
  dayOfWeek: number;
  form: EditFormState;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DAYS_DE = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
];

function jsToIsoDay(jsDay: number) {
  return (jsDay + 6) % 7;
}

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

const INITIAL_DAYS = 28;
const LOAD_MORE_DAYS = 14;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface StylistAvailabilityClientProps {
  salonId: string;
  stylistId: string;
  stylistName: string;
  initialAvailability: StylistAvailabilityDto[];
  initialExceptions: StylistAvailabilityExceptionDto[];
}

export default function StylistAvailabilityClient({
  salonId,
  stylistId,
  stylistName,
  initialAvailability,
  initialExceptions,
}: StylistAvailabilityClientProps) {
  const [weeklyMap, setWeeklyMap] = useState<
    Map<number, StylistAvailabilityDto>
  >(() => new Map(initialAvailability.map((a) => [a.dayOfWeek, a])));

  const [exceptionMap, setExceptionMap] = useState<
    Map<string, StylistAvailabilityExceptionDto>
  >(() => new Map(initialExceptions.map((e) => [e.date, e])));

  const [startDate] = useState<Date>(() => today());
  const [loadedDays, setLoadedDays] = useState(INITIAL_DAYS);
  const [jumpDate, setJumpDate] = useState("");

  const [editingDateStr, setEditingDateStr] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({
    isAvailable: true,
    startTime: "09:00",
    endTime: "18:00",
  });
  const [applyDialog, setApplyDialog] = useState<ApplyDialogState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadMore = useCallback(() => {
    setLoadedDays((prev) => prev + LOAD_MORE_DAYS);
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  // ---------------------------------------------------------------------------
  // Derived helpers
  // ---------------------------------------------------------------------------

  function getEffective(date: Date): EffectiveSchedule {
    const ds = toDateStr(date);
    const ex = exceptionMap.get(ds);
    if (ex) {
      return {
        isAvailable: !ex.isAbsent,
        startTime: ex.startTime,
        endTime: ex.endTime,
        source: "exception",
        exceptionId: ex.id,
      };
    }
    const isoDay = jsToIsoDay(date.getDay());
    const weekly = weeklyMap.get(isoDay);
    if (weekly) {
      return {
        isAvailable: true,
        startTime: weekly.startTime,
        endTime: weekly.endTime,
        source: "weekly",
      };
    }
    return {
      isAvailable: false,
      startTime: null,
      endTime: null,
      source: "default",
    };
  }

  // ---------------------------------------------------------------------------
  // Interaction handlers
  // ---------------------------------------------------------------------------

  function openEdit(date: Date) {
    const ds = toDateStr(date);
    const effective = getEffective(date);
    setEditingDateStr(ds);
    setEditForm({
      isAvailable: effective.isAvailable,
      startTime: effective.startTime ?? "09:00",
      endTime: effective.endTime ?? "18:00",
    });
    setErrorMessage(null);
  }

  function closeEdit() {
    setEditingDateStr(null);
    setApplyDialog(null);
  }

  function requestApply(date: Date) {
    const isoDay = jsToIsoDay(date.getDay());
    setApplyDialog({
      dateStr: toDateStr(date),
      dayLabel: DAYS_DE[isoDay] ?? "",
      dayOfWeek: isoDay,
      form: editForm,
    });
  }

  function applyJustThisDay(dialog: ApplyDialogState) {
    setErrorMessage(null);
    startTransition(async () => {
      if (!dialog.form.isAvailable) {
        const result = await createStylistAvailabilityException(
          salonId,
          stylistId,
          dialog.dateStr,
          true,
          null,
          null,
          null,
        );
        if (!result.success) {
          setErrorMessage(result.error);
          return;
        }
        setExceptionMap((prev) => {
          const next = new Map(prev);
          next.set(dialog.dateStr, result.data);
          return next;
        });
      } else {
        const result = await createStylistAvailabilityException(
          salonId,
          stylistId,
          dialog.dateStr,
          false,
          dialog.form.startTime,
          dialog.form.endTime,
          null,
        );
        if (!result.success) {
          setErrorMessage(result.error);
          return;
        }
        setExceptionMap((prev) => {
          const next = new Map(prev);
          next.set(dialog.dateStr, result.data);
          return next;
        });
      }
      setApplyDialog(null);
      setEditingDateStr(null);
    });
  }

  function applyEveryWeekday(dialog: ApplyDialogState) {
    setErrorMessage(null);
    startTransition(async () => {
      if (!dialog.form.isAvailable) {
        const result = await deleteStylistAvailability(
          salonId,
          stylistId,
          dialog.dayOfWeek,
        );
        if (!result.success) {
          setErrorMessage(result.error);
          return;
        }
        setWeeklyMap((prev) => {
          const next = new Map(prev);
          next.delete(dialog.dayOfWeek);
          return next;
        });
      } else {
        const result = await setStylistAvailability(
          salonId,
          stylistId,
          dialog.dayOfWeek,
          dialog.form.startTime,
          dialog.form.endTime,
        );
        if (!result.success) {
          setErrorMessage(result.error);
          return;
        }
        setWeeklyMap((prev) => {
          const next = new Map(prev);
          next.set(dialog.dayOfWeek, result.data);
          return next;
        });
      }
      // Remove specific exception for this date
      const existingEx = exceptionMap.get(dialog.dateStr);
      if (existingEx) {
        const delResult = await deleteStylistAvailabilityException(
          salonId,
          existingEx.id,
        );
        if (delResult.success) {
          setExceptionMap((prev) => {
            const next = new Map(prev);
            next.delete(dialog.dateStr);
            return next;
          });
        }
      }
      setApplyDialog(null);
      setEditingDateStr(null);
    });
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const resolvedStart = jumpDate ? new Date(jumpDate + "T00:00:00") : startDate;
  const dates = Array.from({ length: loadedDays }, (_, i) =>
    addDays(resolvedStart, i),
  );

  return (
    <div className="max-w-2xl mx-auto">
      <BackButton text="Zurück zum Stylisten" />
      <PageHeader
        title={`Verfügbarkeit – ${stylistName}`}
        subtitle="Tippe auf einen Tag um die Zeiten zu bearbeiten"
      />

      {errorMessage && (
        <div className="mb-lg flex items-center gap-sm p-md rounded-md bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm">{errorMessage}</span>
        </div>
      )}

      {/* Date jump */}
      <div className="mb-md flex items-center gap-sm">
        <CalendarDays className="w-4 h-4 text-fg-muted shrink-0" />
        <input
          type="date"
          value={jumpDate}
          onChange={(e) => {
            setJumpDate(e.target.value);
            setLoadedDays(INITIAL_DAYS);
            setEditingDateStr(null);
            setApplyDialog(null);
          }}
          className="rounded-md border border-border bg-bg-1 px-sm py-xs text-sm text-fg-normal focus:border-primary-400 focus:outline-none"
        />
        {jumpDate && (
          <button
            onClick={() => {
              setJumpDate("");
              setLoadedDays(INITIAL_DAYS);
            }}
            className="text-xs text-fg-muted hover:text-fg-normal"
          >
            Zurück zu heute
          </button>
        )}
      </div>

      {/* Apply dialog */}
      {applyDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-md">
          <div className="w-full max-w-sm rounded-xl bg-bg-0 border border-border shadow-lg p-lg">
            <h3 className="font-focus font-semibold text-fg-strong mb-sm">
              Änderung anwenden auf…
            </h3>
            <p className="text-sm text-fg-muted mb-lg">
              {applyDialog.form.isAvailable
                ? `Verfügbar ${applyDialog.form.startTime} – ${applyDialog.form.endTime}`
                : "Abwesend"}
            </p>

            <div className="flex flex-col gap-sm">
              <button
                disabled={isPending}
                onClick={() => applyJustThisDay(applyDialog)}
                className="w-full rounded-lg border border-border bg-bg-1 px-md py-sm text-left text-sm hover:border-primary-400 hover:bg-bg-2 disabled:opacity-50 transition-fast"
              >
                <div className="font-medium text-fg-strong">Nur diesen Tag</div>
                <div className="text-fg-muted text-xs">
                  {new Date(
                    applyDialog.dateStr + "T00:00:00",
                  ).toLocaleDateString("de-DE", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </div>
              </button>

              <button
                disabled={isPending}
                onClick={() => applyEveryWeekday(applyDialog)}
                className="w-full rounded-lg border border-border bg-bg-1 px-md py-sm text-left text-sm hover:border-primary-400 hover:bg-bg-2 disabled:opacity-50 transition-fast"
              >
                <div className="font-medium text-fg-strong">
                  Jeden {applyDialog.dayLabel}
                </div>
                <div className="text-fg-muted text-xs">
                  Wöchentliche Wiederholung
                </div>
              </button>
            </div>

            <button
              onClick={() => setApplyDialog(null)}
              className="mt-md w-full text-center text-sm text-fg-muted hover:text-fg-normal"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Date list */}
      <div className="flex flex-col gap-xs" data-testid="availability-list">
        {dates.map((date) => {
          const ds = toDateStr(date);
          const effective = getEffective(date);
          const isEditing = editingDateStr === ds;

          return (
            <div
              key={ds}
              className={`rounded-lg border transition-fast ${
                isEditing
                  ? "border-primary-400 bg-bg-1"
                  : "border-border bg-bg-1"
              }`}
            >
              {isEditing ? (
                <div className="p-md">
                  <div className="flex items-center justify-between mb-md">
                    <span className="font-medium text-fg-strong text-sm">
                      {formatDisplayDate(date)}
                    </span>
                    <button
                      onClick={closeEdit}
                      className="text-fg-muted hover:text-fg-normal"
                      aria-label="Abbrechen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-sm mb-md">
                    <button
                      onClick={() =>
                        setEditForm((f) => ({ ...f, isAvailable: true }))
                      }
                      className={`flex-1 py-xs rounded-md border text-sm transition-fast ${
                        editForm.isAvailable
                          ? "border-primary-400 bg-primary-50 text-primary-700"
                          : "border-border text-fg-muted hover:border-primary-300"
                      }`}
                    >
                      Verfügbar
                    </button>
                    <button
                      onClick={() =>
                        setEditForm((f) => ({ ...f, isAvailable: false }))
                      }
                      className={`flex-1 py-xs rounded-md border text-sm transition-fast ${
                        !editForm.isAvailable
                          ? "border-red-400 bg-red-50 text-red-700"
                          : "border-border text-fg-muted hover:border-red-300"
                      }`}
                    >
                      Abwesend
                    </button>
                  </div>

                  {editForm.isAvailable && (
                    <div className="flex items-center gap-md mb-md flex-wrap">
                      <div className="flex items-center gap-sm">
                        <label className="text-sm text-fg-muted">Von</label>
                        <input
                          type="time"
                          value={editForm.startTime}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              startTime: e.target.value,
                            }))
                          }
                          className="rounded-md border border-border bg-bg-0 px-sm py-xs text-sm focus:border-primary-400 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-sm">
                        <label className="text-sm text-fg-muted">Bis</label>
                        <input
                          type="time"
                          value={editForm.endTime}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              endTime: e.target.value,
                            }))
                          }
                          className="rounded-md border border-border bg-bg-0 px-sm py-xs text-sm focus:border-primary-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      disabled={isPending}
                      onClick={() => requestApply(date)}
                      className="flex items-center gap-xs px-md py-xs rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700 disabled:opacity-50 transition-fast"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Weiter
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="w-full px-md py-sm flex items-center justify-between text-left"
                  onClick={() => openEdit(date)}
                  data-testid={`availability-row-${ds}`}
                >
                  <div className="flex items-center gap-md min-w-0">
                    <span className="text-sm font-medium text-fg-normal truncate">
                      {formatDisplayDate(date)}
                    </span>
                    {effective.source === "exception" && (
                      <span className="shrink-0 text-xs px-xs py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                        Ausnahme
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-sm shrink-0 ml-sm">
                    {effective.isAvailable ? (
                      <span className="flex items-center gap-xs text-sm text-fg-normal">
                        <Clock className="w-3.5 h-3.5 text-primary-500" />
                        {effective.startTime} – {effective.endTime}
                      </span>
                    ) : (
                      <span className="text-sm text-red-500">Abwesend</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-fg-muted" />
                  </div>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Infinite-scroll sentinel */}
      <div ref={sentinelRef} className="h-8" />
    </div>
  );
}
