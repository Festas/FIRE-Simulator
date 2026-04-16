"use client";

import React from "react";
import { FireInputs } from "@/lib/fireCalculations";
import { useI18n } from "@/lib/i18n";
import SliderField, { InfoTooltip } from "@/app/components/ui/SliderField";

/* ------------------------------------------------------------------ */
/* Toggle Switch                                                       */
/* ------------------------------------------------------------------ */

function ToggleSwitch({
  label,
  tooltip,
  checked,
  onChange,
}: {
  label: string;
  tooltip?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm text-slate-300 flex items-center">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          checked ? "bg-emerald-500" : "bg-slate-600"
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Segment Toggle                                                      */
/* ------------------------------------------------------------------ */

function SegmentToggle<T extends string>({
  label,
  options,
  value,
  onChange,
  tooltip,
}: {
  label?: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  tooltip?: string;
}) {
  return (
    <div className="mb-4">
      {(label || tooltip) && (
        <div className="flex items-center mb-2">
          {label && <span className="text-sm text-slate-300">{label}</span>}
          {tooltip && <InfoTooltip text={tooltip} />}
        </div>
      )}
      <div className="flex rounded-lg bg-slate-700 p-0.5" role="radiogroup" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            role="radio"
            aria-checked={value === opt.value}
            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
              value === opt.value
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Select Toggle (Single / Couple)                                     */
/* ------------------------------------------------------------------ */

function SelectToggle<T extends string>({
  label,
  tooltip,
  options,
  value,
  onChange,
}: {
  label: string;
  tooltip?: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center mb-2">
        <span className="text-sm text-slate-300">{label}</span>
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      <div className="flex rounded-lg bg-slate-700 p-0.5" role="radiogroup" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            role="radio"
            aria-checked={value === opt.value}
            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
              value === opt.value
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Sidebar                                                        */
/* ------------------------------------------------------------------ */

interface SidebarProps {
  inputs: FireInputs;
  onChange: (key: keyof FireInputs, value: number | string | boolean) => void;
  onReset: () => void;
}

export default function Sidebar({ inputs, onChange, onReset }: SidebarProps) {
  const { t, formatCurrency, formatPercent } = useI18n();
  const fmtEuro = formatCurrency;
  const fmtPct = formatPercent;
  const fmtYrs = (v: number) => `${v} ${t.years}`;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">F</span>
          </div>
          <div>
            <h1 className="text-white text-lg font-bold leading-tight">{t.sidebarTitle}</h1>
            <p className="text-slate-400 text-xs">{t.sidebarSubtitle}</p>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="flex-1 overflow-y-auto px-6 py-5 sidebar-scroll">
        {/* ===== RETIREMENT GOALS ===== */}
        <p className="text-xs uppercase tracking-widest text-emerald-400 mb-4 font-semibold">
          {t.retirementGoals}
        </p>

        <SliderField
          label={t.desiredIncome}
          subLabel={t.desiredIncomeSub}
          tooltip={t.desiredIncomeTooltip}
          value={inputs.monatlichesWunschEinkommen}
          min={1_000}
          max={15_000}
          step={100}
          onChange={(v) => onChange("monatlichesWunschEinkommen", v)}
          format={fmtEuro}
        />

        <SliderField
          label={t.statePension}
          subLabel={t.statePensionSub}
          tooltip={t.statePensionTooltip}
          value={inputs.gesetzlicheRente}
          min={0}
          max={4_000}
          step={50}
          onChange={(v) => onChange("gesetzlicheRente", v)}
          format={fmtEuro}
        />

        <SliderField
          label={t.swr}
          subLabel={t.swrSub}
          tooltip={t.swrTooltip}
          value={inputs.swr}
          min={2.5}
          max={5.0}
          step={0.1}
          onChange={(v) => onChange("swr", v)}
          format={fmtPct}
        />

        <SliderField
          label={t.currentAge}
          subLabel={t.currentAgeSub}
          tooltip={t.currentAgeTooltip}
          value={inputs.currentAge}
          min={18}
          max={65}
          step={1}
          onChange={(v) => onChange("currentAge", v)}
          format={(v) => `${v}`}
        />

        <SliderField
          label={t.retirementAge}
          subLabel={t.retirementAgeSub}
          tooltip={t.retirementAgeTooltip}
          value={inputs.renteneintrittsalter}
          min={60}
          max={70}
          step={1}
          onChange={(v) => onChange("renteneintrittsalter", v)}
          format={(v) => `${v}`}
        />

        {/* ===== SPARPHASE ===== */}
        <div className="border-t border-slate-700 pt-5 mt-2">
          <p className="text-xs uppercase tracking-widest text-emerald-400 mb-4 font-semibold">
            {t.savingsPhase}
          </p>

          <SliderField
            label={t.startCapital}
            subLabel={t.startCapitalSub}
            tooltip={t.startCapitalTooltip}
            value={inputs.startKapital}
            min={0}
            max={2_000_000}
            step={5_000}
            onChange={(v) => onChange("startKapital", v)}
            format={fmtEuro}
          />

          <SliderField
            label={t.monthlySavings}
            subLabel={t.monthlySavingsSub}
            tooltip={t.monthlySavingsTooltip}
            value={inputs.monatlicheSparrate}
            min={100}
            max={20_000}
            step={50}
            onChange={(v) => onChange("monatlicheSparrate", v)}
            format={fmtEuro}
          />

          <SliderField
            label={t.dynamicSavings}
            subLabel={t.dynamicSavingsSub}
            tooltip={t.dynamicSavingsTooltip}
            value={inputs.dynamikSparrate}
            min={0}
            max={5}
            step={0.1}
            onChange={(v) => onChange("dynamikSparrate", v)}
            format={fmtPct}
          />

          <SliderField
            label={t.netIncome}
            subLabel={t.netIncomeSub}
            tooltip={t.netIncomeTooltip}
            value={inputs.monatlichesNetto}
            min={0}
            max={20_000}
            step={100}
            onChange={(v) => onChange("monatlichesNetto", v)}
            format={fmtEuro}
          />

          <SliderField
            label={t.bavContribution}
            subLabel={t.bavContributionSub}
            tooltip={t.bavContributionTooltip}
            value={inputs.bavJaehrlich}
            min={0}
            max={20_000}
            step={500}
            onChange={(v) => onChange("bavJaehrlich", v)}
            format={(v) => `${fmtEuro(v)}${t.perYear}`}
          />
        </div>

        {/* ===== RENDITE & MARKT ===== */}
        <div className="border-t border-slate-700 pt-5 mt-2">
          <p className="text-xs uppercase tracking-widest text-emerald-400 mb-4 font-semibold">
            {t.returnMarket}
          </p>

          <SliderField
            label={t.expectedReturn}
            subLabel={t.expectedReturnSub}
            tooltip={t.expectedReturnTooltip}
            value={inputs.etfRendite}
            min={2}
            max={12}
            step={0.1}
            onChange={(v) => onChange("etfRendite", v)}
            format={fmtPct}
          />

          <SliderField
            label={t.inflationRate}
            subLabel={t.inflationRateSub}
            tooltip={t.inflationRateTooltip}
            value={inputs.inflation}
            min={0}
            max={6}
            step={0.1}
            onChange={(v) => onChange("inflation", v)}
            format={fmtPct}
          />
        </div>

        {/* ===== STEUER ===== */}
        <div className="border-t border-slate-700 pt-5 mt-2">
          <p className="text-xs uppercase tracking-widest text-emerald-400 mb-4 font-semibold">
            {t.taxes}
          </p>

          {/* Tax Country Selector */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <span className="text-sm text-slate-300">{t.taxCountry}</span>
              <InfoTooltip text={t.taxCountryTooltip} />
            </div>
            <select
              value={inputs.taxCountry}
              onChange={(e) => onChange("taxCountry", e.target.value)}
              className="w-full text-sm font-medium py-2 px-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-emerald-400 focus:outline-none appearance-none cursor-pointer"
              aria-label={t.taxCountry}
            >
              <option value="DE">{t.taxCountryDE}</option>
              <option value="US">{t.taxCountryUS}</option>
              <option value="UK">{t.taxCountryUK}</option>
              <option value="CH">{t.taxCountryCH}</option>
              <option value="AT">{t.taxCountryAT}</option>
              <option value="NL">{t.taxCountryNL}</option>
            </select>
          </div>

          <SelectToggle
            label={t.taxFiling}
            tooltip={t.taxFilingTooltip}
            options={[
              { value: "single" as const, label: t.taxFilingSingle },
              { value: "couple" as const, label: t.taxFilingCouple },
            ]}
            value={inputs.steuerModell}
            onChange={(v) => onChange("steuerModell", v)}
          />

          {inputs.taxCountry === "DE" && (
            <ToggleSwitch
              label={t.churchTax}
              tooltip={t.churchTaxTooltip}
              checked={inputs.kirchensteuer}
              onChange={(v) => onChange("kirchensteuer", v)}
            />
          )}
        </div>

        {/* ===== ENTNAHME ===== */}
        <div className="border-t border-slate-700 pt-5 mt-2">
          <p className="text-xs uppercase tracking-widest text-emerald-400 mb-4 font-semibold">
            {t.withdrawalStrategy}
          </p>

          <SegmentToggle
            label={t.withdrawalMode}
            tooltip={t.withdrawalModeTooltip}
            options={[
              { value: "ewigeRente" as const, label: t.withdrawalPreserve },
              { value: "kapitalverzehr" as const, label: t.withdrawalSpend },
            ]}
            value={inputs.entnahmeModell}
            onChange={(v) => onChange("entnahmeModell", v)}
          />

          {inputs.entnahmeModell === "kapitalverzehr" && (
            <SliderField
              label={t.withdrawalDuration}
              subLabel={t.withdrawalDurationSub}
              tooltip={t.withdrawalDurationTooltip}
              value={inputs.kapitalverzehrJahre}
              min={10}
              max={50}
              step={1}
              onChange={(v) => onChange("kapitalverzehrJahre", v)}
              format={fmtYrs}
            />
          )}
        </div>

        {/* ===== Arbeitszeitkonto ===== */}
        <div className="border-t border-slate-700 pt-5 mt-2">
          <p className="text-xs uppercase tracking-widest text-emerald-400 mb-4 font-semibold">
            {t.lzkSection}
          </p>

          {/* Toggle for Arbeitszeitkonto */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-slate-300">{t.azkEnabled}</span>
              <InfoTooltip text={t.azkEnabledTooltip} />
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={inputs.arbeitszeitkontoEnabled}
              onClick={() => onChange("arbeitszeitkontoEnabled", !inputs.arbeitszeitkontoEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#0f294d] ${
                inputs.arbeitszeitkontoEnabled ? "bg-emerald-500" : "bg-slate-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  inputs.arbeitszeitkontoEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {inputs.arbeitszeitkontoEnabled ? (
            <>
              <SliderField
                label={t.azkHoursPerYear}
                subLabel={t.azkHoursPerYearSub}
                tooltip={t.azkHoursPerYearTooltip}
                value={inputs.stundenProJahr}
                min={0}
                max={500}
                step={10}
                onChange={(v) => onChange("stundenProJahr", v)}
                format={(v) => `${v} h`}
              />
              <SliderField
                label={t.azkWeeklyHours}
                subLabel={t.azkWeeklyHoursSub}
                tooltip={t.azkWeeklyHoursTooltip}
                value={inputs.wochenStunden}
                min={20}
                max={50}
                step={1}
                onChange={(v) => onChange("wochenStunden", v)}
                format={(v) => `${v} h`}
              />
              {/* Computed Freistellung duration display */}
              <div className="mt-2 px-1 py-2 bg-slate-700/50 rounded-lg text-center">
                <p className="text-xs text-slate-400">{t.azkFreistellungDuration}</p>
                <p className="text-lg font-bold text-emerald-400">
                  {(inputs.stundenProJahr / (inputs.wochenStunden * 52)).toFixed(2)} {t.years} / {t.perYear}
                </p>
              </div>
            </>
          ) : (
            <SliderField
              label={t.lzkPhase}
              subLabel={t.lzkPhaseSub}
              tooltip={t.lzkPhaseTooltip}
              value={inputs.lzkJahre}
              min={0}
              max={7}
              step={1}
              onChange={(v) => onChange("lzkJahre", v)}
              format={fmtYrs}
            />
          )}
        </div>

        {/* ===== Override Target ===== */}
        <div className="border-t border-slate-700 pt-5 mt-2">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-4 font-semibold">
            {t.manualTarget}
          </p>

          {/* Toggle for manual override */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-slate-300">{t.targetWealthOverride}</span>
              <InfoTooltip text={t.targetWealthOverrideTooltip} />
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={inputs.zielvermoegenOverride}
              onClick={() => onChange("zielvermoegenOverride", !inputs.zielvermoegenOverride)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#0f294d] ${
                inputs.zielvermoegenOverride ? "bg-emerald-500" : "bg-slate-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  inputs.zielvermoegenOverride ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {inputs.zielvermoegenOverride ? (
            <SliderField
              label={t.targetWealth}
              subLabel={t.targetWealthSub}
              tooltip={t.targetWealthTooltip}
              value={inputs.zielvermoegen}
              min={100_000}
              max={10_000_000}
              step={50_000}
              onChange={(v) => onChange("zielvermoegen", v)}
              format={fmtEuro}
            />
          ) : (
            <div className="rounded-lg bg-slate-800/50 border border-slate-700 px-4 py-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-slate-400">{t.targetWealth}</span>
                <span className="text-sm font-semibold text-slate-300">{fmtEuro(inputs.zielvermoegen)}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{t.targetWealthAuto}</p>
            </div>
          )}
        </div>

        {/* ===== Quick Presets ===== */}
        <div className="border-t border-slate-700 pt-5 mt-2">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-3 font-semibold">
            {t.presetLabel}
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                onChange("etfRendite", 5.0);
                onChange("swr", 3.0);
                onChange("inflation", 3.0);
              }}
              className="w-full text-left px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
            >
              <span className="text-xs font-medium text-slate-300">{t.presetConservative}</span>
              <span className="block text-[10px] text-slate-500 mt-0.5">{t.presetConservativeDesc}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onChange("etfRendite", 7.0);
                onChange("swr", 3.5);
                onChange("inflation", 2.5);
              }}
              className="w-full text-left px-3 py-2 rounded-lg bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors"
            >
              <span className="text-xs font-medium text-emerald-400">{t.presetBalanced}</span>
              <span className="block text-[10px] text-emerald-500/70 mt-0.5">{t.presetBalancedDesc}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onChange("etfRendite", 9.0);
                onChange("swr", 4.0);
                onChange("inflation", 2.0);
              }}
              className="w-full text-left px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
            >
              <span className="text-xs font-medium text-slate-300">{t.presetAggressive}</span>
              <span className="block text-[10px] text-slate-500 mt-0.5">{t.presetAggressiveDesc}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-slate-700 flex items-center justify-between gap-2">
        <p className="text-xs text-slate-600">
          {t.simulationStart} {inputs.startYear} · SWR {inputs.swr.toFixed(1)} %
        </p>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded border border-slate-700 hover:border-red-400/50"
        >
          {t.resetDefaults}
        </button>
      </div>
    </div>
  );
}
