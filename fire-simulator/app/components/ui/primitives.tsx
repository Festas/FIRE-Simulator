"use client";

import React from "react";

/* ------------------------------------------------------------------ */
/* Utility: merge class names                                          */
/* ------------------------------------------------------------------ */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ */
/* Card — the canonical surface primitive                             */
/* ------------------------------------------------------------------ */
export function Card({
  className,
  as: Tag = "div",
  interactive = false,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  interactive?: boolean;
}) {
  return (
    <Tag
      className={cx(
        "rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800",
        interactive &&
          "transition-shadow duration-200 hover:shadow-md focus-within:shadow-md",
        className
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Button — primary / secondary / ghost / danger                      */
/* ------------------------------------------------------------------ */
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-colors " +
  "focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed select-none";

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "text-xs px-2.5 py-2",
  md: "text-sm px-4 py-2",
};

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 active:bg-emerald-700",
  secondary:
    "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 " +
    "dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-600",
  ghost:
    "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700",
  danger:
    "bg-red-500 text-white shadow-sm hover:bg-red-600 active:bg-red-700",
};

export function Button({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      className={cx(BUTTON_BASE, BUTTON_SIZES[size], BUTTON_VARIANTS[variant], className)}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/* IconButton — square, icon-only control                             */
/* ------------------------------------------------------------------ */
export function IconButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center p-2 rounded-lg transition-colors",
        "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700",
        "disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none",
        className
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Badge — status / label pill                                        */
/* ------------------------------------------------------------------ */
type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger";

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral:
    "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  brand:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  success:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  warning:
    "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  danger:
    "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        BADGE_TONES[tone],
        className
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/* SegmentedControl — accessible tab/segment switcher                 */
/* ------------------------------------------------------------------ */
export interface SegmentOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = "md",
  className,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  size?: ButtonSize;
  className?: string;
}) {
  const pad = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cx(
        "inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1",
        "dark:border-slate-700 dark:bg-slate-800/60",
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cx(
              "rounded-lg font-medium transition-colors focus-visible:outline-none",
              pad,
              active
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-700"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
