"use client";

import React, { useMemo, useState } from "react";
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
import { calculateReverse, FireInputs, ReverseResult } from "@/lib/fireCalculations";
import { useI18n } from "@/lib/i18n";
import { SimpleTooltipContent } from "@/app/components/ChartTooltip";
import { yAxisFormatter } from "@/lib/chartUtils";

interface ReversePlannerProps {
  inputs: FireInputs;
}

function SliderField({
  label,
  subLabel,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  subLabel?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
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

export default function ReversePlanner({ inputs }: ReversePlannerProps) {
  const { t, formatCurrency, formatCurrencyShort } = useI18n();

  const [targetIncome, setTargetIncome] = useState(inputs.monatlichesWunschEinkommen);
  const [targetYears, setTargetYears] = useState(15);
  const [statePension, setStatePension] = useState(inputs.gesetzlicheRente);
  const [startCapital, setStartCapital] = useState(inputs.startKapital);

  const reverseResult: ReverseResult = useMemo(
    () =>
      calculateReverse(
        targetIncome,
        targetYears,
        statePension,
        startCapital,
        inputs.etfRendite,
        inputs.inflation,
        inputs.swr,
        inputs.dynamikSparrate,
        inputs.bavJaehrlich,
        inputs.steuerModell,
        inputs.kirchensteuer,
        inputs.entnahmeModell,
        inputs.kapitalverzehrJahre,
        inputs.taxCountry,
      ),
    [
      targetIncome,
      targetYears,
      statePension,
      startCapital,
      inputs.etfRendite,
      inputs.inflation,
      inputs.swr,
      inputs.dynamikSparrate,
      inputs.bavJaehrlich,
      inputs.steuerModell,
      inputs.kirchensteuer,
      inputs.entnahmeModell,
      inputs.kapitalverzehrJahre,
      inputs.taxCountry,
    ],
  );

  const mcPct = reverseResult.monteCarlo.successRate * 100;
  const mcLabel = mcPct.toFixed(0) + "%";

  const chartData = reverseResult.yearlyProjection.map((d) => ({
    year: d.calendarYear,
    totalReal: Math.round(d.totalReal),
  }));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#0f294d] dark:text-white">
          {t.reversePlannerTitle}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t.reversePlannerSubtitle}
        </p>
      </div>

      {/* Input Sliders — 2×2 grid on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-8">
        <SliderField
          label={t.reverseTargetIncome}
          subLabel={t.reverseTargetIncomeSub}
          value={targetIncome}
          min={1000}
          max={15000}
          step={100}
          onChange={setTargetIncome}
          format={(v) => formatCurrency(v)}
        />
        <SliderField
          label={t.statePension}
          subLabel={t.statePensionSub}
          value={statePension}
          min={0}
          max={4000}
          step={50}
          onChange={setStatePension}
          format={(v) => formatCurrency(v)}
        />
        <SliderField
          label={t.startCapital}
          subLabel={t.startCapitalSub}
          value={startCapital}
          min={0}
          max={2000000}
          step={5000}
          onChange={setStartCapital}
          format={(v) => formatCurrencyShort(v)}
        />
        <SliderField
          label={t.reverseTargetYears}
          subLabel={t.reverseTargetYearsSub}
          value={targetYears}
          min={5}
          max={40}
          step={1}
          onChange={setTargetYears}
          format={(v) => `${v} ${t.years}`}
        />
      </div>

      {/* KPI Results — 3 cards in a row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Required Monthly Savings */}
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t.reverseResultSavings}
          </span>
          <span className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatCurrency(reverseResult.requiredMonthlySavings)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t.perMonth}
          </span>
        </div>

        {/* FIRE Number */}
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t.reverseResultFireNumber}
          </span>
          <span className="text-xl font-bold tracking-tight text-[#0f294d] dark:text-white">
            {formatCurrencyShort(reverseResult.fireNumber)}
          </span>
        </div>

        {/* Monte Carlo Success */}
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t.reverseResultMonteCarlo}
          </span>
          <span
            className={`text-xl font-bold tracking-tight ${
              mcPct >= 80
                ? "text-emerald-600 dark:text-emerald-400"
                : mcPct >= 50
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-red-600 dark:text-red-400"
            }`}
          >
            {mcLabel}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t.monteCarloSimulations}
          </span>
        </div>
      </div>

      {/* Projection Chart */}
      <div>
        <div className="mb-4">
          <h3 className="text-sm font-bold text-[#0f294d] dark:text-white">
            {t.reverseProjectionTitle}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.reverseProjectionSubtitle}
          </p>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="reverseGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-20" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={yAxisFormatter}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip content={<SimpleTooltipContent formatValue={formatCurrency} />} />
            <ReferenceLine
              y={reverseResult.fireNumber}
              stroke="#0f294d"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              label={{
                value: formatCurrencyShort(reverseResult.fireNumber),
                position: "right",
                fontSize: 11,
                fill: "#64748b",
              }}
            />
            <Area
              type="monotone"
              dataKey="totalReal"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#reverseGreen)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
