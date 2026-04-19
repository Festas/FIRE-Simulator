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
  Legend,
  Line,
  ComposedChart,
} from "recharts";
import { FireResult, FireInputs } from "@/lib/fireCalculations";
import { useI18n } from "@/lib/i18n";
import { ChartTooltipContent } from "@/app/components/ChartTooltip";
import { yAxisFormatter } from "@/lib/chartUtils";

interface DrawdownChartProps {
  result: FireResult;
  inputs: FireInputs;
}

export default function DrawdownChart({ result, inputs }: DrawdownChartProps) {
  const { t, formatCurrency } = useI18n();
  const { drawdownData, drawdownSurvives, drawdownDepletionYear, fullFireYear, fullFireAge, monteCarlo } = result;

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

  const annualWithdrawal = drawdownData[0]?.annualWithdrawal ?? 0;
  const exitAge = fullFireAge ?? 0;
  const successPct = (monteCarlo.successRate * 100).toFixed(1);

  // Build merged chart data: MC percentile bands + deterministic line
  const chartData = monteCarlo.years.map((year, i) => {
    const deterministicPoint = drawdownData[i];
    return {
      age: exitAge + i + 1,
      year,
      p90: monteCarlo.percentiles.p90[i],
      p75: monteCarlo.percentiles.p75[i],
      p50: monteCarlo.percentiles.p50[i],
      p25: monteCarlo.percentiles.p25[i],
      p10: monteCarlo.percentiles.p10[i],
      deterministic: deterministicPoint ? Math.round(deterministicPoint.totalReal) : undefined,
    };
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-[#0f294d] dark:text-white">{t.drawdownTitle}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {inputs.entnahmeModell === "ewigeRente"
              ? t.drawdownPerpetualSub(formatCurrency(inputs.monatlichesWunschEinkommen))
              : t.drawdownSpendSub(inputs.kapitalverzehrJahre)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
            monteCarlo.successRate >= 0.8
              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700"
              : monteCarlo.successRate >= 0.5
                ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700"
                : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700"
          }`}>
            {t.monteCarloSuccess(successPct)}
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
            {t.monteCarloSimulations}
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
          <defs>
            <linearGradient id="ddMc90" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.08} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="ddMc75" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="ddMc50" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="ddMc25" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="ddMc10" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-20" />
          <XAxis dataKey="age" tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={yAxisFormatter} tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={55} />
          <Tooltip content={<ChartTooltipContent formatValue={formatCurrency} />} />
          <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1} />
          {/* MC percentile bands — outermost to innermost */}
          <Area
            type="monotone"
            dataKey="p90"
            stroke="#10b981"
            strokeWidth={1}
            strokeDasharray="4 2"
            fill="url(#ddMc90)"
            name={t.monteCarloP90}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="p75"
            stroke="#10b981"
            strokeWidth={1}
            fill="url(#ddMc75)"
            name={t.monteCarloP75}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="p50"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#ddMc50)"
            name={t.monteCarloMedian}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="p25"
            stroke="#f59e0b"
            strokeWidth={1}
            fill="url(#ddMc25)"
            name={t.monteCarloP25}
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="p10"
            stroke="#ef4444"
            strokeWidth={1}
            strokeDasharray="4 2"
            fill="url(#ddMc10)"
            name={t.monteCarloP10}
            dot={false}
          />
          {/* Deterministic line on top */}
          <Line
            type="monotone"
            dataKey="deterministic"
            stroke="#0f294d"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
            name={t.drawdownDeterministic}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
            iconType="line"
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Withdrawal info as text */}
      {annualWithdrawal > 0 && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
          {t.drawdownWithdrawalInfo(formatCurrency(Math.round(annualWithdrawal)))}
        </p>
      )}
    </div>
  );
}
