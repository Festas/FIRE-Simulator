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
  Legend,
} from "recharts";
import { FireResult, formatEuro } from "@/lib/fireCalculations";
import { useI18n } from "@/lib/i18n";

interface MonteCarloChartProps {
  result: FireResult;
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

export default function MonteCarloChart({ result }: MonteCarloChartProps) {
  const { t } = useI18n();
  const { monteCarlo, fullFireYear } = result;

  if (fullFireYear === null) return null;

  const successPct = (monteCarlo.successRate * 100).toFixed(1);

  const chartData = monteCarlo.years.map((year, i) => ({
    year,
    p90: monteCarlo.percentiles.p90[i],
    p75: monteCarlo.percentiles.p75[i],
    p50: monteCarlo.percentiles.p50[i],
    p25: monteCarlo.percentiles.p25[i],
    p10: monteCarlo.percentiles.p10[i],
  }));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-[#0f294d] dark:text-white">
            {t.monteCarloTitle}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t.monteCarloSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              monteCarlo.successRate >= 0.8
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700"
                : monteCarlo.successRate >= 0.5
                  ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700"
                  : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700"
            }`}
          >
            {t.monteCarloSuccess(successPct)}
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
            {t.monteCarloSimulations}
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
          <defs>
            <linearGradient id="mc90" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.08} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="mc75" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="mc50" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-20" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={yAxisFormatter}
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="p90"
            stroke="#10b981"
            strokeWidth={1}
            strokeDasharray="4 2"
            fill="url(#mc90)"
            name={t.monteCarloP90}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="p75"
            stroke="#10b981"
            strokeWidth={1}
            fill="url(#mc75)"
            name={t.monteCarloP75}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="p50"
            stroke="#0f294d"
            strokeWidth={2.5}
            fill="url(#mc50)"
            name={t.monteCarloMedian}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="p25"
            stroke="#f59e0b"
            strokeWidth={1}
            fill="none"
            name={t.monteCarloP25}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="p10"
            stroke="#ef4444"
            strokeWidth={1}
            strokeDasharray="4 2"
            fill="none"
            name={t.monteCarloP10}
            dot={false}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
            iconType="line"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
