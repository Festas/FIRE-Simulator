"use client";

import React, { useState } from "react";
import { FireInputs } from "@/lib/fireCalculations";

/* ------------------------------------------------------------------ */
/* Tooltip                                                             */
/* ------------------------------------------------------------------ */

function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block ml-1">
      <button
        type="button"
        className="text-slate-500 hover:text-slate-300 transition-colors"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow((p) => !p)}
        aria-label="Info"
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-200 shadow-xl border border-slate-600 leading-relaxed pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Slider + Number Input Field                                         */
/* ------------------------------------------------------------------ */

interface SliderFieldProps {
  label: string;
  subLabel?: string;
  tooltip?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}

function SliderField({
  label,
  subLabel,
  tooltip,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: SliderFieldProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const handleValueClick = () => {
    setEditValue(String(value));
    setEditing(true);
  };

  const handleEditConfirm = () => {
    const parsed = parseFloat(editValue.replace(/[^0-9.,\-]/g, "").replace(",", "."));
    if (!isNaN(parsed)) {
      onChange(Math.max(min, Math.min(max, parsed)));
    }
    setEditing(false);
  };

  return (
    <div className="mb-5">
      <div className="flex justify-between items-baseline mb-1">
        <label className="text-sm font-medium text-slate-300 flex items-center">
          {label}
          {tooltip && <InfoTooltip text={tooltip} />}
        </label>
        {editing ? (
          <input
            type="text"
            className="w-24 text-right text-sm font-semibold bg-slate-700 text-white rounded px-2 py-0.5 border border-emerald-400 outline-none"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleEditConfirm}
            onKeyDown={(e) => e.key === "Enter" && handleEditConfirm()}
            autoFocus
          />
        ) : (
          <button
            type="button"
            onClick={handleValueClick}
            className="text-sm font-semibold text-white hover:text-emerald-300 transition-colors cursor-text border-b border-dashed border-slate-600 hover:border-emerald-400"
          >
            {format(value)}
          </button>
        )}
      </div>
      {subLabel && <p className="text-xs text-slate-500 mb-2">{subLabel}</p>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-700"
        style={{
          background: `linear-gradient(to right, #10b981 0%, #10b981 ${((value - min) / (max - min)) * 100}%, #334155 ${((value - min) / (max - min)) * 100}%, #334155 100%)`,
        }}
      />
      <div className="flex justify-between mt-1">
        <span className="text-xs text-slate-600">{format(min)}</span>
        <span className="text-xs text-slate-600">{format(max)}</span>
      </div>
    </div>
  );
}

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
  options,
  value,
  onChange,
  tooltip,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  tooltip?: string;
}) {
  return (
    <div className="mb-4">
      {tooltip && (
        <div className="flex items-center mb-2">
          <span className="text-sm text-slate-300">Entnahme-Modus</span>
          <InfoTooltip text={tooltip} />
        </div>
      )}
      <div className="flex rounded-lg bg-slate-700 p-0.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
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
      <div className="flex rounded-lg bg-slate-700 p-0.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
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
}

export default function Sidebar({ inputs, onChange }: SidebarProps) {
  const fmtEuro = (v: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(v);
  const fmtPct = (v: number) => `${v.toFixed(1)} %`;
  const fmtYrs = (v: number) => `${v} Jahre`;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">F</span>
          </div>
          <div>
            <h1 className="text-white text-lg font-bold leading-tight">FIRE Masterplan</h1>
            <p className="text-slate-400 text-xs">Family Office Simulator</p>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="flex-1 overflow-y-auto px-6 py-5 sidebar-scroll">
        {/* ===== RETIREMENT GOALS ===== */}
        <p className="text-xs uppercase tracking-widest text-emerald-400 mb-4 font-semibold">
          🎯 Ruhestandsziel
        </p>

        <SliderField
          label="Wunsch-Einkommen"
          subLabel="Netto monatlich im Ruhestand (heute)"
          tooltip="Wie viel möchten Sie monatlich im Ruhestand zur Verfügung haben? Daraus wird automatisch Ihr Zielvermögen berechnet."
          value={inputs.monatlichesWunschEinkommen}
          min={1_000}
          max={15_000}
          step={100}
          onChange={(v) => onChange("monatlichesWunschEinkommen", v)}
          format={fmtEuro}
        />

        <SliderField
          label="Gesetzliche Rente"
          subLabel="Erwartete monatliche Rente"
          tooltip="Ihre erwartete gesetzliche Rente reduziert die benötigte Entnahme aus dem Portfolio. Finden Sie Ihren Wert in der jährlichen Renteninformation."
          value={inputs.gesetzlicheRente}
          min={0}
          max={4_000}
          step={50}
          onChange={(v) => onChange("gesetzlicheRente", v)}
          format={fmtEuro}
        />

        <SliderField
          label="Safe Withdrawal Rate"
          subLabel="Sichere jährliche Entnahmerate"
          tooltip="Die Entnahmerate bestimmt, wie viel Prozent Ihres Vermögens Sie pro Jahr entnehmen. 3,5% gilt als konservativ, 4% als Standard (Trinity Study)."
          value={inputs.swr}
          min={2.5}
          max={5.0}
          step={0.1}
          onChange={(v) => onChange("swr", v)}
          format={fmtPct}
        />

        {/* ===== SPARPHASE ===== */}
        <div className="border-t border-slate-700 pt-5 mt-2">
          <p className="text-xs uppercase tracking-widest text-emerald-400 mb-4 font-semibold">
            💰 Sparphase
          </p>

          <SliderField
            label="Startkapital"
            subLabel="Aktuelles investiertes Vermögen"
            tooltip="Der Gesamtwert Ihrer aktuellen Investments (ETF-Depot, Aktien etc.)."
            value={inputs.startKapital}
            min={0}
            max={500_000}
            step={5_000}
            onChange={(v) => onChange("startKapital", v)}
            format={fmtEuro}
          />

          <SliderField
            label="Monatliche Sparrate"
            subLabel="Monatlicher ETF-Sparplan"
            tooltip="Ihr regelmäßiger monatlicher Investitionsbetrag."
            value={inputs.monatlicheSparrate}
            min={100}
            max={10_000}
            step={50}
            onChange={(v) => onChange("monatlicheSparrate", v)}
            format={fmtEuro}
          />

          <SliderField
            label="Dynamik Sparrate"
            subLabel="Jährliche Erhöhung der Sparrate"
            tooltip="Prozentuale Steigerung der Sparrate pro Jahr, z.B. durch Gehaltserhöhungen."
            value={inputs.dynamikSparrate}
            min={0}
            max={5}
            step={0.1}
            onChange={(v) => onChange("dynamikSparrate", v)}
            format={fmtPct}
          />

          <SliderField
            label="Bruttoeinkommen"
            subLabel="Für Sparquoten-Berechnung"
            tooltip="Ihr monatliches Bruttoeinkommen. Wird nur zur Berechnung Ihrer Sparquote verwendet."
            value={inputs.monatlichesBrutto}
            min={0}
            max={20_000}
            step={100}
            onChange={(v) => onChange("monatlichesBrutto", v)}
            format={fmtEuro}
          />

          <SliderField
            label="BAV-Zuschuss"
            subLabel="Betriebliche Altersversorgung p.a."
            tooltip="Jährlicher Gesamtbetrag der betrieblichen Altersversorgung inkl. Arbeitgeberanteil."
            value={inputs.bavJaehrlich}
            min={0}
            max={20_000}
            step={500}
            onChange={(v) => onChange("bavJaehrlich", v)}
            format={(v) => `${fmtEuro(v)}/J`}
          />
        </div>

        {/* ===== RENDITE & MARKT ===== */}
        <div className="border-t border-slate-700 pt-5 mt-2">
          <p className="text-xs uppercase tracking-widest text-emerald-400 mb-4 font-semibold">
            📈 Rendite & Markt
          </p>

          <SliderField
            label="Erwartete ETF-Rendite"
            subLabel="Erwartete Jahresrendite (brutto)"
            tooltip="Historische Durchschnittsrendite des MSCI World liegt bei ca. 7% p.a. vor Inflation."
            value={inputs.etfRendite}
            min={2}
            max={12}
            step={0.1}
            onChange={(v) => onChange("etfRendite", v)}
            format={fmtPct}
          />

          <SliderField
            label="Inflation p.a."
            subLabel="Inflationsrate zur Kaufkraftanpassung"
            tooltip="Alle Werte werden kaufkraftbereinigt dargestellt. Die EZB strebt 2% an, historisch lag sie bei 2-3%."
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
            🏛️ Steuern
          </p>

          <SelectToggle
            label="Veranlagung"
            tooltip="Bestimmt den Sparerpauschbetrag: 1.000 € (Einzel) oder 2.000 € (Zusammen)."
            options={[
              { value: "single" as const, label: "Einzel" },
              { value: "couple" as const, label: "Zusammen" },
            ]}
            value={inputs.steuerModell}
            onChange={(v) => onChange("steuerModell", v)}
          />

          <ToggleSwitch
            label="Kirchensteuer"
            tooltip="Erhöht den Steuersatz auf Kapitalerträge von 26,375% auf ca. 27,82%."
            checked={inputs.kirchensteuer}
            onChange={(v) => onChange("kirchensteuer", v)}
          />
        </div>

        {/* ===== ENTNAHME ===== */}
        <div className="border-t border-slate-700 pt-5 mt-2">
          <p className="text-xs uppercase tracking-widest text-emerald-400 mb-4 font-semibold">
            📤 Entnahme-Strategie
          </p>

          <SegmentToggle
            tooltip="'Kapital erhalten' (Ewige Rente): Sie leben nur von den Erträgen. 'Aufbrauchen': Das Vermögen wird über einen definierten Zeitraum komplett entnommen."
            options={[
              { value: "ewigeRente" as const, label: "Kapital erhalten" },
              { value: "kapitalverzehr" as const, label: "Aufbrauchen" },
            ]}
            value={inputs.entnahmeModell}
            onChange={(v) => onChange("entnahmeModell", v)}
          />

          {inputs.entnahmeModell === "kapitalverzehr" && (
            <SliderField
              label="Entnahme-Dauer"
              subLabel="Kapital in X Jahren aufbrauchen"
              tooltip="Über wie viele Jahre soll das Kapital verteilt werden?"
              value={inputs.kapitalverzehrJahre}
              min={10}
              max={50}
              step={1}
              onChange={(v) => onChange("kapitalverzehrJahre", v)}
              format={fmtYrs}
            />
          )}
        </div>

        {/* ===== LZK ===== */}
        <div className="border-t border-slate-700 pt-5 mt-2">
          <p className="text-xs uppercase tracking-widest text-emerald-400 mb-4 font-semibold">
            🔒 Langzeitkonto (LZK)
          </p>

          <SliderField
            label="LZK-Phase (Jahre)"
            subLabel="Endspurt-Dauer vor dem FIRE-Exit"
            tooltip="In den letzten Jahren vor dem Exit fließen Ihre Beiträge in ein risikoarmes Langzeitkonto."
            value={inputs.lzkJahre}
            min={1}
            max={7}
            step={1}
            onChange={(v) => onChange("lzkJahre", v)}
            format={fmtYrs}
          />

          <SliderField
            label="LZK-Rendite"
            subLabel="Zinssatz des Langzeitkontos"
            tooltip="Rendite des LZK (z.B. Festgeld, Tagesgeld). Typisch: 2-4% p.a."
            value={inputs.lzkRendite}
            min={0}
            max={6}
            step={0.1}
            onChange={(v) => onChange("lzkRendite", v)}
            format={fmtPct}
          />
        </div>

        {/* ===== Override Target ===== */}
        <div className="border-t border-slate-700 pt-5 mt-2">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-4 font-semibold">
            Manuelles Zielvermögen
          </p>
          <SliderField
            label="Zielvermögen (Override)"
            subLabel="Überschreibt die automatische FIRE-Zahl"
            tooltip="Standardmäßig wird Ihr Zielvermögen aus dem Wunsch-Einkommen, der Rente und der SWR berechnet. Hier können Sie es manuell überschreiben."
            value={inputs.zielvermoegen}
            min={100_000}
            max={5_000_000}
            step={50_000}
            onChange={(v) => onChange("zielvermoegen", v)}
            format={fmtEuro}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-slate-700">
        <p className="text-xs text-slate-600 text-center">
          Simulationsbeginn {inputs.startYear} · SWR {inputs.swr.toFixed(1)} %
        </p>
      </div>
    </div>
  );
}
