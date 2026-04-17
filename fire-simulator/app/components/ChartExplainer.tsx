"use client";

import React, { useState } from "react";

interface ChartExplainerProps {
  explanation: string;
  summary: string;
}

function ChartExplainer({ explanation, summary }: ChartExplainerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* The ? button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="absolute top-0 right-0 z-10 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 text-sm font-bold flex items-center justify-center transition-colors"
        aria-label="Toggle chart explanation"
      >
        ?
      </button>

      {/* Explanation overlay when open */}
      {open && (
        <div className="absolute top-10 right-0 z-20 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-600 p-4 max-w-sm">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm font-bold transition-colors"
            aria-label="Close explanation"
          >
            ×
          </button>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {explanation}
          </p>
        </div>
      )}

      {/* Always-visible summary */}
      <p className="text-xs text-slate-400 mt-2 text-center">{summary}</p>
    </div>
  );
}

export default ChartExplainer;
