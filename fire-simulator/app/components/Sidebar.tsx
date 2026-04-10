"use client";

import React from "react";
import { FireInputs } from "@/lib/fireCalculations";

interface SliderFieldProps {
  label: string;
  subLabel?: string;
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
  value,
  min,
  max,
  step,
  onChange,
  format,
}: SliderFieldProps) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-baseline mb-1">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <span className="text-sm font-semibold text-white">{format(value)}</span>
      </div>
      {subLabel && (
        <p className="text-xs text-slate-500 mb-2">{subLabel}</p>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer
          bg-slate-700
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-emerald-400
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:shadow-md
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-emerald-400
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:cursor-pointer"
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

interface SidebarProps {
  inputs: FireInputs;
  onChange: (key: keyof FireInputs, value: number) => void;
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
      <div className="px-6 py-6 border-b border-slate-700">
        <div className="flex items-center gap-3 mb-1">
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
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-4 font-semibold">
          Parameter
        </p>

        <SliderField
          label="Startkapital"
          subLabel="Aktuelles investiertes Vermögen"
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
          value={inputs.monatlicheSparrate}
          min={500}
          max={10_000}
          step={50}
          onChange={(v) => onChange("monatlicheSparrate", v)}
          format={fmtEuro}
        />

        <SliderField
          label="Dynamik Sparrate"
          subLabel="Jährliche Erhöhung der Sparrate"
          value={inputs.dynamikSparrate}
          min={0}
          max={5}
          step={0.1}
          onChange={(v) => onChange("dynamikSparrate", v)}
          format={fmtPct}
        />

        <SliderField
          label="Erwartete ETF-Rendite"
          subLabel="Erwartete Jahresrendite (brutto)"
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
          value={inputs.inflation}
          min={0}
          max={6}
          step={0.1}
          onChange={(v) => onChange("inflation", v)}
          format={fmtPct}
        />

        <div className="mb-6">
          <div className="flex justify-between items-baseline mb-1">
            <label className="text-sm font-medium text-slate-300">BAV-Zuschuss</label>
            <span className="text-sm font-semibold text-white">{fmtEuro(inputs.bavJaehrlich)}/J</span>
          </div>
          <p className="text-xs text-slate-500 mb-2">
            Gesamtbetrag betriebliche Altersversorgung p.a. (inkl. AG-Anteil)
          </p>
          <input
            type="range"
            min={0}
            max={20_000}
            step={500}
            value={inputs.bavJaehrlich}
            onChange={(e) => onChange("bavJaehrlich", Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${((inputs.bavJaehrlich - 0) / 20_000) * 100}%, #334155 ${((inputs.bavJaehrlich - 0) / 20_000) * 100}%, #334155 100%)`,
            }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-slate-600">0 €</span>
            <span className="text-xs text-slate-600">20.000 €</span>
          </div>
        </div>

        <SliderField
          label="Zielvermögen (FIRE-Zahl)"
          subLabel="Ziel in heutiger Kaufkraft"
          value={inputs.zielvermoegen}
          min={500_000}
          max={5_000_000}
          step={50_000}
          onChange={(v) => onChange("zielvermoegen", v)}
          format={fmtEuro}
        />

        <div className="border-t border-slate-700 pt-5 mt-2">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-4 font-semibold">
            LZK-Einstellungen
          </p>

          <SliderField
            label="LZK-Phase (Jahre)"
            subLabel="Endspurt-Dauer vor dem FIRE-Exit"
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
            value={inputs.lzkRendite}
            min={0}
            max={6}
            step={0.1}
            onChange={(v) => onChange("lzkRendite", v)}
            format={fmtPct}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-700">
        <p className="text-xs text-slate-600 text-center">
          Simulationsbeginn {inputs.startYear} · SWR 3,5 %
        </p>
      </div>
    </div>
  );
}
