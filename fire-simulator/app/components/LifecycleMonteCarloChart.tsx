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
  ReferenceLine,
} from "recharts";
import { FireResult, FireInputs } from "@/lib/fireCalculations";
import { useI18n } from "@/lib/i18n";
import { ChartTooltipContent } from "@/app/components/ChartTooltip";
import { yAxisFormatter } from "@/lib/chartUtils";

interface LifecycleMonteCarloChartProps {
  result: FireResult;
  inputs: FireInputs;
}

export default function LifecycleMonteCarloChart({ result, inputs }: LifecycleMonteCarloChartProps) {
  const { t, formatCurrency } = useI18n();
  const mc = result.lifecycleMonteCarlo;

  if (!mc || mc.fireSuccessRate === 0) return null;

  const successPct = (mc.fireSuccessRate * 100).toFixed(1);
  const startAge = result.yearlyData[0]?.age ?? inputs.currentAge;
  const fireTarget = inputs.zielvermoegen;

  // Determine how many years to show: trim to a reasonable horizon around FIRE
  const { fireYearPercentiles } = mc;
  const p90Year = fireYearPercentiles.p90;
  const p50Year = fireYearPercentiles.p50;
  // Show up to 5 years past the slowest (p90) FIRE year, capped at available data
  const maxYearsToShow = p90Year !== null
    ? Math.min(p90Year + 5, mc.accumulationYears.length)
    : p50Year !== null
      ? Math.min(p50Year + 10, mc.accumulationYears.length)
      : mc.accumulationYears.length;

  const chartData = mc.accumulationYears.slice(0, maxYearsToShow).map((year, i) => ({
    age: startAge + i + 1,
    year,
    p90: mc.accumulationPercentiles.p90[i],
    p75: mc.accumulationPercentiles.p75[i],
    p50: mc.accumulationPercentiles.p50[i],
    p25: mc.accumulationPercentiles.p25[i],
    p10: mc.accumulationPercentiles.p10[i],
  }));

  // Convert fire year percentiles (year offsets) to ages
  const p50Age = fireYearPercentiles.p50 !== null ? startAge + fireYearPercentiles.p50 : null;
  const p10Age = fireYearPercentiles.p10 !== null ? startAge + fireYearPercentiles.p10 : null;
  const p90Age = fireYearPercentiles.p90 !== null ? startAge + fireYearPercentiles.p90 : null;

  // Median FIRE reference line
  const fireRefAge = mc.medianFireYear !== null ? startAge + mc.medianFireYear : null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-[#0f294d] dark:text-white">
            {t.lifecycleMCTitle}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t.lifecycleMCSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              mc.fireSuccessRate >= 0.8
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700"
                : mc.fireSuccessRate >= 0.5
                  ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700"
                  : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700"
            }`}
          >
            {t.lifecycleMCSuccess(successPct)}
          </div>
          {p50Age !== null && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {t.lifecycleMCYearsToFire}:
              </span>{" "}
              {t.lifecycleMCP50Years(String(p50Age))}
              {p10Age !== null && p90Age !== null && (
                <span className="ml-2">
                  {t.lifecycleMCRange(
                    String(p10Age),
                    String(p90Age),
                  )}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
          <defs>
            <linearGradient id="lmc90" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.08} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="lmc75" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="lmc50" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="lmc25" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="lmc10" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-20" />
          <XAxis
            dataKey="age"
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
          <Tooltip content={<ChartTooltipContent formatValue={formatCurrency} />} />

          {/* FIRE target horizontal line */}
          <ReferenceLine
            y={fireTarget}
            stroke="#6366f1"
            strokeDasharray="6 3"
            strokeWidth={1.5}
            label={{
              value: t.chartTarget(yAxisFormatter(fireTarget)),
              position: "insideTopRight",
              fontSize: 11,
              fill: "#6366f1",
            }}
          />

          {/* Median FIRE age vertical line */}
          {fireRefAge !== null && (
            <ReferenceLine
              x={fireRefAge}
              stroke="#10b981"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{
                value: t.lifecycleMCFireLine,
                position: "top",
                fontSize: 10,
                fill: "#10b981",
              }}
            />
          )}

          <Area
            type="monotone"
            dataKey="p90"
            stroke="#10b981"
            strokeWidth={1}
            strokeDasharray="4 2"
            fill="url(#lmc90)"
            name={t.monteCarloP90}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="p75"
            stroke="#10b981"
            strokeWidth={1}
            fill="url(#lmc75)"
            name={t.monteCarloP75}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="p50"
            stroke="#047857"
            strokeWidth={2.5}
            fill="url(#lmc50)"
            name={t.monteCarloMedian}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="p25"
            stroke="#f59e0b"
            strokeWidth={1}
            fill="url(#lmc25)"
            name={t.monteCarloP25}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="p10"
            stroke="#ef4444"
            strokeWidth={1}
            strokeDasharray="4 2"
            fill="url(#lmc10)"
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
