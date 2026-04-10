"use client";

import React from "react";
import { FireInputs } from "@/lib/fireCalculations";

interface WarningsProps {
  inputs: FireInputs;
}

export default function Warnings({ inputs }: WarningsProps) {
  const warnings: string[] = [];

  if (inputs.etfRendite <= inputs.inflation) {
    warnings.push(
      `⚠️ Ihre erwartete Rendite (${inputs.etfRendite}%) liegt unter oder gleich der Inflation (${inputs.inflation}%). Ihr Vermögen verliert real an Kaufkraft.`
    );
  }

  if (inputs.monatlicheSparrate === 0 && inputs.startKapital === 0) {
    warnings.push(
      "⚠️ Ohne Startkapital und ohne monatliche Sparrate kann kein Vermögen aufgebaut werden."
    );
  }

  if (inputs.monatlichesWunschEinkommen <= inputs.gesetzlicheRente) {
    warnings.push(
      "ℹ️ Ihr Wunsch-Einkommen ist geringer als die erwartete Rente. Kein zusätzliches Vermögen nötig!"
    );
  }

  if (inputs.swr >= 5.0) {
    warnings.push(
      "⚠️ Eine SWR von 5% oder mehr gilt als riskant. Historisch hatte die 4%-Regel bereits eine Ausfallwahrscheinlichkeit."
    );
  }

  if (inputs.etfRendite >= 10) {
    warnings.push(
      "ℹ️ Eine Rendite von 10%+ p.a. ist sehr optimistisch. Der MSCI World liegt historisch bei ca. 7% brutto."
    );
  }

  if (warnings.length === 0) return null;

  return (
    <div className="mb-6 space-y-2">
      {warnings.map((w, i) => (
        <div
          key={i}
          className={`px-4 py-3 rounded-xl text-sm border ${
            w.startsWith("⚠️")
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          {w}
        </div>
      ))}
    </div>
  );
}
