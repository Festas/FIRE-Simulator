"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { FireResult, FireInputs, formatEuro } from "@/lib/fireCalculations";
import { useI18n } from "@/lib/i18n";

interface DrawdownChartProps {
  result: FireResult;
  inputs: FireInputs;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string | number;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-[#0f294d] dark:bg-slate-700 text-white rounded-xl shadow-xl p-4 text-sm min-w-[200px]">
      <p className="font-semibold mb-2 text-slate-300">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }} className="font-medium">{p.name}</span>
          <span className="font-semibold">{formatEuro(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function yAxisFormatter(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(value);
}

export default function DrawdownChart({ result, inputs }: DrawdownChartProps) {
  const { t } = useI18n();
  const { drawdownData, drawdownSurvives, drawdownDepletionYear, fullFireYear } = result;

  if (!drawdownData.length || fullFireYear === null) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
        <h2 className="text-lg font-bold text-[#0f294d] dark:text-white mb-2">{t.drawdownTitle}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t.drawdownNoTarget}
        </p>
      </div>
    );
  }

  const chartData = drawdownData.map((d) => ({
    year: d.calendarYear,
    Portfolio: Math.round(d.totalReal),
    Entnahme: Math.round(d.annualWithdrawal),
  }));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-[#0f294d] dark:text-white">{t.drawdownTitle}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {inputs.entnahmeModell === "ewigeRente"
              ? t.drawdownPerpetualSub(formatEuro(inputs.monatlichesWunschEinkommen - inputs.gesetzlicheRente))
              : t.drawdownSpendSub(inputs.kapitalverzehrJahre)}
          </p>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
          drawdownSurvives
            ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700"
            : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700"
        }`}>
          {drawdownSurvives
            ? t.drawdownSurvives40
            : t.drawdownDepleted(drawdownDepletionYear ?? 0)}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
          <defs>
            <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={drawdownSurvives ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
              <stop offset="95%" stopColor={drawdownSurvives ? "#10b981" : "#ef4444"} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={yAxisFormatter} tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={55} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1} />
          <Area
            type="monotone"
            dataKey="Portfolio"
            stroke={drawdownSurvives ? "#10b981" : "#ef4444"}
            strokeWidth={2.5}
            fill="url(#drawdownGradient)"
            name="Portfolio (real)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
