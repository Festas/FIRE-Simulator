"use client";

import React, { useState, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { TAX_COUNTRIES } from "@/lib/tax";
import type { TaxCountry } from "@/lib/tax";
import { COUNTRY_DEFAULTS } from "@/lib/countryDefaults";
import { calculateFIRE } from "@/lib/fireCalculations";
import type { FireInputs } from "@/lib/fireCalculations";

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

  // Build full FireInputs from wizard data + country defaults so the preview
  // uses exactly the same calculation as the main simulator.
  const previewInputs = useMemo((): FireInputs => {
    const countryDef = COUNTRY_DEFAULTS[data.taxCountry];
    const swrPct = countryDef.swr;
    const swrDecimal = swrPct / 100;
    const zielvermoegen =
      swrDecimal > 0
        ? Math.round((data.monatlichesWunschEinkommen * 12) / swrDecimal)
        : 0;
    return {
      startKapital: data.startKapital,
      monatlicheSparrate: data.monatlicheSparrate,
      dynamikSparrate: 2.0,
      etfRendite: countryDef.etfRendite,
      inflation: countryDef.inflation,
      bavJaehrlich: 0,
      zielvermoegen,
      zielvermoegenOverride: false,
      lzkJahre: 0,
      lzkRendite: 0,
      startYear: new Date().getFullYear(),
      currentAge: data.currentAge,
      monatlichesWunschEinkommen: data.monatlichesWunschEinkommen,
      gesetzlicheRente: countryDef.gesetzlicheRente,
      renteneintrittsalter: countryDef.renteneintrittsalter,
      swr: swrPct,
      steuerModell: "single",
      kirchensteuer: false,
      taxCountry: data.taxCountry,
      entnahmeModell: "ewigeRente",
      kapitalverzehrJahre: 30,
      monatlichesNetto: data.monatlichesNetto,
      lifeEvents: [],
      arbeitszeitkontoEnabled: false,
      stundenProJahr: 0,
      wochenStunden: 40,
    };
  }, [data]);

  const firePreview = useMemo(() => {
    const result = calculateFIRE(previewInputs);
    return {
      fireAge: result.fullFireAge,
      fireNumber: result.derivedFireNumber,
    };
  }, [previewInputs]);

  const [showQuickResult, setShowQuickResult] = useState(false);

  // Currency symbol for benchmarks
  const currencySymbol = (() => {
    try {
      const parts = new Intl.NumberFormat("en", { style: "currency", currency: data.taxCountry === "US" ? "USD" : data.taxCountry === "UK" ? "GBP" : data.taxCountry === "CH" ? "CHF" : data.taxCountry === "CA" ? "CAD" : data.taxCountry === "AU" ? "AUD" : "EUR", maximumFractionDigits: 0 }).formatToParts(0);
      return parts.find(p => p.type === "currency")?.value ?? "€";
    } catch { return "€"; }
  })();

  // Auto-fill with country average
  const applyCountryAvg = () => {
    const def = COUNTRY_DEFAULTS[data.taxCountry];
    setData(prev => ({
      ...prev,
      monatlichesNetto: def.monatlichesNetto,
      monatlicheSparrate: def.monatlicheSparrate,
      monatlichesWunschEinkommen: def.monatlichesWunschEinkommen,
      startKapital: 10_000,
    }));
  };

  const steps = useMemo(() => [
    {
      title: t.onboardingStep1Title,
      desc: t.onboardingStep1DescStory,
      icon: "👤",
    },
    {
      title: t.onboardingStep2Title,
      desc: t.onboardingStep2DescStory,
      icon: "💰",
    },
    {
      title: t.onboardingStep3Title,
      desc: t.onboardingStep3DescStory,
      icon: "🎯",
    },
    {
      title: t.onboardingStep4Title,
      desc: t.onboardingStep4DescStory,
      icon: "🌍",
    },
  ], [t]);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else if (!showQuickResult && firePreview.fireAge !== null) {
      setShowQuickResult(true);
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
          {showQuickResult ? (
            /* Quick Result celebration screen */
            <div className="text-center py-4">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-white mb-2">
                {t.onboardingQuickResultTitle}
              </h3>
              {firePreview.fireAge !== null && (
                <p className="text-2xl font-bold text-emerald-400 mb-3">
                  {t.onboardingQuickResultBody(firePreview.fireAge)}
                </p>
              )}
              <p className="text-sm text-slate-400 mb-2">
                {t.onboardingPreviewFireNumber}: {formatCurrencyShort(firePreview.fireNumber)}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">{steps[step].icon}</span>
                <div>
                  <h3 className="text-white font-semibold">{steps[step].title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{steps[step].desc}</p>
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
                  <p className="text-[10px] text-slate-500 -mt-3 mb-4 ml-1">{t.onboardingBenchmarkAge}</p>
                  <NumberInput
                    label={t.onboardingIncomeLabel}
                    value={data.monatlichesNetto}
                    onChange={(v) => update("monatlichesNetto", v)}
                    min={500}
                    max={30_000}
                    step={100}
                  />
                  <p className="text-[10px] text-slate-500 -mt-3 mb-2 ml-1">{t.onboardingBenchmarkIncome(currencySymbol)}</p>
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
                  <p className="text-[10px] text-slate-500 -mt-3 mb-2 ml-1">{t.onboardingBenchmarkSavings(currencySymbol)}</p>
                </>
              )}

              {step === 2 && (
                <>
                  <NumberInput
                    label={t.onboardingDesiredIncomeLabel}
                    value={data.monatlichesWunschEinkommen}
                    onChange={(v) => update("monatlichesWunschEinkommen", v)}
                    min={500}
                    max={15_000}
                    step={100}
                  />
                  <p className="text-[10px] text-slate-500 -mt-3 mb-2 ml-1">{t.onboardingBenchmarkDesiredIncome(currencySymbol)}</p>
                </>
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

                  {/* Use country average button */}
                  <button
                    type="button"
                    onClick={applyCountryAvg}
                    className="mt-3 w-full text-xs text-emerald-400 hover:text-emerald-300 transition-colors py-1.5 rounded-lg border border-dashed border-emerald-500/30 hover:border-emerald-500/60"
                  >
                    {t.onboardingUseCountryAvg}
                  </button>

                  {/* FIRE Preview */}
                  <div className="mt-4 p-4 rounded-xl bg-slate-700/50 border border-slate-600">
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
            </>
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
            {showQuickResult ? t.onboardingQuickResultCelebrate : step === steps.length - 1 ? t.onboardingFinish : t.onboardingNext}
          </button>
        </div>
      </div>
    </div>
  );
}
