"use client";

import React, { useState } from "react";
import { FireResult, formatEuro } from "@/lib/fireCalculations";

interface DetailTableProps {
  result: FireResult;
}

export default function DetailTable({ result }: DetailTableProps) {
  const [open, setOpen] = useState(false);
  const { yearlyData, drawdownData } = result;
  const allData = [...yearlyData.slice(1), ...drawdownData]; // skip year 0

  if (!allData.length) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-6 overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div>
          <h2 className="text-lg font-bold text-[#0f294d] text-left">
            Jahr-für-Jahr Übersicht
          </h2>
          <p className="text-sm text-slate-500 text-left">
            Detaillierte Tabelle aller Spar- und Entnahmejahre
          </p>
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="overflow-x-auto border-t border-slate-100">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-semibold">Jahr</th>
                <th className="px-4 py-3 text-right font-semibold">ETF (real)</th>
                <th className="px-4 py-3 text-right font-semibold">LZK (real)</th>
                <th className="px-4 py-3 text-right font-semibold">Gesamt (real)</th>
                <th className="px-4 py-3 text-right font-semibold">Sparrate/M</th>
                <th className="px-4 py-3 text-right font-semibold">Erträge</th>
                <th className="px-4 py-3 text-right font-semibold">Steuern</th>
                <th className="px-4 py-3 text-right font-semibold">Entnahme</th>
                <th className="px-4 py-3 text-center font-semibold">Phase</th>
              </tr>
            </thead>
            <tbody>
              {allData.map((d) => (
                <tr
                  key={d.calendarYear}
                  className={`border-t border-slate-50 ${
                    d.isDrawdownPhase
                      ? "bg-amber-50/50"
                      : d.isLZKPhase
                        ? "bg-blue-50/30"
                        : ""
                  } hover:bg-slate-50`}
                >
                  <td className="px-4 py-2.5 font-medium text-slate-700">
                    {d.calendarYear}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-600">
                    {formatEuro(d.etfBalanceReal)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-600">
                    {d.lzkBalanceReal > 0 ? formatEuro(d.lzkBalanceReal) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-[#0f294d]">
                    {formatEuro(d.totalReal)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-600">
                    {d.monthlySavings > 0 ? formatEuro(d.monthlySavings) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right text-emerald-600">
                    {d.annualGains > 0 ? formatEuro(d.annualGains) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right text-red-500">
                    {d.taxPaid > 0 ? formatEuro(d.taxPaid) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right text-amber-600">
                    {d.annualWithdrawal > 0 ? formatEuro(d.annualWithdrawal) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {d.isDrawdownPhase ? (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">
                        Entnahme
                      </span>
                    ) : d.isLZKPhase ? (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                        LZK
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700">
                        Sparen
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
