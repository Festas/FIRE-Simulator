"use client";

import React from "react";
import { FireInputs } from "@/lib/fireCalculations";
import { useI18n } from "@/lib/i18n";

interface WarningsProps {
  inputs: FireInputs;
}

export default function Warnings({ inputs }: WarningsProps) {
  const { t } = useI18n();
  const warnings: { text: string; isWarning: boolean }[] = [];

  if (inputs.etfRendite <= inputs.inflation) {
    warnings.push({
      text: t.warnReturnBelowInflation(String(inputs.etfRendite), String(inputs.inflation)),
      isWarning: true,
    });
  }

  if (inputs.monatlicheSparrate === 0 && inputs.startKapital === 0) {
    warnings.push({ text: t.warnNoCapitalNoSavings, isWarning: true });
  }

  if (inputs.monatlichesWunschEinkommen <= inputs.gesetzlicheRente) {
    warnings.push({ text: t.warnIncomeAbovePension, isWarning: false });
  }

  if (inputs.swr >= 5.0) {
    warnings.push({ text: t.warnHighSwr, isWarning: true });
  }

  if (inputs.etfRendite >= 10) {
    warnings.push({ text: t.warnHighReturn, isWarning: false });
  }

  if (warnings.length === 0) return null;

  return (
    <div className="mb-6 space-y-2" role="alert">
      {warnings.map((w, i) => (
        <div
          key={i}
          className={`px-4 py-3 rounded-xl text-sm border ${
            w.isWarning
              ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300"
              : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300"
          }`}
        >
          {w.text}
        </div>
      ))}
    </div>
  );
}
