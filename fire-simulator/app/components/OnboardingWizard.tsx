"use client";

import React, { useState, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { TAX_COUNTRIES } from "@/lib/tax";
import type { TaxCountry } from "@/lib/tax";
import { COUNTRY_DEFAULTS } from "@/lib/countryDefaults";

interface OnboardingData {
  currentAge: number;
  monatlichesNetto: number;
  startKapital: number;
  monatlicheSparrate: number;
  monatlichesWunschEinkommen: number;
  taxCountry: TaxCountry;
}

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
}

const COUNTRY_LABELS: Record<TaxCountry, string> = {
  DE: "🇩🇪 Germany",
  US: "🇺🇸 United States",
  UK: "🇬🇧 United Kingdom",
  CH: "🇨🇭 Switzerland",
  AT: "🇦🇹 Austria",
  NL: "🇳🇱 Netherlands",
  CA: "🇨🇦 Canada",
  AU: "🇦🇺 Australia",
  FR: "🇫🇷 France",
};

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-2 justify-center mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current
              ? "w-8 bg-emerald-500"
              : i < current
                ? "w-4 bg-emerald-400/50"
                : "w-4 bg-slate-600"
          }`}
        />
      ))}
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  prefix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  prefix?: string;
}) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <div className="flex items-center gap-2">
        {prefix && <span className="text-slate-400 text-sm">{prefix}</span>}
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) {
              onChange(Math.min(max, Math.max(min, v)));
            } else if (e.target.value === "" || e.target.value === "-") {
              onChange(min);
            }
          }}
          className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/30"
        />
        {suffix && <span className="text-slate-400 text-sm">{suffix}</span>}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full mt-2 accent-emerald-500"
      />
    </div>
  );
}

export default function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const { t, formatCurrencyShort } = useI18n();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    currentAge: 30,
    monatlichesNetto: 3_500,
    startKapital: 10_000,
    monatlicheSparrate: 500,
    monatlichesWunschEinkommen: 2_500,
    taxCountry: "DE",
  });

  // Quick FIRE estimate for preview (simplified — no tax, no life events)
  const firePreview = useMemo(() => {
    const countryDef = COUNTRY_DEFAULTS[data.taxCountry];
    const roi = countryDef.etfRendite / 100;
    const inf = countryDef.inflation / 100;
    const swr = countryDef.swr / 100;
    const fireNumber = swr > 0 ? (data.monatlichesWunschEinkommen * 12) / swr : 0;
    if (fireNumber <= 0) return { fireAge: null, fireNumber: 0 };

    let balance = data.startKapital;
    const dyn = 0.02; // 2% savings growth
    for (let y = 1; y <= 50; y++) {
      const savings = data.monatlicheSparrate * Math.pow(1 + dyn, y - 1);
      balance = (balance + savings * 12) * (1 + roi);
      const realVal = balance / Math.pow(1 + inf, y);
      if (realVal >= fireNumber) {
        return { fireAge: data.currentAge + y, fireNumber };
      }
    }
    return { fireAge: null, fireNumber };
  }, [data.startKapital, data.monatlicheSparrate, data.monatlichesWunschEinkommen, data.currentAge, data.taxCountry]);

  const steps = [
    {
      title: t.onboardingStep1Title,
      desc: t.onboardingStep1Desc,
      icon: "👤",
    },
    {
      title: t.onboardingStep2Title,
      desc: t.onboardingStep2Desc,
      icon: "💰",
    },
    {
      title: t.onboardingStep3Title,
      desc: t.onboardingStep3Desc,
      icon: "🎯",
    },
    {
      title: t.onboardingStep4Title,
      desc: t.onboardingStep4Desc,
      icon: "🌍",
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(data);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const update = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f294d] rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center">
          <h2 className="text-xl font-bold text-white mb-1">{t.onboardingTitle}</h2>
          <p className="text-sm text-slate-400">{t.onboardingSubtitle}</p>
        </div>

        <StepIndicator current={step} total={steps.length} />

        {/* Step Content */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl">{steps[step].icon}</span>
            <div>
              <h3 className="text-white font-semibold">{steps[step].title}</h3>
              <p className="text-xs text-slate-400">{steps[step].desc}</p>
            </div>
          </div>

          {step === 0 && (
            <>
              <NumberInput
                label={t.onboardingAgeLabel}
                value={data.currentAge}
                onChange={(v) => update("currentAge", v)}
                min={18}
                max={65}
                step={1}
              />
              <NumberInput
                label={t.onboardingIncomeLabel}
                value={data.monatlichesNetto}
                onChange={(v) => update("monatlichesNetto", v)}
                min={500}
                max={30_000}
                step={100}
              />
            </>
          )}

          {step === 1 && (
            <>
              <NumberInput
                label={t.onboardingStartCapitalLabel}
                value={data.startKapital}
                onChange={(v) => update("startKapital", v)}
                min={0}
                max={2_000_000}
                step={1_000}
              />
              <NumberInput
                label={t.onboardingSavingsLabel}
                value={data.monatlicheSparrate}
                onChange={(v) => update("monatlicheSparrate", v)}
                min={50}
                max={20_000}
                step={50}
              />
            </>
          )}

          {step === 2 && (
            <NumberInput
              label={t.onboardingDesiredIncomeLabel}
              value={data.monatlichesWunschEinkommen}
              onChange={(v) => update("monatlichesWunschEinkommen", v)}
              min={500}
              max={15_000}
              step={100}
            />
          )}

          {step === 3 && (
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-300 mb-2">{t.onboardingCountryLabel}</label>
              <div className="grid grid-cols-3 gap-2">
                {TAX_COUNTRIES.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => update("taxCountry", code)}
                    className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-colors border ${
                      data.taxCountry === code
                        ? "bg-emerald-500 border-emerald-400 text-white"
                        : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {COUNTRY_LABELS[code]}
                  </button>
                ))}
              </div>

              {/* FIRE Preview */}
              <div className="mt-5 p-4 rounded-xl bg-slate-700/50 border border-slate-600">
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                  {t.onboardingPreviewTitle}
                </h4>
                {firePreview.fireAge !== null ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎯</span>
                      <span className="text-white font-bold text-lg">
                        {t.onboardingPreviewFireAge(firePreview.fireAge)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {t.onboardingPreviewFireNumber}: {formatCurrencyShort(firePreview.fireNumber)}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-amber-400/80">
                    {t.onboardingPreviewNotReachable}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={step === 0 ? onSkip : handleBack}
            className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-2"
          >
            {step === 0 ? t.onboardingSkip : t.onboardingBack}
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            {step === steps.length - 1 ? t.onboardingFinish : t.onboardingNext}
          </button>
        </div>
      </div>
    </div>
  );
}
