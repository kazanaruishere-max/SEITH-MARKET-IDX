"use client";

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

type Pt = { date: string; value: number; upper: number; lower: number };

export default function DossierKronosChart({
  kronos,
  close: _close,
}: {
  kronos?: { forecastReturn?: number; volatility?: number; chartPoints?: Pt[] };
  close?: number;
}) {
  const pts: Pt[] = kronos?.chartPoints ?? [];

  const fr =
    kronos?.forecastReturn !== undefined
      ? `${(kronos.forecastReturn * 100).toFixed(2)}%`
      : "-";
  const vol =
    kronos?.volatility !== undefined ? `${(kronos.volatility * 100).toFixed(2)}%` : "-";

  if (!pts.length) {
    return (
      <div className="terminal-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#1E2638] bg-[#0A0D15] px-3 py-2 font-mono text-xs">
          <span className="font-bold uppercase tracking-wider text-amber-400">
            KRONOS QUANT PROJECTION CORRIDOR (400→20)
          </span>
          <span className="rounded-[2px] border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[9px] text-amber-300">
            DEGRADED / NO INFERENCE DATA
          </span>
        </div>
        <div className="p-8 text-center font-mono text-xs text-zinc-500 bg-[#07090E]">
          KRONOS INFERENCE UNAVAILABLE — PROJECTION CORRIDOR NOT COMPUTED (ZERO FABRICATION)
        </div>
        <div className="border-t border-[#1E2638] bg-[#0A0D15] px-3 py-1.5 font-mono text-[9px] text-zinc-500">
          Bukan rekomendasi investasi · Data riil tidak tersedia untuk horizon 20 hari ke depan
        </div>
      </div>
    );
  }

  const hist: Pt[] = pts;

  return (
    <div className="terminal-card overflow-hidden">
      {/* Titlebar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2638] bg-[#0A0D15] px-3 py-2 font-mono">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            KRONOS QUANT PROJECTION CORRIDOR (400→20)
          </span>
          <span className="rounded-[2px] border border-[#1E2638] bg-[#131824] px-1.5 py-0.2 text-[9px] text-zinc-400">
            ±2σ VOLATILITY TUNNEL
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
          <span className="text-emerald-400 font-bold">Fwd Return: {fr}</span>
          <span className="text-zinc-600">│</span>
          <span>Vol: {vol}</span>
          <span className="text-zinc-600">│</span>
          <span>{hist.length} HORIZON PTS</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="p-3 bg-[#07090E]">
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <ComposedChart data={hist} margin={{ top: 8, right: 12, bottom: 8, left: -6 }}>
              <CartesianGrid stroke="#1E2638" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: "JetBrains Mono" }}
                tickLine={false}
                axisLine={{ stroke: "#1E2638" }}
                interval={2}
              />
              <YAxis
                tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: "JetBrains Mono" }}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
                tickFormatter={(v: number) => `Rp ${v.toLocaleString("id-ID")}`}
              />
              <Tooltip
                contentStyle={{
                  background: "#0D111A",
                  border: "1px solid #1E2638",
                  borderRadius: 4,
                  fontSize: 11,
                  fontFamily: "JetBrains Mono",
                }}
                labelFormatter={(l: string) => `Tanggal: ${l}`}
                formatter={(v: unknown, n: string) => [
                  typeof v === "number" ? `Rp ${v.toLocaleString("id-ID")}` : String(v),
                  n === "value"
                    ? "Kronos Forecast"
                    : n === "upper"
                    ? "Batas Atas +2σ"
                    : n === "lower"
                    ? "Batas Bawah -2σ"
                    : n,
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: 10, paddingTop: 4, fontFamily: "JetBrains Mono" }}
              />
              <Area
                type="monotone"
                dataKey="lower"
                stroke="none"
                fill="#EF4444"
                fillOpacity={0.05}
              />
              <Area
                type="monotone"
                dataKey="upper"
                stroke="none"
                fill="#EF4444"
                fillOpacity={0.08}
              />
              <Line
                type="monotone"
                dataKey="value"
                name="Kronos Forecast Path"
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={false}
                activeDot={{ r: 4, fill: "#F59E0B" }}
              />
              <Line
                type="monotone"
                dataKey="upper"
                name="Upper Corridor (+2σ)"
                stroke="#EF4444"
                strokeWidth={1}
                strokeOpacity={0.4}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="lower"
                name="Lower Corridor (-2σ)"
                stroke="#EF4444"
                strokeWidth={1}
                strokeOpacity={0.4}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#1E2638] bg-[#0A0D15] px-3 py-1.5 font-mono text-[9px] text-zinc-500">
        <span>Bukan rekomendasi investasi · Foundation model K-line 12B tokens (AAAI 2026)</span>
        <span>LOOKBACK 400 → 20 DAY HORIZON · T=1.0 TOP_P=0.9</span>
      </div>
    </div>
  );
}
