"use client";

import React, { useRef, useEffect, useState } from "react";
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
  /** When "higher", an increase is green; when "lower", a decrease is green */
  direction?: "higher" | "lower";
}

/** Extract the first number found in a string (handles commas, dots, negatives). */
function extractNumber(s: string): number | null {
  const cleaned = s.replace(/[^0-9.\-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
}

/** Build a human-readable delta label from old and new value strings. */
function buildDelta(
  prev: string,
  curr: string,
  direction: "higher" | "lower",
): { label: string; isPositive: boolean } | null {
  const prevNum = extractNumber(prev);
  const currNum = extractNumber(curr);
  if (prevNum === null || currNum === null) return null;

  const diff = currNum - prevNum;
  if (diff === 0) return null;

  const increased = diff > 0;
  // "isPositive" means the change is good for the user
  const isPositive = direction === "higher" ? increased : !increased;

  const isAge = /age\s/i.test(curr) || /alter\s/i.test(curr);
  const isPercent = curr.includes("%");

  let label: string;
  if (isAge) {
    const absDiff = Math.abs(Math.round(diff));
    label = increased ? `+${absDiff}` : `−${absDiff}`;
  } else if (isPercent) {
    const absDiff = Math.abs(diff);
    const fmt = absDiff % 1 === 0 ? absDiff.toFixed(0) : absDiff.toFixed(1);
    label = increased ? `+${fmt}%` : `−${fmt}%`;
  } else {
    label = increased ? "↑" : "↓";
  }

  return { label, isPositive };
}

function KPICard({ icon, iconLabel, title, value, sub, accent, warning, direction }: KPICardProps) {
  const prevValueRef = useRef<string>(value);
  const [delta, setDelta] = useState<{ label: string; isPositive: boolean } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const prev = prevValueRef.current;
    prevValueRef.current = value;

    if (prev === value || !direction) return;

    const d = buildDelta(prev, value, direction);
    if (!d) return;

    setDelta(d);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDelta(null), 2000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, direction]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-lg" role="img" aria-label={iconLabel}>{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {title}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
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
        {delta && (
          <span
            key={value}
            className={`kpi-delta inline-flex items-center text-xs font-semibold px-1.5 py-0.5 rounded-full ${
              delta.isPositive
                ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30"
                : "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30"
            }`}
          >
            {delta.label}
          </span>
        )}
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

  // Calculate inflation-adjusted spending at FIRE
  const yearsToFire = fullFireYear ?? 0;
  const inflationFactor = Math.pow(1 + inputs.inflation / 100, yearsToFire);
  const spendingAtFire = Math.round(inputs.monatlichesWunschEinkommen * inflationFactor);

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
        direction="lower"
      />
      <KPICard
        icon="💰"
        iconLabel={t.kpiPassiveIncome}
        title={t.kpiPassiveIncome}
        value={incomeLabel}
        sub={`SWR ${swRate.toFixed(1)}%`}
        accent
        direction="higher"
      />
      <KPICard
        icon="🏖️"
        iconLabel={t.kpiCoastFire}
        title={t.kpiCoastFire}
        value={coastLabel}
        sub={coastSub}
        accent={!!coastFireCalendarYear}
        direction="lower"
      />
      <KPICard
        icon="📊"
        iconLabel={t.kpiFireNumber}
        title={t.kpiFireNumber}
        value={formatCurrencyShort(derivedFireNumber)}
        sub={t.kpiGapPerMonth(formatCurrency(inputs.monatlichesWunschEinkommen))}
        direction="lower"
      />
      {targetReached && yearsToFire > 0 && (
        <KPICard
          icon="📅"
          iconLabel={t.kpiInflationAdjustedSpending}
          title={t.kpiInflationAdjustedSpending}
          value={`${formatCurrency(spendingAtFire)} ${t.perMonth}`}
          sub={t.kpiInflationAdjustedSpendingSub(
            formatCurrency(inputs.monatlichesWunschEinkommen),
            formatCurrency(spendingAtFire),
            yearsToFire,
          )}
        />
      )}

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
        direction="higher"
      />
      <KPICard
        icon="🎲"
        iconLabel={t.kpiMonteCarlo}
        title={t.kpiMonteCarlo}
        value={`${mcSuccessPct}%`}
        sub={t.monteCarloSimulations}
        accent={monteCarlo.successRate >= 0.8}
        warning={monteCarlo.successRate < 0.5}
        direction="higher"
      />
      <KPICard
        icon="💡"
        iconLabel={t.kpiRequiredSavings}
        title={t.kpiRequiredSavings}
        value={`${formatCurrency(requiredSparrate)} / M`}
        sub={t.kpiCurrentSavings(formatCurrency(inputs.monatlicheSparrate))}
        accent={inputs.monatlicheSparrate >= requiredSparrate}
        warning={inputs.monatlicheSparrate < requiredSparrate}
        direction="lower"
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
        direction="higher"
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
