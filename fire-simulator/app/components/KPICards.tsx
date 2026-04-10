"use client";

import React from "react";
import { FireResult, formatEuro } from "@/lib/fireCalculations";

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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
      </div>
      <div
        className={`text-2xl font-bold tracking-tight ${
          warning
            ? "text-amber-600"
            : accent
              ? "text-emerald-600"
              : "text-[#0f294d]"
        }`}
      >
        {value}
      </div>
      {sub && <div className="text-sm text-slate-500">{sub}</div>}
    </div>
  );
}

interface KPICardsProps {
  result: FireResult;
  zielvermoegen: number;
}

export default function KPICards({ result, zielvermoegen }: KPICardsProps) {
  const {
    coastFireCalendarYear,
    fullFireCalendarYear,
    fullFireYear,
    passiveIncomeAtExit,
    targetReached,
    swRate,
    lzkStartCalendarYear,
  } = result;

  const coastLabel = coastFireCalendarYear
    ? `Jahr ${coastFireCalendarYear}`
    : "Noch nicht erreicht";

  const fullLabel = targetReached && fullFireCalendarYear
    ? `Jahr ${fullFireCalendarYear}`
    : "Ziel > 30 Jahre";

  const incomeLabel = formatEuro(passiveIncomeAtExit) + " / Monat";

  const years = fullFireYear !== null ? `in ${fullFireYear} Jahren` : "";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      <KPICard
        icon="🏖️"
        title="Coast FIRE"
        value={coastLabel}
        sub="Portfolio > 1.000.000 € (real)"
        accent={!!coastFireCalendarYear}
      />
      <KPICard
        icon="🎯"
        title="Full FIRE Exit"
        value={fullLabel}
        sub={
          targetReached && years
            ? `Zielvermögen ${formatEuro(zielvermoegen)} ${years}`
            : "Sparrate oder Rendite erhöhen"
        }
        accent={targetReached}
        warning={!targetReached}
      />
      <KPICard
        icon="💰"
        title="Passives Einkommen"
        value={incomeLabel}
        sub={`Safe Withdrawal Rate ${swRate.toFixed(1)} %`}
        accent
      />
      <KPICard
        icon="⏳"
        title="LZK Endspurt ab"
        value={`Jahr ${lzkStartCalendarYear}`}
        sub="ETF-Beiträge enden · Konto läuft weiter"
      />
    </div>
  );
}
