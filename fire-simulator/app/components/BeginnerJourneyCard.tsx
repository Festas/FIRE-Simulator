"use client";

import React from "react";
import { FireResult, FireInputs } from "@/lib/fireCalculations";
import { useI18n } from "@/lib/i18n";

interface BeginnerJourneyCardProps {
  result: FireResult;
  inputs: FireInputs;
}

export default function BeginnerJourneyCard({
  result,
  inputs,
}: BeginnerJourneyCardProps) {
  const { t, formatCurrency, formatCurrencyShort } = useI18n();

  const progress = Math.min(
    (inputs.startKapital / result.derivedFireNumber) * 100,
    100
  );

  const tips = [
    { emoji: "💰", text: t.beginnerTipSaveMore },
    { emoji: "⏰", text: t.beginnerTipStartEarly },
    { emoji: "📉", text: t.beginnerTipReduceSpending },
    { emoji: "📈", text: t.beginnerTipInvest },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
      {/* Title */}
      <h2 className="text-xl font-bold text-[#0f294d] dark:text-white mb-4">
        <span role="img" aria-label="beach">🏖️</span>{" "}
        {t.beginnerJourneyTitle}
      </h2>

      {/* Main savings message */}
      <p className="text-lg text-slate-700 dark:text-slate-200 mb-3">
        {t.beginnerJourneySavings(formatCurrency(inputs.monatlicheSparrate))}
      </p>

      {/* FIRE age or warning */}
      {result.fullFireAge !== null ? (
        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">
          {t.beginnerJourneyFireAge(result.fullFireAge)}
        </p>
      ) : (
        <p className="text-lg font-semibold text-amber-600 dark:text-amber-400 mb-4">
          {t.guidanceNoTarget}
        </p>
      )}

      {/* FIRE number */}
      <p className="text-base text-slate-600 dark:text-slate-300 mb-3">
        {t.beginnerJourneyFireNumber(
          formatCurrencyShort(result.derivedFireNumber)
        )}
      </p>

      {/* Progress bar */}
      <div className="mb-1">
        <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        {t.beginnerJourneyProgress(progress.toFixed(0))}
      </p>

      {/* Tips */}
      <h3 className="text-base font-semibold text-[#0f294d] dark:text-white mb-3">
        {t.beginnerJourneyTips}
      </h3>
      <ul className="space-y-2">
        {tips.map((tip) => (
          <li
            key={tip.text}
            className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
          >
            <span className="text-base leading-5">{tip.emoji}</span>
            <span>{tip.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
