"use client";

import React, { useState } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Legend,
} from "recharts";
import { FireResult, FireInputs, YearDataPoint } from "@/lib/fireCalculations";
import { useI18n } from "@/lib/i18n";
import { ChartTooltipContent } from "@/app/components/ChartTooltip";
import { yAxisFormatter } from "@/lib/chartUtils";

interface FireChartProps {
  result: FireResult;
  inputs: FireInputs;
  zielvermoegen: number;
  showNominal?: boolean;
}

export default function FireChart({ result, inputs, zielvermoegen, showNominal = false }: FireChartProps) {
  const [showNoInvestment, setShowNoInvestment] = useState(false);
  const { t, formatCurrency } = useI18n();
  const {
    yearlyData,
    drawdownData,
    coastFireYear,
    fullFireYear,
    lzkStartYear,
    coastFireCalendarYear,
    fullFireCalendarYear,
    lzkStartCalendarYear,
    noInvestmentData,
    coastFireAge,
    fullFireAge,
    lzkSabbaticalStartAge,
    freistellungStartAge,
    freistellungEndAge,
  } = result;

  const pensionAge = inputs.renteneintrittsalter ?? 67;

  /** Return total portfolio value from a data point respecting the nominal/real toggle */
  const totalValue = (d: YearDataPoint) =>
    showNominal ? d.etfBalanceNominal + d.lzkBalanceNominal : d.totalReal;

  // ---------------------------------------------------------------------------
  // Merge accumulation + drawdown data into one continuous lifecycle dataset
  // ---------------------------------------------------------------------------
  const accEnd = fullFireYear !== null ? fullFireYear : yearlyData.length - 1;

  // Accumulation data points
  const accData = yearlyData.slice(0, accEnd + 1).map((d: YearDataPoint, i: number) => ({
    age: d.age,
    year: d.calendarYear,
    portfolio: Math.round(totalValue(d)),
    etf: Math.round(showNominal ? d.etfBalanceNominal : d.etfBalanceReal),
    lzk: Math.round(showNominal ? d.lzkBalanceNominal : d.lzkBalanceReal),
    withdrawal: undefined as number | undefined,
    noInvestment: noInvestmentData[i] ? Math.round(totalValue(noInvestmentData[i])) : undefined,
    isDrawdown: false,
  }));

  // Drawdown data points
  const ddData = drawdownData.map((d: YearDataPoint) => {
    const nominal = d.etfBalanceNominal;
    const real = d.totalReal;
    // Derive inflation factor from balance: nominal / real = Math.pow(1+inf, years)
    // Dividing nominal withdrawal by this converts to today's purchasing power
    const inflationFactor = nominal > 0 && real > 0 ? nominal / real : 1;
    const withdrawalDisplay = showNominal
      ? d.annualWithdrawal
      : inflationFactor > 0 ? d.annualWithdrawal / inflationFactor : d.annualWithdrawal;
    return {
      age: d.age,
      year: d.calendarYear,
      portfolio: Math.round(showNominal ? nominal : real),
      etf: undefined as number | undefined,
      lzk: undefined as number | undefined,
      withdrawal: Math.round(withdrawalDisplay),
      noInvestment: undefined as number | undefined,
      isDrawdown: true,
    };
  });

  const chartData = [...accData, ...ddData];

  // Determine display range — show up to a reasonable end age
  const startAge = yearlyData[0]?.age ?? inputs.currentAge;
  const lastAge = chartData.length > 0 ? chartData[chartData.length - 1].age : startAge + 50;
  const fireAge = fullFireAge ?? lastAge;

  // ---------------------------------------------------------------------------
  // Milestone vertical reference lines
  // ---------------------------------------------------------------------------
  const milestoneLines = [
    coastFireYear !== null && coastFireAge !== null && coastFireAge < fireAge && {
      age: coastFireAge,
      label: t.coastFireLabel,
      color: "#10b981",
      year: coastFireCalendarYear,
    },
    freistellungStartAge !== null && {
      age: freistellungStartAge,
      label: t.chartLabelLZK,
      color: "#f59e0b",
      year: null,
    },
    freistellungEndAge !== null && {
      age: freistellungEndAge,
      label: t.phaseCoast,
      color: "#7c3aed",
      year: null,
    },
    lzkStartYear > 0 && freistellungStartAge === null && {
      age: lzkSabbaticalStartAge,
      label: t.chartLabelLZK,
      color: "#f59e0b",
      year: lzkStartCalendarYear,
    },
    fullFireYear !== null && fullFireAge !== null && {
      age: fullFireAge,
      label: t.fullFireLabel,
      color: "#6366f1",
      year: fullFireCalendarYear,
    },
    // Pension age milestone (only if it falls within the chart range and after FIRE)
    fullFireYear !== null && pensionAge > fireAge && pensionAge <= lastAge && {
      age: pensionAge,
      label: t.chartPensionLabel,
      color: "#3b82f6",
      year: null,
    },
  ].filter(Boolean) as { age: number; label: string; color: string; year: number | null }[];

  // Phase boundaries for background shading
  const hasDrawdown = fullFireYear !== null && ddData.length > 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-[#0f294d] dark:text-white">{t.chartTitle}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.chartSubtitle}</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={() => setShowNoInvestment((p) => !p)}
            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
              showNoInvestment
                ? "bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-300"
                : "bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600"
            }`}
            title={t.noInvestmentTooltip}
          >
            {t.noInvestmentLabel}
          </button>
        </div>
      </div>

      {/* Phase legend badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          {t.chartPhaseAccumulation}
        </span>
        {hasDrawdown && (
          <>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {t.chartPhaseWithdrawal}
            </span>
            {pensionAge > fireAge && pensionAge <= lastAge && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                {t.chartPhasePension}
              </span>
            )}
          </>
        )}
      </div>

      <ResponsiveContainer width="100%" height={420}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
          <defs>
            <linearGradient id="etfGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="lzkGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0f294d" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#0f294d" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="withdrawalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-20" />
          <XAxis dataKey="age" tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={yAxisFormatter} tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={55} />
          <Tooltip content={<ChartTooltipContent formatValue={formatCurrency} />} />

          {/* Phase background shading */}
          {hasDrawdown && (
            <ReferenceArea
              x1={fireAge}
              x2={pensionAge <= lastAge ? Math.min(pensionAge, lastAge) : lastAge}
              fill="#f59e0b"
              fillOpacity={0.04}
              ifOverflow="extendDomain"
            />
          )}
          {hasDrawdown && pensionAge > fireAge && pensionAge <= lastAge && (
            <ReferenceArea
              x1={pensionAge}
              x2={lastAge}
              fill="#3b82f6"
              fillOpacity={0.04}
              ifOverflow="extendDomain"
            />
          )}

          {/* Target line */}
          <ReferenceLine y={zielvermoegen} stroke="#6366f1" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: t.chartTarget(yAxisFormatter(zielvermoegen)), position: "insideTopRight", fontSize: 11, fill: "#6366f1" }} />

          {/* Milestone vertical lines */}
          {milestoneLines.map((m) => (
            <ReferenceLine key={m.label} x={m.age} stroke={m.color} strokeDasharray="4 3" strokeWidth={1.5} label={{ value: m.label, position: "top", fontSize: 10, fill: m.color, angle: -45, offset: 10 }} />
          ))}

          {/* Portfolio value — continuous area across entire lifecycle */}
          <Area
            type="monotone"
            dataKey="portfolio"
            stroke="#0f294d"
            strokeWidth={2.5}
            fill="url(#portfolioGradient)"
            name={t.chartLabelPortfolio}
            dot={false}
            activeDot={{ r: 5 }}
          />

          {/* Withdrawal amount — only visible during drawdown phase */}
          {hasDrawdown && (
            <Area
              type="monotone"
              dataKey="withdrawal"
              stroke="#f59e0b"
              strokeWidth={1.5}
              fill="url(#withdrawalGradient)"
              name={t.chartLabelWithdrawal}
              dot={false}
              activeDot={{ r: 3 }}
            />
          )}

          {/* No-investment comparison */}
          {showNoInvestment && (
            <Line type="monotone" dataKey="noInvestment" stroke="#f97316" strokeWidth={2} strokeDasharray="6 3" dot={false} name={t.chartLabelNoInvestment} />
          )}

          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} iconType="circle" />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Milestone badges */}
      <div className="flex flex-wrap gap-3 mt-4">
        {milestoneLines.map((m) => (
          <div key={m.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
            <span className="text-slate-700 dark:text-slate-300">{m.label} · {t.kpiAgeLabel(m.age)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
