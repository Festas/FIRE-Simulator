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
  Legend,
} from "recharts";
import { calculateReverse, FireInputs, ReverseResult } from "@/lib/fireCalculations";
import { useI18n } from "@/lib/i18n";
import { ChartTooltipContent } from "@/app/components/ChartTooltip";
import { yAxisFormatter } from "@/lib/chartUtils";
import SliderField from "@/app/components/ui/SliderField";

interface ReversePlannerProps {
  inputs: FireInputs;
}

export default function ReversePlanner({ inputs }: ReversePlannerProps) {
  const { t, formatCurrency, formatCurrencyShort } = useI18n();

  const [targetIncome, setTargetIncome] = useState(inputs.monatlichesWunschEinkommen);
  const [exitAge, setExitAge] = useState(inputs.currentAge + 15);
  const [statePension, setStatePension] = useState(inputs.gesetzlicheRente);
  const [startCapital, setStartCapital] = useState(inputs.startKapital);
  const [returnRate, setReturnRate] = useState(inputs.etfRendite);
  const [inflationRate, setInflationRate] = useState(inputs.inflation);
  const [swrRate, setSwrRate] = useState(inputs.swr);
  const [showScenarios, setShowScenarios] = useState(false);
  const [showCurrentComparison, setShowCurrentComparison] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);

  const targetYears = Math.max(5, exitAge - inputs.currentAge);

  const reverseResult: ReverseResult = useMemo(
    () =>
      calculateReverse(
        targetIncome,
        targetYears,
        statePension,
        startCapital,
        returnRate,
        inflationRate,
        swrRate,
        inputs.dynamikSparrate,
        inputs.bavJaehrlich,
        inputs.steuerModell,
        inputs.kirchensteuer,
        inputs.entnahmeModell,
        inputs.kapitalverzehrJahre,
        inputs.taxCountry,
        inputs.lifeEvents,
        inputs.monatlicheSparrate,
        inputs.monatlichesNetto,
        inputs.currentAge,
        inputs.renteneintrittsalter,
      ),
    [
      targetIncome,
      targetYears,
      statePension,
      startCapital,
      returnRate,
      inflationRate,
      swrRate,
      inputs.dynamikSparrate,
      inputs.bavJaehrlich,
      inputs.steuerModell,
      inputs.kirchensteuer,
      inputs.entnahmeModell,
      inputs.kapitalverzehrJahre,
      inputs.taxCountry,
      inputs.lifeEvents,
      inputs.monatlicheSparrate,
      inputs.monatlichesNetto,
      inputs.currentAge,
      inputs.renteneintrittsalter,
    ],
  );

  const mcPct = reverseResult.monteCarlo.successRate * 100;
  const mcLabel = mcPct.toFixed(0) + "%";
  const mcRecPct = reverseResult.mcSuccessRate * 100;

  // Accumulation chart data with scenario bands
  const chartData = reverseResult.yearlyProjection.map((d, i) => {
    const entry: Record<string, number> = {
      age: d.age,
      year: d.calendarYear,
      totalReal: Math.round(d.totalReal),
    };
    if (showScenarios) {
      const optData = reverseResult.scenarioOptimistic[i];
      const pesData = reverseResult.scenarioPessimistic[i];
      if (optData) entry.optimistic = Math.round(optData.totalReal);
      if (pesData) entry.pessimistic = Math.round(pesData.totalReal);
    }
    if (showCurrentComparison && reverseResult.currentProjection) {
      const curData = reverseResult.currentProjection[i];
      if (curData) entry.currentSavings = Math.round(curData.totalReal);
    }
    return entry;
  });

  // Monte Carlo drawdown chart data
  const mcChartData = reverseResult.monteCarlo.years.map((year, i) => ({
    age: exitAge + i + 1,
    year,
    p90: reverseResult.monteCarlo.percentiles.p90[i],
    p75: reverseResult.monteCarlo.percentiles.p75[i],
    p50: reverseResult.monteCarlo.percentiles.p50[i],
    p25: reverseResult.monteCarlo.percentiles.p25[i],
    p10: reverseResult.monteCarlo.percentiles.p10[i],
  }));

  // Drawdown chart data
  const drawdownData = reverseResult.drawdownData.map((d) => ({
    age: d.age,
    year: d.calendarYear,
    portfolio: Math.round(d.totalReal),
    withdrawal: Math.round(d.annualWithdrawal),
  }));

  // Accumulation Monte Carlo fan chart data
  const accMc = reverseResult.accumulationMonteCarlo;
  const accMcChartData = accMc.accumulationYears
    .slice(0, targetYears)
    .map((year, i) => ({
      age: inputs.currentAge + i + 1,
      year,
      p90: accMc.accumulationPercentiles.p90[i],
      p75: accMc.accumulationPercentiles.p75[i],
      p50: accMc.accumulationPercentiles.p50[i],
      p25: accMc.accumulationPercentiles.p25[i],
      p10: accMc.accumulationPercentiles.p10[i],
    }));

  // Savings rate (based on MC-recommended savings)
  const savingsRate = inputs.monatlichesNetto > 0
    ? ((reverseResult.mcRecommendedSavings / inputs.monatlichesNetto) * 100).toFixed(1)
    : null;

  // Detail table data (accumulation + drawdown)
  const tableData = [
    ...reverseResult.yearlyProjection.slice(1, targetYears + 1),
    ...reverseResult.drawdownData,
  ];

  return (
    <div className="space-y-6">
      {/* Main Card — Inputs + KPIs */}
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

        {/* Input Sliders — 2×2 + 3 additional grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-8">
          <SliderField
            variant="panel"
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
            variant="panel"
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
            variant="panel"
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
            variant="panel"
            label={t.reverseExitAge}
            subLabel={t.reverseExitAgeSub}
            value={exitAge}
            min={inputs.currentAge + 5}
            max={inputs.currentAge + 40}
            step={1}
            onChange={setExitAge}
            format={(v) => `${v} ${t.years}`}
          />
          <SliderField
            variant="panel"
            label={t.reverseReturnRate}
            subLabel={t.reverseReturnRateSub}
            value={returnRate}
            min={1}
            max={12}
            step={0.5}
            onChange={setReturnRate}
            format={(v) => `${v.toFixed(1)}%`}
          />
          <SliderField
            variant="panel"
            label={t.reverseInflation}
            subLabel={t.reverseInflationSub}
            value={inflationRate}
            min={0}
            max={6}
            step={0.5}
            onChange={setInflationRate}
            format={(v) => `${v.toFixed(1)}%`}
          />
          <SliderField
            variant="panel"
            label={t.reverseSwr}
            subLabel={t.reverseSwrSub}
            value={swrRate}
            min={2}
            max={6}
            step={0.25}
            onChange={setSwrRate}
            format={(v) => `${v.toFixed(2)}%`}
          />
        </div>

        {/* KPI Results — 2 rows */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {/* MC-Recommended Monthly Savings (primary) */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t.reverseMcRecommendedSavings}
            </span>
            <span className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {formatCurrency(reverseResult.mcRecommendedSavings)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t.reverseMcRecommendedSavingsSub}
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

          {/* MC Success Rate Badge */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t.reverseMcSuccessRate}
            </span>
            <span
              className={`text-xl font-bold tracking-tight ${
                mcRecPct >= 75
                  ? "text-emerald-600 dark:text-emerald-400"
                  : mcRecPct >= 50
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-red-600 dark:text-red-400"
              }`}
            >
              {t.reverseMcConfidenceBadge(mcRecPct)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t.reverseMcSuccessRateSub}
            </span>
          </div>
        </div>

        {/* Second KPI row — additional metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Deterministic Savings (secondary) */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t.reverseDeterministicSavings}
            </span>
            <span className="text-xl font-bold tracking-tight text-[#0f294d] dark:text-white">
              {formatCurrency(reverseResult.requiredMonthlySavings)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t.reverseDeterministicSavingsSub}
            </span>
          </div>

          {/* Passive Income at FIRE */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t.reversePassiveIncome}
            </span>
            <span className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {formatCurrency(reverseResult.passiveIncomeAtFire)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t.reversePassiveIncomeSub}
            </span>
          </div>

          {/* Monte Carlo Drawdown Success */}
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

        {/* Third KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Total Tax Paid */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t.reverseTotalTaxPaid}
            </span>
            <span className="text-xl font-bold tracking-tight text-red-500 dark:text-red-400">
              {formatCurrencyShort(reverseResult.totalTaxPaid)}
            </span>
          </div>

          {/* Coast FIRE / Savings Rate */}
          {reverseResult.coastFireYear !== null ? (
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {t.reverseCoastFireYear}
              </span>
              <span className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                {new Date().getFullYear() + reverseResult.coastFireYear}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t.reverseCoastFireYearSub}
              </span>
            </div>
          ) : savingsRate !== null ? (
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {t.reverseSavingsRate}
              </span>
              <span className="text-xl font-bold tracking-tight text-[#0f294d] dark:text-white">
                {savingsRate}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t.reverseSavingsRateSub(
                  formatCurrency(reverseResult.mcRecommendedSavings),
                  formatCurrency(inputs.monatlichesNetto),
                )}
              </span>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {t.reverseCoastFireYear}
              </span>
              <span className="text-xl font-bold tracking-tight text-slate-400 dark:text-slate-500">
                {t.reverseCoastFireNone}
              </span>
            </div>
          )}

          {/* Empty cell for alignment */}
          <div />
        </div>

        {/* Projection Chart with toggle buttons */}
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-[#0f294d] dark:text-white">
                {t.reverseProjectionTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.reverseProjectionSubtitle}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowScenarios((p) => !p)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  showScenarios
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700"
                    : "text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                {showScenarios ? t.chartScenariosHide : t.chartScenarios}
              </button>
              {reverseResult.currentProjection && (
                <button
                  onClick={() => setShowCurrentComparison((p) => !p)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    showCurrentComparison
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700"
                      : "text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {t.reverseCurrentVsRequired}
                </button>
              )}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="reverseGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="reverseOpt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-20" />
              <XAxis
                dataKey="age"
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
              <Tooltip content={<ChartTooltipContent formatValue={formatCurrency} />} />
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
              {showScenarios && (
                <>
                  <Area
                    type="monotone"
                    dataKey="optimistic"
                    stroke="#10b981"
                    strokeWidth={1}
                    strokeDasharray="4 2"
                    fill="url(#reverseOpt)"
                    name={t.chartLabelOptimistic}
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="pessimistic"
                    stroke="#f59e0b"
                    strokeWidth={1}
                    strokeDasharray="4 2"
                    fill="none"
                    name={t.chartLabelPessimistic}
                    dot={false}
                  />
                </>
              )}
              {showCurrentComparison && reverseResult.currentProjection && (
                <Area
                  type="monotone"
                  dataKey="currentSavings"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  strokeDasharray="6 3"
                  fill="none"
                  name={t.reverseCurrentLine}
                  dot={false}
                />
              )}
              <Area
                type="monotone"
                dataKey="totalReal"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#reverseGreen)"
                name={t.reverseRequiredLine}
                dot={false}
              />
              {(showScenarios || showCurrentComparison) && (
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
                  iconType="line"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Accumulation Monte Carlo Fan Chart */}
      {accMcChartData.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold text-[#0f294d] dark:text-white">
                {t.reverseAccMcTitle}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t.reverseAccMcSubtitle}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  mcRecPct >= 75
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700"
                    : mcRecPct >= 50
                      ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700"
                      : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700"
                }`}
              >
                {t.reverseMcConfidenceBadge(mcRecPct)}
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={accMcChartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="accMc90" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="accMc75" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="accMc50" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-20" />
              <XAxis dataKey="age" tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={yAxisFormatter} tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={55} />
              <Tooltip content={<ChartTooltipContent formatValue={formatCurrency} />} />
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
              <Area type="monotone" dataKey="p90" stroke="#10b981" strokeWidth={1} strokeDasharray="4 2" fill="url(#accMc90)" name={t.monteCarloP90} dot={false} />
              <Area type="monotone" dataKey="p75" stroke="#10b981" strokeWidth={1} fill="url(#accMc75)" name={t.monteCarloP75} dot={false} />
              <Area type="monotone" dataKey="p50" stroke="#0f294d" strokeWidth={2.5} fill="url(#accMc50)" name={t.monteCarloMedian} dot={false} />
              <Area type="monotone" dataKey="p25" stroke="#f59e0b" strokeWidth={1} fill="none" name={t.monteCarloP25} dot={false} />
              <Area type="monotone" dataKey="p10" stroke="#ef4444" strokeWidth={1} strokeDasharray="4 2" fill="none" name={t.monteCarloP10} dot={false} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} iconType="line" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Drawdown Phase Chart */}
      {drawdownData.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold text-[#0f294d] dark:text-white">
                {t.reverseDrawdownTitle}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t.reverseDrawdownSubtitle}
              </p>
            </div>
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                reverseResult.drawdownSurvives
                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700"
                  : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700"
              }`}
            >
              {reverseResult.drawdownSurvives
                ? t.reverseDrawdownSurvives
                : t.reverseDrawdownDepleted(reverseResult.drawdownDepletionYear ?? 0)}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={drawdownData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="revDrawdownGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={reverseResult.drawdownSurvives ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={reverseResult.drawdownSurvives ? "#10b981" : "#ef4444"} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-20" />
              <XAxis dataKey="age" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={yAxisFormatter} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={55} />
              <Tooltip content={<ChartTooltipContent formatValue={formatCurrency} />} />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1} />
              <Area
                type="monotone"
                dataKey="portfolio"
                stroke={reverseResult.drawdownSurvives ? "#10b981" : "#ef4444"}
                strokeWidth={2.5}
                fill="url(#revDrawdownGrad)"
                name={t.chartLabelPortfolio}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="withdrawal"
                stroke="#f59e0b"
                strokeWidth={1.5}
                fill="none"
                name={t.chartLabelWithdrawal}
                dot={false}
                strokeDasharray="4 2"
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} iconType="line" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Monte Carlo Drawdown Fan Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold text-[#0f294d] dark:text-white">
              {t.reverseMonteCarloTitle}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t.reverseMonteCarloSubtitle}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                mcPct >= 80
                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700"
                  : mcPct >= 50
                    ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700"
                    : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700"
              }`}
            >
              {mcLabel}
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={mcChartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
            <defs>
              <linearGradient id="revMc90" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.08} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="revMc75" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.03} />
              </linearGradient>
              <linearGradient id="revMc50" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-20" />
            <XAxis dataKey="age" tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={yAxisFormatter} tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={55} />
            <Tooltip content={<ChartTooltipContent formatValue={formatCurrency} />} />
            <Area type="monotone" dataKey="p90" stroke="#10b981" strokeWidth={1} strokeDasharray="4 2" fill="url(#revMc90)" name={t.monteCarloP90} dot={false} />
            <Area type="monotone" dataKey="p75" stroke="#10b981" strokeWidth={1} fill="url(#revMc75)" name={t.monteCarloP75} dot={false} />
            <Area type="monotone" dataKey="p50" stroke="#0f294d" strokeWidth={2.5} fill="url(#revMc50)" name={t.monteCarloMedian} dot={false} />
            <Area type="monotone" dataKey="p25" stroke="#f59e0b" strokeWidth={1} fill="none" name={t.monteCarloP25} dot={false} />
            <Area type="monotone" dataKey="p10" stroke="#ef4444" strokeWidth={1} strokeDasharray="4 2" fill="none" name={t.monteCarloP10} dot={false} />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} iconType="line" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sensitivity Analysis */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#0f294d] dark:text-white">
            {t.reverseSensitivityTitle}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t.reverseSensitivitySubtitle}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
                <th scope="col" className="px-4 py-3 text-left font-semibold">{t.reverseSensitivityReturn}</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">{t.reverseSensitivitySavings}</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">{t.reverseSensitivityFireNum}</th>
              </tr>
            </thead>
            <tbody>
              {reverseResult.sensitivity.map((row) => (
                <tr
                  key={row.returnRate}
                  className={`border-t border-slate-100 dark:border-slate-700 ${
                    Math.abs(row.returnRate - returnRate) < 0.01
                      ? "bg-emerald-50 dark:bg-emerald-900/20 font-semibold"
                      : "hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{row.returnRate.toFixed(0)}%</td>
                  <td className="px-4 py-2.5 text-right text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(row.requiredSavings)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-400">
                    {formatCurrencyShort(row.fireNumber)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collapsible Year-by-Year Table */}
      {tableData.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <button
            onClick={() => setTableOpen((p) => !p)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <div>
              <h2 className="text-lg font-bold text-[#0f294d] dark:text-white text-left">
                {t.reverseTableTitle}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-left">
                {t.reverseTableSubtitle}
              </p>
            </div>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${tableOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {tableOpen && (
            <div className="overflow-x-auto border-t border-slate-100 dark:border-slate-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th scope="col" className="px-4 py-3 text-left font-semibold">{t.tableYear}</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">{t.tableEtf}</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">{t.tableTotal}</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">{t.tableSavingsMonth}</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">{t.tableTaxes}</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">{t.tableWithdrawal}</th>
                    <th scope="col" className="px-4 py-3 text-center font-semibold">{t.tablePhase}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((d) => (
                    <tr
                      key={d.calendarYear}
                      className={`border-t border-slate-50 dark:border-slate-700 ${
                        d.isDrawdownPhase
                          ? "bg-amber-50/50 dark:bg-amber-900/10"
                          : ""
                      } hover:bg-slate-50 dark:hover:bg-slate-700`}
                    >
                      <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">
                        {d.calendarYear}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-400">
                        {formatCurrency(d.etfBalanceReal)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-[#0f294d] dark:text-white">
                        {formatCurrency(d.totalReal)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-400">
                        {d.monthlySavings > 0 ? formatCurrency(d.monthlySavings) : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-red-500 dark:text-red-400">
                        {d.taxPaid > 0 ? formatCurrency(d.taxPaid) : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right text-amber-600 dark:text-amber-400">
                        {d.annualWithdrawal > 0 ? formatCurrency(d.annualWithdrawal) : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {d.isDrawdownPhase ? (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
                            {t.phaseWithdrawal}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                            {t.phaseSaving}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
