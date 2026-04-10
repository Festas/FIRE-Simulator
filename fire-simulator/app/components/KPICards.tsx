"use client";

import React from "react";
import { FireResult, FireInputs, formatEuro, formatEuroShort } from "@/lib/fireCalculations";
import { useI18n } from "@/lib/i18n";

interface KPICardProps {
  icon: string;
  title: string;
  value: string;
  sub?: string;
  accent?: boolean;
  warning?: boolean;
}

function KPICard({ icon, title, value, sub, accent, warning }: KPICardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {title}
        </span>
      </div>
      <div
        className={`text-xl font-bold tracking-tight ${
          warning
            ? "text-amber-600 dark:text-amber-400"
            : accent
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-[#0f294d] dark:text-white"
        }`}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-slate-500 dark:text-slate-400">{sub}</div>}
    </div>
  );
}

interface KPICardsProps {
  result: FireResult;
  inputs: FireInputs;
}

export default function KPICards({ result, inputs }: KPICardsProps) {
  const { t, formatCurrencyShort } = useI18n();
  const {
    coastFireCalendarYear,
    fullFireCalendarYear,
    fullFireYear,
    passiveIncomeAtExit,
    targetReached,
    swRate,
    lzkStartCalendarYear,
    coastFireAmount,
    requiredSparrate,
    sparquote,
    totalTaxPaid,
    drawdownSurvives,
    drawdownDepletionYear,
    derivedFireNumber,
    monteCarlo,
  } = result;

  const coastLabel = coastFireCalendarYear
    ? t.kpiYearLabel(coastFireCalendarYear)
    : t.kpiOver30Years;

  const fullLabel = targetReached && fullFireCalendarYear
    ? t.kpiYearLabel(fullFireCalendarYear)
    : t.kpiSavingsRateIncrease;

  const incomeLabel = formatEuro(passiveIncomeAtExit) + ` ${t.perMonth}`;
  const years = fullFireYear !== null ? fullFireYear : 0;

  const drawdownLabel = drawdownSurvives
    ? t.kpiPortfolioSurvives
    : drawdownDepletionYear
      ? t.kpiPortfolioDepleted(drawdownDepletionYear)
      : "—";

  const mcSuccessPct = (monteCarlo.successRate * 100).toFixed(0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {/* Row 1 */}
      <KPICard
        icon="🎯"
        title={t.kpiFullFire}
        value={fullLabel}
        sub={
          targetReached && years
            ? t.kpiTargetReached(years, formatCurrencyShort(inputs.zielvermoegen))
            : t.kpiTargetNotReached
        }
        accent={targetReached}
        warning={!targetReached}
      />
      <KPICard
        icon="💰"
        title={t.kpiPassiveIncome}
        value={incomeLabel}
        sub={`SWR ${swRate.toFixed(1)}%`}
        accent
      />
      <KPICard
        icon="🏖️"
        title={t.kpiCoastFire}
        value={coastLabel}
        sub={t.kpiThreshold(formatCurrencyShort(coastFireAmount))}
        accent={!!coastFireCalendarYear}
      />
      <KPICard
        icon="📊"
        title={t.kpiFireNumber}
        value={formatEuroShort(derivedFireNumber)}
        sub={t.kpiGapPerMonth(formatEuro(Math.max(0, inputs.monatlichesWunschEinkommen - inputs.gesetzlicheRente)))}
      />

      {/* Row 2 */}
      <KPICard
        icon="📈"
        title={t.kpiDrawdownPhase}
        value={drawdownLabel}
        sub={
          inputs.entnahmeModell === "kapitalverzehr"
            ? t.kpiCapitalSpend(inputs.kapitalverzehrJahre)
            : t.kpiPerpetualIncome
        }
        accent={drawdownSurvives}
        warning={!drawdownSurvives}
      />
      <KPICard
        icon="🎲"
        title="Monte Carlo"
        value={`${mcSuccessPct}%`}
        sub={t.monteCarloSimulations}
        accent={monteCarlo.successRate >= 0.8}
        warning={monteCarlo.successRate < 0.5}
      />
      <KPICard
        icon="💡"
        title={t.kpiRequiredSavings}
        value={`${formatEuro(requiredSparrate)} / M`}
        sub={t.kpiCurrentSavings(formatEuro(inputs.monatlicheSparrate))}
        accent={inputs.monatlicheSparrate >= requiredSparrate}
        warning={inputs.monatlicheSparrate < requiredSparrate}
      />
      <KPICard
        icon="⏳"
        title={sparquote > 0 ? t.kpiSavingsRate : t.kpiLzkStart}
        value={sparquote > 0 ? `${sparquote.toFixed(1)}%` : t.kpiYearLabel(lzkStartCalendarYear)}
        sub={
          sparquote > 0
            ? t.kpiSavingsRateSub(formatEuro(inputs.monatlicheSparrate), formatEuro(inputs.monatlichesBrutto))
            : t.kpiLzkStartSub
        }
        accent={sparquote >= 30}
      />
    </div>
  );
}
