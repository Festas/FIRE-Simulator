"use client";

import React, { useState } from "react";
import { useI18n } from "@/lib/i18n";

const STORAGE_KEY = "fire-simulator-education-dismissed";

function getInitialDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export default function FireEducationPanel() {
  const { t } = useI18n();
  const [dismissed, setDismissed] = useState<boolean>(getInitialDismissed);

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }
  };

  if (dismissed) {
    return (
      <button
        onClick={() => {
          setDismissed(false);
          try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
        }}
        className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline mb-4"
      >
        {t.fireEducationShowAgain}
      </button>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-5 mb-6">
      <h2 className="text-sm font-bold text-[#0f294d] dark:text-white mb-2">
        {t.fireEducationTitle}
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
        {t.fireEducationBody}
      </p>
      <button
        onClick={dismiss}
        className="px-4 py-1.5 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
      >
        {t.fireEducationDismiss}
      </button>
    </div>
  );
}
