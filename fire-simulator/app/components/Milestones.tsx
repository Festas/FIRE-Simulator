"use client";

import React from "react";
import { FireResult, FireInputs } from "@/lib/fireCalculations";
import { useI18n } from "@/lib/i18n";

interface MilestonesProps {
  result: FireResult;
  inputs: FireInputs;
}

interface Milestone {
  id: string;
  label: string;
  emoji: string;
  completed: boolean;
  age?: number | null;
  targetAmount?: number;
}

export default function Milestones({ result, inputs }: MilestonesProps) {
  const { t, formatCurrencyShort } = useI18n();

  const fireNumber = result.derivedFireNumber;

  // Find the first year where totalReal >= 75% of FIRE number
  const seventyFiveEntry = result.yearlyData.find(
    (d) => d.totalReal >= fireNumber * 0.75,
  );

  const milestones: Milestone[] = [
    {
      id: "start",
      label: t.milestonesStart,
      emoji: "🚀",
      completed: true,
      age: inputs.currentAge,
    },
    {
      id: "25pct",
      label: t.milestones25,
      emoji: "🎯",
      completed: inputs.startKapital >= fireNumber * 0.25,
      targetAmount: fireNumber * 0.25,
      age:
        inputs.startKapital >= fireNumber * 0.25
          ? undefined
          : (() => {
              const entry = result.yearlyData.find(
                (d) => d.totalReal >= fireNumber * 0.25,
              );
              return entry?.age ?? null;
            })(),
    },
    {
      id: "coast",
      label: t.milestonesCoast,
      emoji: "🌿",
      completed:
        result.coastFireYear !== null && result.coastFireYear >= 0,
      age: result.coastFireAge,
    },
    {
      id: "75pct",
      label: t.milestones75,
      emoji: "☀️",
      completed: !!seventyFiveEntry,
      targetAmount: fireNumber * 0.75,
      age: seventyFiveEntry?.age ?? null,
    },
    {
      id: "fire",
      label: t.milestonesFire,
      emoji: "🏖️",
      completed:
        result.targetReached && result.fullFireYear !== null,
      age: result.fullFireAge,
    },
  ];

  const nextMilestone = milestones.find((m) => !m.completed);

  // Estimate months to next milestone based on monthly savings
  const estimateMonths = (): number | null => {
    if (!nextMilestone?.targetAmount) return null;
    const gap = nextMilestone.targetAmount - inputs.startKapital;
    if (gap <= 0) return 0;
    if (inputs.monatlicheSparrate <= 0) return null;
    return Math.ceil(gap / inputs.monatlicheSparrate);
  };

  const monthsToNext = estimateMonths();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 mb-6">
      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-5">
        🏆 {t.milestonesTitle}
      </h3>

      {/* Timeline — horizontal on md+, vertical on mobile */}
      <div className="hidden md:flex items-start justify-between relative mb-6">
        {milestones.map((m, i) => {
          const isActive =
            !m.completed &&
            (i === 0 || milestones[i - 1].completed);

          return (
            <React.Fragment key={m.id}>
              {/* Connector line */}
              {i > 0 && (
                <div className="flex-1 flex items-center mt-4">
                  <div
                    className={`h-0.5 w-full ${
                      m.completed
                        ? "bg-emerald-500"
                        : "border-t-2 border-dashed border-slate-300 dark:border-slate-600"
                    }`}
                  />
                </div>
              )}

              {/* Milestone node */}
              <div className="flex flex-col items-center text-center min-w-[4.5rem]">
                <div className="relative">
                  {isActive && (
                    <span className="absolute inset-0 -m-1 rounded-full border-2 border-emerald-400 animate-ping" />
                  )}
                  <div
                    className={`relative z-10 flex items-center justify-center rounded-full ${
                      isActive ? "w-10 h-10" : "w-8 h-8"
                    } ${
                      m.completed
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {m.completed ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span className="text-sm">{m.emoji}</span>
                    )}
                  </div>
                </div>

                <span className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300 leading-tight">
                  {m.emoji} {m.label}
                </span>

                {m.age != null && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {m.age}{" "}
                    {m.age === 1 ? "year" : "years"}
                  </span>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile vertical timeline */}
      <div className="flex flex-col md:hidden gap-0 mb-6">
        {milestones.map((m, i) => {
          const isActive =
            !m.completed &&
            (i === 0 || milestones[i - 1].completed);

          return (
            <div key={m.id} className="flex items-stretch gap-3">
              {/* Vertical line + circle */}
              <div className="flex flex-col items-center">
                {i > 0 && (
                  <div
                    className={`w-0.5 h-3 ${
                      m.completed
                        ? "bg-emerald-500"
                        : "border-l-2 border-dashed border-slate-300 dark:border-slate-600"
                    }`}
                  />
                )}
                <div className="relative">
                  {isActive && (
                    <span className="absolute inset-0 -m-1 rounded-full border-2 border-emerald-400 animate-ping" />
                  )}
                  <div
                    className={`relative z-10 flex items-center justify-center rounded-full ${
                      isActive ? "w-9 h-9" : "w-7 h-7"
                    } ${
                      m.completed
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {m.completed ? (
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span className="text-xs">{m.emoji}</span>
                    )}
                  </div>
                </div>
                {i < milestones.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 ${
                      milestones[i + 1].completed
                        ? "bg-emerald-500"
                        : "border-l-2 border-dashed border-slate-300 dark:border-slate-600"
                    }`}
                  />
                )}
              </div>

              {/* Label */}
              <div className="py-1.5">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {m.emoji} {m.label}
                </span>
                {m.age != null && (
                  <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                    ({m.age} {m.age === 1 ? "year" : "years"})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Next Milestone Card */}
      <div className="rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 p-4">
        {nextMilestone ? (
          <>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
              {nextMilestone.emoji} {t.milestonesNextTitle}:{" "}
              {nextMilestone.label}
            </p>
            {nextMilestone.targetAmount != null &&
              monthsToNext != null && (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {t.milestonesNextBody(
                    formatCurrencyShort(
                      Math.max(
                        0,
                        nextMilestone.targetAmount -
                          inputs.startKapital,
                      ),
                    ),
                    monthsToNext,
                  )}
                </p>
              )}
          </>
        ) : (
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            {t.milestonesCompleted} 🎉
          </p>
        )}
      </div>
    </div>
  );
}
