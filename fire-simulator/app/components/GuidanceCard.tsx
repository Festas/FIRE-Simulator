"use client";

import React from "react";
import { FireResult, FireInputs } from "@/lib/fireCalculations";
import { useI18n } from "@/lib/i18n";

interface GuidanceCardProps {
  result: FireResult;
  inputs: FireInputs;
}

export default function GuidanceCard({ result, inputs }: GuidanceCardProps) {
  const { t, formatCurrency } = useI18n();

  const messages: { text: string; type: "success" | "info" | "warning" }[] = [];

  // 1. Overall FIRE status
  if (result.fullFireYear === 0) {
    messages.push({ text: t.guidanceAlreadyFire, type: "success" });
  } else if (result.targetReached && result.fullFireAge !== null) {
    const yearsEarly = inputs.renteneintrittsalter - result.fullFireAge;
    if (yearsEarly > 0) {
      messages.push({ text: t.guidanceOnTrack(yearsEarly), type: "success" });
    } else {
      messages.push({ text: t.guidanceOnTrack(0), type: "info" });
    }
  } else {
    messages.push({ text: t.guidanceNoTarget, type: "warning" });
  }

  // 2. Savings comparison
  if (result.targetReached) {
    if (inputs.monatlicheSparrate < result.requiredSparrate) {
      const gap = result.requiredSparrate - inputs.monatlicheSparrate;
      messages.push({
        text: t.guidanceNeedMore(formatCurrency(Math.round(gap))),
        type: "info",
      });
    } else {
      messages.push({ text: t.guidanceSavingsGood, type: "success" });
    }
  } else {
    // Not reached: show how much more is needed
    const gap = result.requiredSparrate - inputs.monatlicheSparrate;
    if (gap > 0) {
      messages.push({
        text: t.guidanceSavingsLow(
          formatCurrency(inputs.monatlicheSparrate),
          formatCurrency(result.requiredSparrate),
        ),
        type: "warning",
      });
    }
  }

  // 3. Monte Carlo assessment
  const mcPct = (result.monteCarlo.successRate * 100).toFixed(0);
  if (result.targetReached) {
    if (result.monteCarlo.successRate < 0.5) {
      messages.push({ text: t.guidanceMcWarning(mcPct), type: "warning" });
    } else if (result.monteCarlo.successRate >= 0.8) {
      messages.push({ text: t.guidanceMcGood(mcPct), type: "success" });
    }
  }

  if (messages.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg" role="img" aria-label={t.guidanceTip}>💬</span>
        <span className="text-sm font-bold text-[#0f294d] dark:text-white">
          {t.guidanceTip}
        </span>
      </div>
      <div className="space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-sm rounded-lg px-3 py-2 ${
              msg.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700"
                : msg.type === "warning"
                  ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700"
                  : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
}
