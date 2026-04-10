"use client";

import React from "react";
import { FireResult, FireInputs, formatEuro, formatEuroShort } from "@/lib/fireCalculations";

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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
      </div>
      <div
        className={`text-xl font-bold tracking-tight ${
          warning
            ? "text-amber-600"
            : accent
              ? "text-emerald-600"
              : "text-[#0f294d]"
        }`}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

interface KPICardsProps {
  result: FireResult;
  inputs: FireInputs;
}

export default function KPICards({ result, inputs }: KPICardsProps) {
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
  } = result;

  const coastLabel = coastFireCalendarYear
    ? `Jahr ${coastFireCalendarYear}`
    : "> 30 Jahre";

  const fullLabel = targetReached && fullFireCalendarYear
    ? `Jahr ${fullFireCalendarYear}`
    : "Ziel > 30 Jahre";

  const incomeLabel = formatEuro(passiveIncomeAtExit) + " / Monat";
  const years = fullFireYear !== null ? `in ${fullFireYear} Jahren` : "";

  const drawdownLabel = drawdownSurvives
    ? "✅ Portfolio überlebt"
    : drawdownDepletionYear
      ? `⚠️ Aufgebraucht ${drawdownDepletionYear}`
      : "—";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {/* Row 1 */}
      <KPICard
        icon="🎯"
        title="Full FIRE Exit"
        value={fullLabel}
        sub={
          targetReached && years
            ? `Zielvermögen ${formatEuroShort(inputs.zielvermoegen)} ${years}`
            : "Sparrate oder Rendite erhöhen"
        }
        accent={targetReached}
        warning={!targetReached}
      />
      <KPICard
        icon="💰"
        title="Passives Einkommen"
        value={incomeLabel}
        sub={`SWR ${swRate.toFixed(1)} % · nach Steuern & Rente`}
        accent
      />
      <KPICard
        icon="🏖️"
        title="Coast FIRE"
        value={coastLabel}
        sub={`Schwelle: ${formatEuroShort(coastFireAmount)} (real)`}
        accent={!!coastFireCalendarYear}
      />
      <KPICard
        icon="📊"
        title="FIRE-Zahl"
        value={formatEuroShort(derivedFireNumber)}
        sub={`${formatEuro(inputs.monatlichesWunschEinkommen - inputs.gesetzlicheRente)} Lücke/Monat`}
      />

      {/* Row 2 */}
      <KPICard
        icon="📈"
        title="Entnahme-Phase"
        value={drawdownLabel}
        sub={
          inputs.entnahmeModell === "kapitalverzehr"
            ? `Kapitalverzehr über ${inputs.kapitalverzehrJahre} Jahre`
            : "Ewige Rente (Kapital erhalten)"
        }
        accent={drawdownSurvives}
        warning={!drawdownSurvives}
      />
      <KPICard
        icon="🏛️"
        title="Steuern gesamt"
        value={formatEuroShort(totalTaxPaid)}
        sub={`Eff. Steuersatz: ${(result.effectiveTaxRate * 100).toFixed(1)} %`}
      />
      <KPICard
        icon="💡"
        title="Benötigte Sparrate"
        value={formatEuro(requiredSparrate) + " / M"}
        sub={`Aktuell: ${formatEuro(inputs.monatlicheSparrate)} / Monat`}
        accent={inputs.monatlicheSparrate >= requiredSparrate}
        warning={inputs.monatlicheSparrate < requiredSparrate}
      />
      <KPICard
        icon="⏳"
        title={sparquote > 0 ? "Sparquote" : "LZK Start"}
        value={sparquote > 0 ? `${sparquote.toFixed(1)} %` : `Jahr ${lzkStartCalendarYear}`}
        sub={
          sparquote > 0
            ? `${formatEuro(inputs.monatlicheSparrate)} von ${formatEuro(inputs.monatlichesBrutto)} brutto`
            : "ETF-Beiträge enden · Konto läuft weiter"
        }
        accent={sparquote >= 30}
      />
    </div>
  );
}
