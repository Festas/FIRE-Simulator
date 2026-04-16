"use client";

import React, { useState } from "react";

/* ------------------------------------------------------------------ */
/* InfoTooltip                                                         */
/* ------------------------------------------------------------------ */

export function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block ml-1">
      <button
        type="button"
        className="text-slate-500 hover:text-slate-300 transition-colors"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow((p) => !p)}
        aria-label="Info"
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-200 shadow-xl border border-slate-600 leading-relaxed pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* SliderField                                                         */
/* ------------------------------------------------------------------ */

export type SliderFieldVariant = "sidebar" | "panel";

export interface SliderFieldProps {
  label: string;
  subLabel?: string;
  tooltip?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  /** Visual variant: "sidebar" uses dark theme, "panel" uses light/dark responsive theme */
  variant?: SliderFieldVariant;
}

/**
 * Shared slider + number-input field used in both the Sidebar and ReversePlanner.
 *
 * - "sidebar" variant (default): dark background with light text, editable value on click
 * - "panel" variant: light/dark responsive, read-only value display
 */
export default function SliderField({
  label,
  subLabel,
  tooltip,
  value,
  min,
  max,
  step,
  onChange,
  format,
  variant = "sidebar",
}: SliderFieldProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const pct = ((value - min) / (max - min)) * 100;

  const handleValueClick = () => {
    if (variant === "panel") return; // panel variant is read-only display
    setEditValue(String(value));
    setEditing(true);
  };

  const handleEditConfirm = () => {
    // Handle German number format (1.234,56 → 1234.56)
    const cleaned = editValue.replace(/[^0-9.,\-]/g, "");
    const hasComma = cleaned.includes(",");
    const hasDot = cleaned.includes(".");
    let normalized: string;
    if (hasComma && hasDot) {
      // German format: dots are thousands separators, comma is decimal
      normalized = cleaned.replace(/\./g, "").replace(",", ".");
    } else if (hasComma) {
      normalized = cleaned.replace(",", ".");
    } else {
      normalized = cleaned;
    }
    const parsed = parseFloat(normalized);
    if (!isNaN(parsed)) {
      onChange(Math.max(min, Math.min(max, parsed)));
    }
    setEditing(false);
  };

  if (variant === "panel") {
    return (
      <div className="mb-4">
        <div className="flex justify-between items-baseline mb-1">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {label}
          </label>
          <span className="text-sm font-semibold text-[#0f294d] dark:text-white">
            {format(value)}
          </span>
        </div>
        {subLabel && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{subLabel}</p>
        )}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          style={{
            background: `linear-gradient(to right, #10b981 0%, #10b981 ${pct}%, #cbd5e1 ${pct}%, #cbd5e1 100%)`,
          }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-slate-500">{format(min)}</span>
          <span className="text-xs text-slate-500">{format(max)}</span>
        </div>
      </div>
    );
  }

  // "sidebar" variant (default)
  return (
    <div className="mb-5">
      <div className="flex justify-between items-baseline mb-1">
        <label className="text-sm font-medium text-slate-300 flex items-center">
          {label}
          {tooltip && <InfoTooltip text={tooltip} />}
        </label>
        {editing ? (
          <input
            type="text"
            className="w-24 text-right text-sm font-semibold bg-slate-700 text-white rounded px-2 py-0.5 border border-emerald-400 outline-none"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleEditConfirm}
            onKeyDown={(e) => e.key === "Enter" && handleEditConfirm()}
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={handleValueClick}
            className="text-sm font-semibold text-white hover:text-emerald-300 transition-colors cursor-text border-b border-dashed border-slate-600 hover:border-emerald-400"
          >
            {format(value)}
          </button>
        )}
      </div>
      {subLabel && <p className="text-xs text-slate-500 mb-2">{subLabel}</p>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-700"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        style={{
          background: `linear-gradient(to right, #10b981 0%, #10b981 ${pct}%, #334155 ${pct}%, #334155 100%)`,
        }}
      />
      <div className="flex justify-between mt-1">
        <span className="text-xs text-slate-600">{format(min)}</span>
        <span className="text-xs text-slate-600">{format(max)}</span>
      </div>
    </div>
  );
}
