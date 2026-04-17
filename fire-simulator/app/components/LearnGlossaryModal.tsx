"use client";

import React, { useState } from "react";
import { useI18n } from "@/lib/i18n";

interface LearnGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const glossaryItems = [
  { emoji: "🔥", titleKey: "learnWhatIsFire", descKey: "learnWhatIsFireDesc" },
  { emoji: "🎯", titleKey: "learnFireNumber", descKey: "learnFireNumberDesc" },
  { emoji: "📊", titleKey: "learnSwr", descKey: "learnSwrDesc" },
  { emoji: "🏖️", titleKey: "learnCoastFire", descKey: "learnCoastFireDesc" },
  { emoji: "🎲", titleKey: "learnMonteCarlo", descKey: "learnMonteCarloDesc" },
  { emoji: "📉", titleKey: "learnDrawdown", descKey: "learnDrawdownDesc" },
  { emoji: "💰", titleKey: "learnSavingsRate", descKey: "learnSavingsRateDesc" },
  { emoji: "📈", titleKey: "learnCompoundInterest", descKey: "learnCompoundInterestDesc" },
] as const;

type GlossaryKey = (typeof glossaryItems)[number]["titleKey" | "descKey"];

export default function LearnGlossaryModal({ isOpen, onClose }: LearnGlossaryModalProps) {
  const { t } = useI18n();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const toggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f294d] rounded-2xl shadow-2xl border border-slate-700 w-full max-w-lg mx-4 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">{t.learnTitle}</h2>
        </div>

        {/* Scrollable glossary list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {glossaryItems.map((item, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <div
                key={item.titleKey}
                className="border border-slate-700 rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-700/40 transition-colors"
                >
                  <span className="flex items-center gap-2 text-white font-medium">
                    <span>{item.emoji}</span>
                    <span>{t[item.titleKey as GlossaryKey]}</span>
                  </span>
                  <span
                    className={`text-emerald-500 transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 text-slate-300 text-sm leading-relaxed">
                    {t[item.descKey as GlossaryKey]}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors"
          >
            {t.learnClose}
          </button>
        </div>
      </div>
    </div>
  );
}
