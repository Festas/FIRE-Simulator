import React from "react";

interface TooltipEntry {
  name?: string;
  value?: number;
  color?: string;
}

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: ReadonlyArray<TooltipEntry>;
  label?: string | number;
  formatValue: (v: number) => string;
}

export function ChartTooltipContent({ active, payload, label, formatValue }: ChartTooltipContentProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-[#0f294d] dark:bg-slate-700 text-white rounded-xl shadow-xl p-4 text-sm min-w-[200px]">
      <p className="font-semibold mb-2 text-slate-300">{label}</p>
      {payload.map((p, i) => (
        <div key={p.name ?? i} className="flex justify-between gap-4">
          <span style={{ color: p.color }} className="font-medium">{p.name}</span>
          <span className="font-semibold">{formatValue(p.value ?? 0)}</span>
        </div>
      ))}
    </div>
  );
}

interface SimpleTooltipContentProps {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: number }>;
  label?: string | number;
  formatValue: (v: number) => string;
}

export function SimpleTooltipContent({ active, payload, label, formatValue }: SimpleTooltipContentProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-[#0f294d] dark:bg-slate-700 text-white rounded-xl shadow-xl p-3 text-sm min-w-[160px]">
      <p className="font-semibold mb-1 text-slate-300">{label}</p>
      <p className="font-semibold">{formatValue(payload[0].value ?? 0)}</p>
    </div>
  );
}
