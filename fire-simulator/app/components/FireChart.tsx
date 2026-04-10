"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { FireResult, YearDataPoint, formatEuro } from "@/lib/fireCalculations";

interface FireChartProps {
  result: FireResult;
  zielvermoegen: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string | number;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-[#0f294d] text-white rounded-xl shadow-xl p-4 text-sm min-w-[200px]">
      <p className="font-semibold mb-2 text-slate-300">Jahr {label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-4">
          <span style={{ color: p.color }} className="font-medium">
            {p.name}
          </span>
          <span className="font-semibold">{formatEuro(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function yAxisFormatter(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(value);
}

export default function FireChart({ result, zielvermoegen }: FireChartProps) {
  const {
    yearlyData,
    coastFireYear,
    fullFireYear,
    lzkStartYear,
    coastFireCalendarYear,
    fullFireCalendarYear,
    lzkStartCalendarYear,
  } = result;

  // Show data up to full FIRE + 2 years or max 25 years
  const displayEnd = Math.min(
    (fullFireYear !== null ? fullFireYear + 2 : 25),
    yearlyData.length - 1
  );
  const chartData = yearlyData.slice(0, displayEnd + 1).map((d: YearDataPoint) => ({
    year: d.calendarYear,
    ETF: Math.round(d.etfBalanceReal),
    LZK: Math.round(d.lzkBalanceReal),
    Gesamt: Math.round(d.totalReal),
  }));

  const milestoneLines = [
    coastFireYear !== null && {
      year: coastFireCalendarYear,
      label: "Coast FIRE",
      color: "#10b981",
    },
    lzkStartYear > 0 && {
      year: lzkStartCalendarYear,
      label: "LZK Endspurt",
      color: "#f59e0b",
    },
    fullFireYear !== null && {
      year: fullFireCalendarYear,
      label: "Full FIRE Exit",
      color: "#6366f1",
    },
  ].filter(Boolean) as { year: number; label: string; color: string }[];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-[#0f294d]">Portfolio-Entwicklung</h2>
          <p className="text-sm text-slate-500">Kaufkraftbereinigt in heutigen € (real)</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-emerald-500" />
            ETF-Portfolio
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-400" />
            LZK-Konto
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={380}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="etfGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="lzkGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

          <XAxis
            dataKey="year"
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={yAxisFormatter}
            tick={{ fontSize: 12, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            width={55}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Target reference line */}
          <ReferenceLine
            y={zielvermoegen}
            stroke="#6366f1"
            strokeDasharray="6 3"
            strokeWidth={1.5}
            label={{
              value: `Ziel: ${yAxisFormatter(zielvermoegen)}`,
              position: "insideTopRight",
              fontSize: 11,
              fill: "#6366f1",
            }}
          />

          {/* Coast FIRE reference line */}
          <ReferenceLine
            y={1_000_000}
            stroke="#10b981"
            strokeDasharray="4 2"
            strokeWidth={1}
            label={{
              value: "Coast FIRE 1M",
              position: "insideTopRight",
              fontSize: 11,
              fill: "#10b981",
            }}
          />

          {/* Vertical milestone lines */}
          {milestoneLines.map((m) => (
            <ReferenceLine
              key={m.label}
              x={m.year}
              stroke={m.color}
              strokeDasharray="4 3"
              strokeWidth={1.5}
              label={{
                value: m.label,
                position: "top",
                fontSize: 10,
                fill: m.color,
                angle: -45,
                offset: 10,
              }}
            />
          ))}

          {/* LZK area (rendered first so it's behind ETF visually at stack position) */}
          <Area
            type="monotone"
            dataKey="LZK"
            stackId="portfolio"
            stroke="#60a5fa"
            strokeWidth={2}
            fill="url(#lzkGradient)"
            name="LZK-Konto"
            dot={false}
            activeDot={{ r: 4 }}
          />

          {/* ETF area */}
          <Area
            type="monotone"
            dataKey="ETF"
            stackId="portfolio"
            stroke="#10b981"
            strokeWidth={2.5}
            fill="url(#etfGradient)"
            name="ETF-Portfolio"
            dot={false}
            activeDot={{ r: 5 }}
          />

          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
            iconType="circle"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Milestone badges */}
      <div className="flex flex-wrap gap-3 mt-4">
        {milestoneLines.map((m) => (
          <div
            key={m.label}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-50 border border-slate-200"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: m.color }}
            />
            <span className="text-slate-700">
              {m.label} · {m.year}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
