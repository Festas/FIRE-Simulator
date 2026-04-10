"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { FireResult, YearDataPoint, formatEuro } from "@/lib/fireCalculations";
import { useI18n } from "@/lib/i18n";

interface FireChartProps {
  result: FireResult;
  zielvermoegen: number;
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
          <span style={{ color: p.color }} className="font-medium">
            {p.name}
          </span>
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

export default function FireChart({ result, zielvermoegen }: FireChartProps) {
  const [showScenarios, setShowScenarios] = useState(false);
  const { t } = useI18n();
  const {
    yearlyData,
    coastFireYear,
    fullFireYear,
    lzkStartYear,
    coastFireCalendarYear,
    fullFireCalendarYear,
    lzkStartCalendarYear,
    coastFireAmount,
    scenarioOptimistic,
    scenarioPessimistic,
  } = result;

  const displayEnd = Math.min(
    (fullFireYear !== null ? fullFireYear + 2 : 30),
    yearlyData.length - 1
  );
  const chartData = yearlyData.slice(0, displayEnd + 1).map((d: YearDataPoint, i: number) => ({
    year: d.calendarYear,
    ETF: Math.round(d.etfBalanceReal),
    LZK: Math.round(d.lzkBalanceReal),
    Gesamt: Math.round(d.totalReal),
    Optimistisch: scenarioOptimistic[i] ? Math.round(scenarioOptimistic[i].totalReal) : undefined,
    Pessimistisch: scenarioPessimistic[i] ? Math.round(scenarioPessimistic[i].totalReal) : undefined,
  }));

  const milestoneLines = [
    coastFireYear !== null && {
      year: coastFireCalendarYear,
      label: "Coast FIRE",
      color: "#10b981",
    },
    lzkStartYear > 0 && {
      year: lzkStartCalendarYear,
      label: "LZK",
      color: "#f59e0b",
    },
    fullFireYear !== null && {
      year: fullFireCalendarYear,
      label: "Full FIRE",
      color: "#6366f1",
    },
  ].filter(Boolean) as { year: number; label: string; color: string }[];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-[#0f294d] dark:text-white">{t.chartTitle}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.chartSubtitle}</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={() => setShowScenarios((p) => !p)}
            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
              showScenarios
                ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300"
                : "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600"
            }`}
          >
            {showScenarios ? t.chartScenariosHide : t.chartScenarios}
          </button>
          <span className="flex items-center gap-1.5 hidden sm:flex">
            <span className="inline-block w-3 h-3 rounded-full bg-emerald-500" />
            ETF
          </span>
          <span className="flex items-center gap-1.5 hidden sm:flex text-slate-600 dark:text-slate-400">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-400" />
            LZK
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={380}>
        {showScenarios ? (
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={yAxisFormatter} tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={55} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={zielvermoegen} stroke="#6366f1" strokeDasharray="6 3" strokeWidth={1.5} />
            <Line type="monotone" dataKey="Optimistisch" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Optimistic (+2%)" />
            <Line type="monotone" dataKey="Gesamt" stroke="#0f294d" strokeWidth={2.5} dot={false} name="Realistic" />
            <Line type="monotone" dataKey="Pessimistisch" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="Pessimistic (-2%)" />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} />
          </LineChart>
        ) : (
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
            <defs>
              <linearGradient id="etfGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="lzkGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={yAxisFormatter} tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={55} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={zielvermoegen} stroke="#6366f1" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: t.chartTarget(yAxisFormatter(zielvermoegen)), position: "insideTopRight", fontSize: 11, fill: "#6366f1" }} />
            <ReferenceLine y={coastFireAmount} stroke="#10b981" strokeDasharray="4 2" strokeWidth={1} label={{ value: `Coast FIRE ${yAxisFormatter(coastFireAmount)}`, position: "insideTopRight", fontSize: 11, fill: "#10b981" }} />
            {milestoneLines.map((m) => (
              <ReferenceLine key={m.label} x={m.year} stroke={m.color} strokeDasharray="4 3" strokeWidth={1.5} label={{ value: m.label, position: "top", fontSize: 10, fill: m.color, angle: -45, offset: 10 }} />
            ))}
            <Area type="monotone" dataKey="LZK" stackId="portfolio" stroke="#60a5fa" strokeWidth={2} fill="url(#lzkGradient)" name="LZK" dot={false} activeDot={{ r: 4 }} />
            <Area type="monotone" dataKey="ETF" stackId="portfolio" stroke="#10b981" strokeWidth={2.5} fill="url(#etfGradient)" name="ETF" dot={false} activeDot={{ r: 5 }} />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} iconType="circle" />
          </AreaChart>
        )}
      </ResponsiveContainer>

      {/* Milestone badges */}
      <div className="flex flex-wrap gap-3 mt-4">
        {milestoneLines.map((m) => (
          <div key={m.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
            <span className="text-slate-700 dark:text-slate-300">{m.label} · {m.year}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
