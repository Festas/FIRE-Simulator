"use client";

import { useState, useCallback } from "react";
import { FireInputs } from "@/lib/fireCalculations";
import { useI18n } from "@/lib/i18n";

interface SavedScenario {
  name: string;
  inputs: FireInputs;
  savedAt: string;
}

interface ScenarioManagerProps {
  currentInputs: FireInputs;
  onLoad: (inputs: FireInputs) => void;
}

const STORAGE_KEY = "fire-simulator-scenarios";

function loadScenarios(): SavedScenario[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SavedScenario[];
  } catch {
    // ignore localStorage errors
  }
  return [];
}

function persistScenarios(scenarios: SavedScenario[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  } catch {
    // ignore localStorage errors
  }
}

export default function ScenarioManager({
  currentInputs,
  onLoad,
}: ScenarioManagerProps) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [scenarios, setScenarios] = useState<SavedScenario[]>(loadScenarios);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const handleSave = useCallback(() => {
    const name = window.prompt(t.scenariosNamePrompt);
    if (!name || !name.trim()) return;

    const trimmed = name.trim();
    const newScenario: SavedScenario = {
      name: trimmed,
      inputs: { ...currentInputs },
      savedAt: new Date().toISOString(),
    };

    setScenarios((prev) => {
      const filtered = prev.filter((s) => s.name !== trimmed);
      const next = [...filtered, newScenario];
      persistScenarios(next);
      return next;
    });
    setActiveScenario(trimmed);
  }, [currentInputs, t.scenariosNamePrompt]);

  const handleLoad = useCallback(
    (scenario: SavedScenario) => {
      onLoad(scenario.inputs);
      setActiveScenario(scenario.name);
    },
    [onLoad],
  );

  const handleDelete = useCallback(
    (name: string) => {
      if (!window.confirm(`${t.scenariosDelete}: "${name}"?`)) return;

      setScenarios((prev) => {
        const next = prev.filter((s) => s.name !== name);
        persistScenarios(next);
        return next;
      });
      if (activeScenario === name) {
        setActiveScenario(null);
      }
    },
    [t.scenariosDelete, activeScenario],
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <h2 className="text-lg font-bold text-[#0f294d] dark:text-white">
          {t.scenariosSection}
          {scenarios.length > 0 && (
            <span className="ml-2 text-sm font-normal text-slate-400">
              ({scenarios.length})
            </span>
          )}
        </h2>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Collapsible content */}
      {expanded && (
        <div className="mt-4">
          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            className="mb-4 px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
          >
            {t.scenariosSave}
          </button>

          {/* Scenario chips */}
          {scenarios.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t.scenariosEmpty}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {scenarios.map((scenario) => {
                const isActive = activeScenario === scenario.name;
                return (
                  <div
                    key={scenario.name}
                    className={`group flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-300 dark:ring-emerald-700"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleLoad(scenario)}
                      className="font-medium"
                      title={t.scenariosLoad}
                    >
                      {scenario.name}
                    </button>

                    {isActive && (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {t.scenariosCurrent}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(scenario.name)}
                      className="ml-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title={t.scenariosDelete}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
