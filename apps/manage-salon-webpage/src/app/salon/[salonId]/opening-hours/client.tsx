"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Clock, X, Check, AlertCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import type {
  OpeningHoursDto,
  OpeningHoursExceptionDto,
} from "./opening-hours.actions";
import {
  setOpeningHours,
  deleteOpeningHours,
  createOpeningHoursException,
  deleteOpeningHoursException,
} from "./opening-hours.actions";

// 0=Monday ... 6=Sunday
const DAYS_OF_WEEK = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
];

const DAYS_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

interface OpeningHoursClientProps {
  salonId: string;
  initialHours: OpeningHoursDto[];
  initialExceptions: OpeningHoursExceptionDto[];
}

interface DayEditState {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

interface ExceptionFormState {
  date: string;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
  reason: string;
}

function formatTime(time: string) {
  return time;
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}.${month}.${year}`;
}

function formatExceptionDate(dateStr: string) {
  try {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("de-DE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function OpeningHoursClient({
  salonId,
  initialHours,
  initialExceptions,
}: OpeningHoursClientProps) {
  const [hours, setHours] = useState<OpeningHoursDto[]>(initialHours);
  const [exceptions, setExceptions] =
    useState<OpeningHoursExceptionDto[]>(initialExceptions);
  const [editingDay, setEditingDay] = useState<DayEditState | null>(null);
  const [showExceptionForm, setShowExceptionForm] = useState(false);
  const [exceptionForm, setExceptionForm] = useState<ExceptionFormState>({
    date: "",
    isClosed: true,
    openTime: "09:00",
    closeTime: "18:00",
    reason: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const getHoursForDay = (dayOfWeek: number) =>
    hours.find((h) => h.dayOfWeek === dayOfWeek) ?? null;

  const openEditDay = (dayOfWeek: number) => {
    const existing = getHoursForDay(dayOfWeek);
    setEditingDay({
      dayOfWeek,
      openTime: existing?.openTime ?? "09:00",
      closeTime: existing?.closeTime ?? "18:00",
    });
    setErrorMessage(null);
  };

  const handleSaveDay = () => {
    if (!editingDay) return;
    setErrorMessage(null);

    startTransition(async () => {
      const result = await setOpeningHours(
        salonId,
        editingDay.dayOfWeek,
        editingDay.openTime,
        editingDay.closeTime,
      );

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      setHours((prev) => {
        const filtered = prev.filter(
          (h) => h.dayOfWeek !== editingDay.dayOfWeek,
        );
        return [...filtered, result.data].sort(
          (a, b) => a.dayOfWeek - b.dayOfWeek,
        );
      });
      setEditingDay(null);
    });
  };

  const handleDeleteDay = (dayOfWeek: number) => {
    setErrorMessage(null);

    startTransition(async () => {
      const result = await deleteOpeningHours(salonId, dayOfWeek);
      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }
      setHours((prev) => prev.filter((h) => h.dayOfWeek !== dayOfWeek));
      if (editingDay?.dayOfWeek === dayOfWeek) {
        setEditingDay(null);
      }
    });
  };

  const handleSaveException = () => {
    if (!exceptionForm.date) {
      setErrorMessage("Bitte ein Datum auswählen");
      return;
    }
    setErrorMessage(null);

    startTransition(async () => {
      const result = await createOpeningHoursException(
        salonId,
        exceptionForm.date,
        exceptionForm.isClosed,
        exceptionForm.isClosed ? null : exceptionForm.openTime,
        exceptionForm.isClosed ? null : exceptionForm.closeTime,
        exceptionForm.reason || null,
      );

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      setExceptions((prev) => {
        const filtered = prev.filter((e) => e.date !== result.data.date);
        return [...filtered, result.data].sort((a, b) =>
          a.date.localeCompare(b.date),
        );
      });
      setShowExceptionForm(false);
      setExceptionForm({
        date: "",
        isClosed: true,
        openTime: "09:00",
        closeTime: "18:00",
        reason: "",
      });
    });
  };

  const handleDeleteException = (id: string) => {
    setErrorMessage(null);

    startTransition(async () => {
      const result = await deleteOpeningHoursException(salonId, id);
      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }
      setExceptions((prev) => prev.filter((e) => e.id !== id));
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Öffnungszeiten"
        subtitle="Definiere die regulären Öffnungszeiten und Ausnahmen deines Salons"
      />

      {errorMessage && (
        <div className="mb-lg flex items-center gap-sm p-md rounded-md bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm">{errorMessage}</span>
        </div>
      )}

      {/* Weekly schedule grid */}
      <div className="mb-xl">
        <h2 className="text-lg font-focus font-semibold text-fg-strong mb-md">
          Wöchentliche Öffnungszeiten
        </h2>

        <div className="grid grid-cols-1 gap-sm">
          {DAYS_OF_WEEK.map((dayName, dayIndex) => {
            const existingHours = getHoursForDay(dayIndex);
            const isEditing = editingDay?.dayOfWeek === dayIndex;

            return (
              <div
                key={dayIndex}
                className={`rounded-lg border transition-fast ${
                  isEditing
                    ? "border-primary-400 bg-bg-1"
                    : "border-border bg-bg-1 hover:border-primary-300"
                }`}
              >
                {isEditing ? (
                  /* Edit mode */
                  <div className="p-md">
                    <div className="flex items-center justify-between mb-md">
                      <span className="font-medium text-fg-strong">
                        {dayName}
                      </span>
                      <button
                        onClick={() => setEditingDay(null)}
                        className="text-fg-muted hover:text-fg-normal transition-fast"
                        aria-label="Abbrechen"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-md flex-wrap">
                      <div className="flex items-center gap-sm">
                        <label className="text-sm text-fg-muted">Von</label>
                        <input
                          type="time"
                          value={editingDay.openTime}
                          onChange={(e) =>
                            setEditingDay((prev) =>
                              prev
                                ? { ...prev, openTime: e.target.value }
                                : prev,
                            )
                          }
                          className="rounded-md border border-border bg-bg-0 px-sm py-xs text-sm text-fg-normal focus:border-primary-400 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-sm">
                        <label className="text-sm text-fg-muted">Bis</label>
                        <input
                          type="time"
                          value={editingDay.closeTime}
                          onChange={(e) =>
                            setEditingDay((prev) =>
                              prev
                                ? { ...prev, closeTime: e.target.value }
                                : prev,
                            )
                          }
                          className="rounded-md border border-border bg-bg-0 px-sm py-xs text-sm text-fg-normal focus:border-primary-400 focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-sm ml-auto">
                        <button
                          onClick={handleSaveDay}
                          disabled={isPending}
                          className="flex items-center gap-xs px-md py-xs rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700 disabled:opacity-50 transition-fast"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Speichern
                        </button>
                        {existingHours && (
                          <button
                            onClick={() => handleDeleteDay(dayIndex)}
                            disabled={isPending}
                            className="flex items-center gap-xs px-md py-xs rounded-md border border-border text-fg-muted text-sm hover:bg-red-50 hover:border-red-300 hover:text-red-600 disabled:opacity-50 transition-fast"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Geschlossen
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Display mode */
                  <button
                    className="w-full p-md flex items-center justify-between text-left"
                    onClick={() => openEditDay(dayIndex)}
                  >
                    <div className="flex items-center gap-md">
                      <span className="w-28 font-medium text-fg-normal text-sm">
                        {dayName}
                      </span>
                      {existingHours ? (
                        <div className="flex items-center gap-xs text-fg-normal text-sm">
                          <Clock className="w-3.5 h-3.5 text-primary-500" />
                          <span>
                            {formatTime(existingHours.openTime)} –{" "}
                            {formatTime(existingHours.closeTime)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-fg-muted text-sm italic">
                          Geschlossen
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-fg-muted hover:text-primary-500 transition-fast">
                      Bearbeiten
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Exceptions section */}
      <div className="mb-xl">
        <div className="flex items-center justify-between mb-md">
          <div>
            <h2 className="text-lg font-focus font-semibold text-fg-strong">
              Ausnahmen
            </h2>
            <p className="text-sm text-fg-muted">
              Z.B. Feiertage, Urlaub oder besondere Öffnungszeiten
            </p>
          </div>
          <button
            onClick={() => {
              setShowExceptionForm(true);
              setErrorMessage(null);
            }}
            className="flex items-center gap-xs px-md py-sm rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700 transition-fast"
          >
            <Plus className="w-4 h-4" />
            Ausnahme hinzufügen
          </button>
        </div>

        {/* Exception form */}
        {showExceptionForm && (
          <div className="mb-md rounded-lg border border-primary-300 bg-bg-1 p-md">
            <div className="flex items-center justify-between mb-md">
              <span className="font-medium text-fg-strong text-sm">
                Neue Ausnahme
              </span>
              <button
                onClick={() => setShowExceptionForm(false)}
                className="text-fg-muted hover:text-fg-normal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
              <div>
                <label className="block text-sm text-fg-muted mb-xs">
                  Datum
                </label>
                <input
                  type="date"
                  value={exceptionForm.date}
                  onChange={(e) =>
                    setExceptionForm((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-border bg-bg-0 px-sm py-xs text-sm text-fg-normal focus:border-primary-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-fg-muted mb-xs">
                  Grund (optional)
                </label>
                <input
                  type="text"
                  placeholder="z.B. Weihnachten, Urlaub"
                  value={exceptionForm.reason}
                  onChange={(e) =>
                    setExceptionForm((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-border bg-bg-0 px-sm py-xs text-sm text-fg-normal focus:border-primary-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-md">
              <label className="block text-sm text-fg-muted mb-sm">
                Art der Ausnahme
              </label>
              <div className="flex gap-sm">
                <button
                  onClick={() =>
                    setExceptionForm((prev) => ({ ...prev, isClosed: true }))
                  }
                  className={`flex-1 py-sm rounded-md border text-sm transition-fast ${
                    exceptionForm.isClosed
                      ? "border-primary-400 bg-primary-50 text-primary-700"
                      : "border-border text-fg-muted hover:border-primary-300"
                  }`}
                >
                  Geschlossen
                </button>
                <button
                  onClick={() =>
                    setExceptionForm((prev) => ({ ...prev, isClosed: false }))
                  }
                  className={`flex-1 py-sm rounded-md border text-sm transition-fast ${
                    !exceptionForm.isClosed
                      ? "border-primary-400 bg-primary-50 text-primary-700"
                      : "border-border text-fg-muted hover:border-primary-300"
                  }`}
                >
                  Sonderöffnungszeiten
                </button>
              </div>
            </div>

            {!exceptionForm.isClosed && (
              <div className="mt-md flex items-center gap-md flex-wrap">
                <div className="flex items-center gap-sm">
                  <label className="text-sm text-fg-muted">Von</label>
                  <input
                    type="time"
                    value={exceptionForm.openTime}
                    onChange={(e) =>
                      setExceptionForm((prev) => ({
                        ...prev,
                        openTime: e.target.value,
                      }))
                    }
                    className="rounded-md border border-border bg-bg-0 px-sm py-xs text-sm focus:border-primary-400 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-sm">
                  <label className="text-sm text-fg-muted">Bis</label>
                  <input
                    type="time"
                    value={exceptionForm.closeTime}
                    onChange={(e) =>
                      setExceptionForm((prev) => ({
                        ...prev,
                        closeTime: e.target.value,
                      }))
                    }
                    className="rounded-md border border-border bg-bg-0 px-sm py-xs text-sm focus:border-primary-400 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="mt-md flex justify-end">
              <button
                onClick={handleSaveException}
                disabled={isPending}
                className="flex items-center gap-xs px-md py-sm rounded-md bg-primary-600 text-white text-sm hover:bg-primary-700 disabled:opacity-50 transition-fast"
              >
                <Check className="w-3.5 h-3.5" />
                Ausnahme speichern
              </button>
            </div>
          </div>
        )}

        {/* Exceptions list */}
        {exceptions.length === 0 ? (
          <div className="rounded-lg border border-border bg-bg-1 p-lg text-center text-fg-muted text-sm">
            Keine Ausnahmen eingetragen
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-sm">
            {exceptions.map((ex) => (
              <div
                key={ex.id}
                className="rounded-lg border border-border bg-bg-1 p-md flex items-start justify-between gap-md"
              >
                <div>
                  <div className="font-medium text-fg-strong text-sm">
                    {formatExceptionDate(ex.date)}
                  </div>
                  <div className="text-sm text-fg-muted mt-xs">
                    {ex.isClosed ? (
                      <span className="text-red-600">Geschlossen</span>
                    ) : (
                      <span className="flex items-center gap-xs text-fg-normal">
                        <Clock className="w-3.5 h-3.5 text-primary-500" />
                        {ex.openTime} – {ex.closeTime}
                      </span>
                    )}
                    {ex.reason && (
                      <span className="ml-sm text-fg-muted">· {ex.reason}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteException(ex.id)}
                  disabled={isPending}
                  className="p-xs rounded-md text-fg-muted hover:bg-red-50 hover:text-red-600 transition-fast disabled:opacity-50 shrink-0"
                  aria-label="Ausnahme löschen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
