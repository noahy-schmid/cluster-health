"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Clock, X, Check, AlertCircle } from "lucide-react";
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

const DAYS_OF_WEEK = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
];

interface StylistAvailabilityClientProps {
  salonId: string;
  stylistId: string;
  stylistName: string;
  initialAvailability: StylistAvailabilityDto[];
  initialExceptions: StylistAvailabilityExceptionDto[];
}

interface DayEditState {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface ExceptionFormState {
  date: string;
  isAbsent: boolean;
  startTime: string;
  endTime: string;
  reason: string;
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

export default function StylistAvailabilityClient({
  salonId,
  stylistId,
  stylistName,
  initialAvailability,
  initialExceptions,
}: StylistAvailabilityClientProps) {
  const [availability, setAvailability] =
    useState<StylistAvailabilityDto[]>(initialAvailability);
  const [exceptions, setExceptions] =
    useState<StylistAvailabilityExceptionDto[]>(initialExceptions);
  const [editingDay, setEditingDay] = useState<DayEditState | null>(null);
  const [showExceptionForm, setShowExceptionForm] = useState(false);
  const [exceptionForm, setExceptionForm] = useState<ExceptionFormState>({
    date: "",
    isAbsent: true,
    startTime: "09:00",
    endTime: "18:00",
    reason: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const getAvailabilityForDay = (dayOfWeek: number) =>
    availability.find((a) => a.dayOfWeek === dayOfWeek) ?? null;

  const openEditDay = (dayOfWeek: number) => {
    const existing = getAvailabilityForDay(dayOfWeek);
    setEditingDay({
      dayOfWeek,
      startTime: existing?.startTime ?? "09:00",
      endTime: existing?.endTime ?? "18:00",
    });
    setErrorMessage(null);
  };

  const handleSaveDay = () => {
    if (!editingDay) return;
    setErrorMessage(null);

    startTransition(async () => {
      const result = await setStylistAvailability(
        salonId,
        stylistId,
        editingDay.dayOfWeek,
        editingDay.startTime,
        editingDay.endTime,
      );

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      setAvailability((prev) => {
        const filtered = prev.filter(
          (a) => a.dayOfWeek !== editingDay.dayOfWeek,
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
      const result = await deleteStylistAvailability(
        salonId,
        stylistId,
        dayOfWeek,
      );
      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }
      setAvailability((prev) => prev.filter((a) => a.dayOfWeek !== dayOfWeek));
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
      const result = await createStylistAvailabilityException(
        salonId,
        stylistId,
        exceptionForm.date,
        exceptionForm.isAbsent,
        exceptionForm.isAbsent ? null : exceptionForm.startTime,
        exceptionForm.isAbsent ? null : exceptionForm.endTime,
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
        isAbsent: true,
        startTime: "09:00",
        endTime: "18:00",
        reason: "",
      });
    });
  };

  const handleDeleteException = (id: string) => {
    setErrorMessage(null);

    startTransition(async () => {
      const result = await deleteStylistAvailabilityException(salonId, id);
      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }
      setExceptions((prev) => prev.filter((e) => e.id !== id));
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <BackButton text="Zurück zum Stylisten" />
      <PageHeader
        title={`Verfügbarkeit – ${stylistName}`}
        subtitle="Definiere die regulären Arbeitszeiten und Ausnahmen dieses Stylisten"
      />

      {errorMessage && (
        <div className="mb-lg flex items-center gap-sm p-md rounded-md bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm">{errorMessage}</span>
        </div>
      )}

      {/* Weekly availability grid */}
      <div className="mb-xl">
        <h2 className="text-lg font-focus font-semibold text-fg-strong mb-md">
          Wöchentliche Verfügbarkeit
        </h2>

        <div className="grid grid-cols-1 gap-sm">
          {DAYS_OF_WEEK.map((dayName, dayIndex) => {
            const existingAvailability = getAvailabilityForDay(dayIndex);
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
                          value={editingDay.startTime}
                          onChange={(e) =>
                            setEditingDay((prev) =>
                              prev
                                ? { ...prev, startTime: e.target.value }
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
                          value={editingDay.endTime}
                          onChange={(e) =>
                            setEditingDay((prev) =>
                              prev
                                ? { ...prev, endTime: e.target.value }
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
                        {existingAvailability && (
                          <button
                            onClick={() => handleDeleteDay(dayIndex)}
                            disabled={isPending}
                            className="flex items-center gap-xs px-md py-xs rounded-md border border-border text-fg-muted text-sm hover:bg-red-50 hover:border-red-300 hover:text-red-600 disabled:opacity-50 transition-fast"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Nicht verfügbar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    className="w-full p-md flex items-center justify-between text-left"
                    onClick={() => openEditDay(dayIndex)}
                  >
                    <div className="flex items-center gap-md">
                      <span className="w-28 font-medium text-fg-normal text-sm">
                        {dayName}
                      </span>
                      {existingAvailability ? (
                        <div className="flex items-center gap-xs text-fg-normal text-sm">
                          <Clock className="w-3.5 h-3.5 text-primary-500" />
                          <span>
                            {existingAvailability.startTime} –{" "}
                            {existingAvailability.endTime}
                          </span>
                        </div>
                      ) : (
                        <span className="text-fg-muted text-sm italic">
                          Nicht verfügbar
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
              Z.B. Urlaub, Krankheit oder besondere Arbeitszeiten
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
                  placeholder="z.B. Urlaub, Krankheit"
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
                    setExceptionForm((prev) => ({ ...prev, isAbsent: true }))
                  }
                  className={`flex-1 py-sm rounded-md border text-sm transition-fast ${
                    exceptionForm.isAbsent
                      ? "border-primary-400 bg-primary-50 text-primary-700"
                      : "border-border text-fg-muted hover:border-primary-300"
                  }`}
                >
                  Abwesend
                </button>
                <button
                  onClick={() =>
                    setExceptionForm((prev) => ({ ...prev, isAbsent: false }))
                  }
                  className={`flex-1 py-sm rounded-md border text-sm transition-fast ${
                    !exceptionForm.isAbsent
                      ? "border-primary-400 bg-primary-50 text-primary-700"
                      : "border-border text-fg-muted hover:border-primary-300"
                  }`}
                >
                  Sonderarbeitszeiten
                </button>
              </div>
            </div>

            {!exceptionForm.isAbsent && (
              <div className="mt-md flex items-center gap-md flex-wrap">
                <div className="flex items-center gap-sm">
                  <label className="text-sm text-fg-muted">Von</label>
                  <input
                    type="time"
                    value={exceptionForm.startTime}
                    onChange={(e) =>
                      setExceptionForm((prev) => ({
                        ...prev,
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
                    value={exceptionForm.endTime}
                    onChange={(e) =>
                      setExceptionForm((prev) => ({
                        ...prev,
                        endTime: e.target.value,
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
                    {ex.isAbsent ? (
                      <span className="text-red-600">Abwesend</span>
                    ) : (
                      <span className="flex items-center gap-xs text-fg-normal">
                        <Clock className="w-3.5 h-3.5 text-primary-500" />
                        {ex.startTime} – {ex.endTime}
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
