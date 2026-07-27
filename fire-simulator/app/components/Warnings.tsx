"use client";

import React from "react";
import { FireInputs, FireResult } from "@/lib/fireCalculations";
import { useI18n } from "@/lib/i18n";

interface WarningsProps {
  inputs: FireInputs;
  result?: FireResult;
}

export default function Warnings({ inputs, result }: WarningsProps) {
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

  // Enhanced validations
  if (inputs.monatlicheSparrate > inputs.monatlichesNetto && inputs.monatlichesNetto > 0) {
    warnings.push({
      text: t.warnSavingsExceedIncome,
      isWarning: true,
    });
  }

  if (inputs.renteneintrittsalter <= inputs.currentAge) {
    warnings.push({
      text: t.warnPensionAgeTooLow,
      isWarning: true,
    });
  }

  if (inputs.monatlichesWunschEinkommen > inputs.monatlichesNetto && inputs.monatlichesNetto > 0) {
    warnings.push({
      text: t.warnDesiredIncomeHigh,
      isWarning: false,
    });
  }

  // Result-driven warnings (D4)
  if (result) {
    // Low Monte-Carlo success probability
    const mcSuccess = result.lifecycleMonteCarlo?.fireSuccessRate;
    if (typeof mcSuccess === "number" && mcSuccess < 0.75) {
      warnings.push({
        text: t.warnLowMcSuccess((mcSuccess * 100).toFixed(0)),
        isWarning: true,
      });
    }

    // Coast FIRE impossible: real return ≤ 0 means the clamp made coast == target
    const realReturn = (1 + inputs.etfRendite / 100) / (1 + inputs.inflation / 100) - 1;
    if (realReturn <= 0) {
      warnings.push({ text: t.warnCoastImpossible, isWarning: true });
    }

    // SWR exceeds real return under the perpetual model
    if (inputs.entnahmeModell === "ewigeRente" && inputs.swr > realReturn * 100) {
      warnings.push({
        text: t.warnSwrAboveRealReturn(
          inputs.swr.toFixed(1),
          (realReturn * 100).toFixed(1),
        ),
        isWarning: true,
      });
    }

    // Kapitalverzehr: depletion is intended, not a failure
    if (result.drawdownPlannedDepletion) {
      warnings.push({ text: t.infoPlannedDepletion, isWarning: false });
    }
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
