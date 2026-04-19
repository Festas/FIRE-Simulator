"use client";

import React, { useMemo } from "react";
import { calculateFIRE, FireInputs, FireResult } from "@/lib/fireCalculations";
import { useI18n } from "@/lib/i18n";

interface WhatIfPanelProps {
  inputs: FireInputs;
  result: FireResult;
  onChange: (key: keyof FireInputs, value: number | string | boolean) => void;
}

interface Scenario {
  label: string;
  fireAge: number | null;
  apply: () => void;
}

export default function WhatIfPanel({ inputs, result, onChange }: WhatIfPanelProps) {
  const { t, formatCurrency } = useI18n();

  const currentFireAge = result.fullFireAge;

  // Scale scenario amounts based on country income (roughly proportional)
  // Use ~6% of net income as the "save more" amount, rounded to nearest 50
  const saveMoreAmount = Math.max(50, Math.round((inputs.monatlichesNetto * 0.06) / 50) * 50);
  // Use ~10% of desired income as the "less income" amount, rounded to nearest 50
  const lessIncomeAmount = Math.max(50, Math.round((inputs.monatlichesWunschEinkommen * 0.1) / 50) * 50);

  const scenarios: Scenario[] = useMemo(() => {
    // Scenario 1: Save more per month (scaled to income)
    const saveMoreInputs: FireInputs = {
      ...inputs,
      monatlicheSparrate: inputs.monatlicheSparrate + saveMoreAmount,
    };
    const saveMoreResult = calculateFIRE(saveMoreInputs);

    // Scenario 2: 1% higher return
    const higherReturnInputs: FireInputs = {
      ...inputs,
      etfRendite: inputs.etfRendite + 1,
    };
    const higherReturnResult = calculateFIRE(higherReturnInputs);

    // Scenario 3: Need less monthly income (scaled to income)
    const lessIncomeInputs: FireInputs = {
      ...inputs,
      monatlichesWunschEinkommen: Math.max(inputs.monatlichesWunschEinkommen - lessIncomeAmount, 0),
    };
    if (!lessIncomeInputs.zielvermoegenOverride) {
      lessIncomeInputs.zielvermoegen =
        (lessIncomeInputs.monatlichesWunschEinkommen * 12) / (lessIncomeInputs.swr / 100);
    }
    const lessIncomeResult = calculateFIRE(lessIncomeInputs);

    return [
      {
        label: t.whatIfSaveMore(formatCurrency(saveMoreAmount)),
        fireAge: saveMoreResult.fullFireAge,
        apply: () => onChange("monatlicheSparrate", inputs.monatlicheSparrate + saveMoreAmount),
      },
      {
        label: t.whatIfHigherReturn,
        fireAge: higherReturnResult.fullFireAge,
        apply: () =>
          onChange("etfRendite", inputs.etfRendite + 1),
      },
      {
        label: t.whatIfLessIncome(formatCurrency(lessIncomeAmount)),
        fireAge: lessIncomeResult.fullFireAge,
        apply: () =>
          onChange(
            "monatlichesWunschEinkommen",
            Math.max(inputs.monatlichesWunschEinkommen - lessIncomeAmount, 0)
          ),
      },
    ];
  }, [inputs, t, formatCurrency, onChange, saveMoreAmount, lessIncomeAmount]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-6">
      <h3 className="text-lg font-semibold text-[#0f294d] dark:text-white mb-4">
        <span role="img" aria-label="thinking">🤔</span> {t.whatIfTitle}
      </h3>

      <div className="flex flex-col sm:flex-row gap-3">
        {scenarios.map((scenario, i) => {
          const diff =
            currentFireAge != null && scenario.fireAge != null
              ? currentFireAge - scenario.fireAge
              : null;

          const isImprovement = diff != null && diff > 0;

          return (
            <button
              key={i}
              type="button"
              onClick={scenario.apply}
              className="flex-1 text-left bg-slate-50 dark:bg-slate-700 rounded-xl p-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors cursor-pointer border border-slate-200 dark:border-slate-600"
            >
              <p className="text-sm font-medium text-[#0f294d] dark:text-slate-200 mb-2">
                {scenario.label}
              </p>

              {currentFireAge != null && scenario.fireAge != null ? (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  FIRE {currentFireAge} → {scenario.fireAge}
                  {diff != null && diff !== 0 && (
                    <span
                      className={`ml-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isImprovement
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                      }`}
                    >
                      {isImprovement
                        ? t.whatIfYearsEarlier(diff)
                        : t.whatIfYearsLater(Math.abs(diff))}
                    </span>
                  )}
                  {diff === 0 && (
                    <span className="ml-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                      {t.whatIfNoChange}
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500">—</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
