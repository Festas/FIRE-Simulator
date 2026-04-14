"use client";

import React, { useState } from "react";
import { FireResult } from "@/lib/fireCalculations";
import { useI18n } from "@/lib/i18n";

interface DetailTableProps {
  result: FireResult;
}

export default function DetailTable({ result }: DetailTableProps) {
  const [open, setOpen] = useState(false);
  const { t, formatCurrency } = useI18n();
  const { yearlyData, drawdownData } = result;
  const allData = [...yearlyData.slice(1), ...drawdownData]; // skip year 0

  if (!allData.length) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-6 overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <div>
          <h2 className="text-lg font-bold text-[#0f294d] dark:text-white text-left">
            {t.tableTitle}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-left">
            {t.tableSubtitle}
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
        <div className="overflow-x-auto border-t border-slate-100 dark:border-slate-700">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th scope="col" className="px-4 py-3 text-left font-semibold">{t.tableYear}</th>
                <th scope="col" className="px-4 py-3 text-left font-semibold">{t.tableAge}</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">{t.tableEtf}</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">{t.tableTotal}</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">{t.tableSavingsMonth}</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">{t.tableGains}</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">{t.tableTaxes}</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">{t.tableWithdrawal}</th>
                <th scope="col" className="px-4 py-3 text-center font-semibold">{t.tablePhase}</th>
              </tr>
            </thead>
            <tbody>
              {allData.map((d) => (
                <tr
                  key={d.calendarYear}
                  className={`border-t border-slate-50 dark:border-slate-700 ${
                    d.isDrawdownPhase
                      ? "bg-amber-50/50 dark:bg-amber-900/10"
                      : d.isLZKPhase
                        ? "bg-blue-50/30 dark:bg-blue-900/10"
                        : ""
                  } hover:bg-slate-50 dark:hover:bg-slate-700`}
                >
                  <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">
                    {d.calendarYear}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">
                    {d.age}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-400">
                    {formatCurrency(d.etfBalanceReal)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-[#0f294d] dark:text-white">
                    {formatCurrency(d.totalReal)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-600 dark:text-slate-400">
                    {d.monthlySavings > 0 ? formatCurrency(d.monthlySavings) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right text-emerald-600 dark:text-emerald-400">
                    {d.annualGains > 0 ? formatCurrency(d.annualGains) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right text-red-500 dark:text-red-400">
                    {d.taxPaid > 0 ? formatCurrency(d.taxPaid) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right text-amber-600 dark:text-amber-400">
                    {d.annualWithdrawal > 0 ? formatCurrency(d.annualWithdrawal) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {d.isDrawdownPhase ? (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
                        {t.phaseWithdrawal}
                      </span>
                    ) : d.isLZKPhase ? (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">
                        {t.phaseLzk}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                        {t.phaseSaving}
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
