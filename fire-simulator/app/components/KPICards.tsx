"use client";

import React from "react";
import { FireResult, FireInputs } from "@/lib/fireCalculations";
import { useI18n } from "@/lib/i18n";

interface KPICardProps {
  icon: string;
  iconLabel: string;
  title: string;
  value: string;
  sub?: string;
  accent?: boolean;
  warning?: boolean;
}

function KPICard({ icon, iconLabel, title, value, sub, accent, warning }: KPICardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-lg" role="img" aria-label={iconLabel}>{icon}</span>
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
  const { t, formatCurrency, formatCurrencyShort } = useI18n();
  const {
    coastFireCalendarYear,
    fullFireYear,
    passiveIncomeAtExit,
    targetReached,
    swRate,
    lzkStartCalendarYear,
    coastFireAmount,
    requiredSparrate,
    sparquote,
    drawdownSurvives,
    drawdownDepletionYear,
    derivedFireNumber,
    monteCarlo,
    coastFireAge,
    fullFireAge,
    lzkSabbaticalStartAge,
    freistellungStartAge,
    freistellungEndAge,
    freistellungJahre,
  } = result;

  const coastLabel = coastFireAge
    ? `${t.kpiAgeLabel(coastFireAge)}`
    : t.kpiOver30Years;

  const fullLabel = targetReached && fullFireAge
    ? `${t.kpiAgeLabel(fullFireAge)}`
    : t.kpiSavingsRateIncrease;

  const incomeLabel = formatCurrency(passiveIncomeAtExit) + ` ${t.perMonth}`;
  const years = fullFireYear !== null ? fullFireYear : 0;

  const drawdownLabel = drawdownSurvives
    ? t.kpiPortfolioSurvives
    : drawdownDepletionYear
      ? t.kpiPortfolioDepleted(drawdownDepletionYear)
      : "—";

  const mcSuccessPct = (monteCarlo.successRate * 100).toFixed(0);

  const coastSub = coastFireCalendarYear
    ? `${coastFireCalendarYear} · ${t.kpiThreshold(formatCurrencyShort(coastFireAmount))}`
    : t.kpiThreshold(formatCurrencyShort(coastFireAmount));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 mb-6">
      {/* Row 1 */}
      <KPICard
        icon="🎯"
        iconLabel={t.kpiFullFire}
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
        iconLabel={t.kpiPassiveIncome}
        title={t.kpiPassiveIncome}
        value={incomeLabel}
        sub={`SWR ${swRate.toFixed(1)}%`}
        accent
      />
      <KPICard
        icon="🏖️"
        iconLabel={t.kpiCoastFire}
        title={t.kpiCoastFire}
        value={coastLabel}
        sub={coastSub}
        accent={!!coastFireCalendarYear}
      />
      <KPICard
        icon="📊"
        iconLabel={t.kpiFireNumber}
        title={t.kpiFireNumber}
        value={formatCurrencyShort(derivedFireNumber)}
        sub={t.kpiGapPerMonth(formatCurrency(Math.max(0, inputs.monatlichesWunschEinkommen - inputs.gesetzlicheRente)))}
      />

      {/* Row 2 */}
      <KPICard
        icon="📈"
        iconLabel={t.kpiDrawdownPhase}
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
        iconLabel={t.kpiMonteCarlo}
        title={t.kpiMonteCarlo}
        value={`${mcSuccessPct}%`}
        sub={t.monteCarloSimulations}
        accent={monteCarlo.successRate >= 0.8}
        warning={monteCarlo.successRate < 0.5}
      />
      <KPICard
        icon="💡"
        iconLabel={t.kpiRequiredSavings}
        title={t.kpiRequiredSavings}
        value={`${formatCurrency(requiredSparrate)} / M`}
        sub={t.kpiCurrentSavings(formatCurrency(inputs.monatlicheSparrate))}
        accent={inputs.monatlicheSparrate >= requiredSparrate}
        warning={inputs.monatlicheSparrate < requiredSparrate}
      />
      <KPICard
        icon="⏳"
        iconLabel={t.kpiSavingsRate}
        title={t.kpiSavingsRate}
        value={`${sparquote.toFixed(1)}%`}
        sub={
          sparquote > 0
            ? t.kpiSavingsRateSub(formatCurrency(inputs.monatlicheSparrate), formatCurrency(inputs.monatlichesNetto))
            : undefined
        }
        accent={sparquote >= 30}
      />
      {inputs.arbeitszeitkontoEnabled && freistellungStartAge !== null ? (
        <>
          <KPICard
            icon="🏖️"
            iconLabel={t.kpiFreistellungStart}
            title={t.kpiFreistellungStart}
            value={t.kpiAgeLabel(freistellungStartAge)}
            sub={t.kpiFreistellungDuration(freistellungJahre.toFixed(1))}
          />
          {freistellungEndAge !== null && (
            <KPICard
              icon="🔄"
              iconLabel={t.kpiFreistellungEnd}
              title={t.kpiFreistellungEnd}
              value={t.kpiAgeLabel(freistellungEndAge)}
              sub={t.kpiFreistellungEndSub}
            />
          )}
        </>
      ) : (
        <KPICard
          icon="🔒"
          iconLabel={t.kpiLzkStart}
          title={t.kpiLzkStart}
          value={t.kpiAgeLabel(lzkSabbaticalStartAge)}
          sub={`${lzkStartCalendarYear} · ${t.kpiLzkStartSub}`}
        />
      )}
    </div>
  );
}
