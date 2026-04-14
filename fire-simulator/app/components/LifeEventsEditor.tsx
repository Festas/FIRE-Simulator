"use client";

import React, { useState } from "react";
import { LifeEvent, LifeEventType } from "@/lib/fireCalculations";
import { useI18n } from "@/lib/i18n";

/* ------------------------------------------------------------------ */
/* Types & constants                                                   */
/* ------------------------------------------------------------------ */

interface LifeEventsEditorProps {
  events: LifeEvent[];
  onChange: (events: LifeEvent[]) => void;
  startYear: number;
}

const EVENT_TYPE_EMOJI: Record<LifeEventType, string> = {
  home_purchase: "🏠",
  child: "👶",
  career_change: "💼",
  inheritance: "💰",
  pension_start: "🏛️",
  healthcare: "🏥",
  one_time_expense: "💸",
  one_time_income: "📈",
  side_income: "🔧",
};

const ALL_EVENT_TYPES: LifeEventType[] = [
  "home_purchase",
  "child",
  "career_change",
  "inheritance",
  "pension_start",
  "healthcare",
  "one_time_expense",
  "one_time_income",
  "side_income",
];

function getEventTypeLabel(
  type: LifeEventType,
  t: ReturnType<typeof useI18n>["t"],
): string {
  const map: Record<LifeEventType, string> = {
    home_purchase: t.lifeEventHomePurchase,
    child: t.lifeEventChild,
    career_change: t.lifeEventCareerChange,
    inheritance: t.lifeEventInheritance,
    pension_start: t.lifeEventPensionStart,
    healthcare: t.lifeEventHealthcare,
    one_time_expense: t.lifeEventOneTimeExpense,
    one_time_income: t.lifeEventOneTimeIncome,
    side_income: t.lifeEventSideIncome,
  };
  return map[type];
}

/* ------------------------------------------------------------------ */
/* Event row (extracted to top-level to satisfy React Compiler lint)   */
/* ------------------------------------------------------------------ */

interface EventRowProps {
  event: LifeEvent;
  onUpdate: (id: string, patch: Partial<LifeEvent>) => void;
  onRemove: (id: string) => void;
}

const inputClass =
  "bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 w-full";

function EventRow({ event, onUpdate, onRemove }: EventRowProps) {
  const { t, formatCurrency } = useI18n();

  return (
    <div className="border border-slate-200 dark:border-slate-600 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-700/30">
      {/* Header: emoji + name + remove */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{EVENT_TYPE_EMOJI[event.type]}</span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[180px]">
            {event.name || getEventTypeLabel(event.type, t)}
          </span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              event.annualAmount >= 0
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            }`}
          >
            {formatCurrency(event.annualAmount)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onRemove(event.id)}
          className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
          aria-label={t.lifeEventsRemove}
        >
          {t.lifeEventsRemove}
        </button>
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Type */}
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            {t.lifeEventsType}
          </label>
          <select
            value={event.type}
            onChange={(e) =>
              onUpdate(event.id, { type: e.target.value as LifeEventType })
            }
            className={inputClass}
          >
            {ALL_EVENT_TYPES.map((et) => (
              <option key={et} value={et}>
                {EVENT_TYPE_EMOJI[et]} {getEventTypeLabel(et, t)}
              </option>
            ))}
          </select>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            {t.lifeEventsName}
          </label>
          <input
            type="text"
            value={event.name}
            onChange={(e) => onUpdate(event.id, { name: e.target.value })}
            className={inputClass}
            placeholder={getEventTypeLabel(event.type, t)}
          />
        </div>

        {/* Start Year */}
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            {t.lifeEventsStartYear}
          </label>
          <input
            type="number"
            value={event.startYear}
            onChange={(e) =>
              onUpdate(event.id, { startYear: Number(e.target.value) })
            }
            className={inputClass}
          />
        </div>

        {/* End Year */}
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            {t.lifeEventsEndYear}
          </label>
          <input
            type="number"
            value={event.endYear}
            onChange={(e) =>
              onUpdate(event.id, { endYear: Number(e.target.value) })
            }
            className={inputClass}
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            {t.lifeEventsAmount}
          </label>
          <input
            type="number"
            value={event.annualAmount}
            onChange={(e) =>
              onUpdate(event.id, { annualAmount: Number(e.target.value) })
            }
            className={`${inputClass} ${
              event.annualAmount >= 0
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-red-700 dark:text-red-400"
            }`}
          />
        </div>

        {/* Inflation adjusted toggle */}
        <div className="flex flex-col justify-between">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            {t.lifeEventsInflationAdj}
          </label>
          <button
            type="button"
            onClick={() =>
              onUpdate(event.id, {
                inflationAdjusted: !event.inflationAdjusted,
              })
            }
            className={`rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${
              event.inflationAdjusted
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700"
                : "bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600"
            }`}
          >
            {event.inflationAdjusted ? "✓" : "✗"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function LifeEventsEditor({
  events,
  onChange,
  startYear,
}: LifeEventsEditorProps) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);

  const handleAdd = () => {
    const newEvent: LifeEvent = {
      id: crypto.randomUUID(),
      type: "one_time_expense",
      name: "",
      startYear,
      endYear: startYear,
      annualAmount: 0,
      inflationAdjusted: true,
    };
    onChange([...events, newEvent]);
    setExpanded(true);
  };

  const handleUpdate = (id: string, patch: Partial<LifeEvent>) => {
    onChange(events.map((ev) => (ev.id === id ? { ...ev, ...patch } : ev)));
  };

  const handleRemove = (id: string) => {
    onChange(events.filter((ev) => ev.id !== id));
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
      {/* Section header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <h2 className="text-lg font-bold text-[#0f294d] dark:text-white">
          {t.lifeEventsSection}
          {events.length > 0 && (
            <span className="ml-2 text-sm font-normal text-slate-400">
              ({events.length})
            </span>
          )}
        </h2>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {expanded && (
        <div className="mt-4 space-y-3">
          {events.length === 0 && (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">
              {t.lifeEventsEmpty}
            </p>
          )}

          {events.map((event) => (
            <EventRow
              key={event.id}
              event={event}
              onUpdate={handleUpdate}
              onRemove={handleRemove}
            />
          ))}

          <button
            type="button"
            onClick={handleAdd}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-500 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            + {t.lifeEventsAdd}
          </button>
        </div>
      )}
    </div>
  );
}
