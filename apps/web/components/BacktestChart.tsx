"use client";
import { ComposedChart, Line, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
export type EquityPoint = { date: string; return: number; bench: number };
function maxDrawdown(points: EquityPoint[]) {
  let peak = -Infinity;
  let worst = 0;
  for (const p of points) { peak = Math.max(peak, p.return); worst = Math.min(worst, p.return - peak); }
  return worst;
}
export default function BacktestChart({ points }: { points: EquityPoint[] }) {
  const dd = maxDrawdown(points);
  const empty = !points || points.length === 0;
  return (
    <div className="overflow-hidden rounded-xl border border-[#24242e] bg-[#11151F] shadow-card">
      <div className="flex items-center justify-between border-b border-[#24242e]/60 bg-[#0f1320]/40 px-4 py-2.5">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-200">Equity vs IHSG — 52 minggu · synthetic forecast-based</span>
        <span className="rounded-full border border-zinc-800 bg-[#0B0E14] px-2.5 py-1 font-mono text-[11px] text-zinc-400">drawdown <span className="font-bold text-red-400">{(dd * 100).toFixed(1)}%</span> · {points?.length ?? 0}w</span>
      </div>
      <div className="p-3">
        <div style={{ width: "100%", height: 280 }}>
          {empty ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-[#0B0E14]"><span className="text-xs text-zinc-500">No equity curve — backtest unavailable</span></div>
          ) : (
            <ResponsiveContainer>
              <ComposedChart data={points} margin={{ top: 8, right: 12, bottom: 8, left: -8 }}>
                <CartesianGrid stroke="#24242e" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={{ stroke: "#27272a" }} interval={7} />
                <YAxis tick={{ fill: "#71717a", fontSize: 10, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
                <Tooltip contentStyle={{ background: "#11151F", border: "1px solid #24242e", borderRadius: 12, fontSize: 12, boxShadow: "0 12px 32px -12px rgba(0,0,0,0.6)" }} formatter={(v: unknown, n: string) => [`${((v as number) * 100).toFixed(2)}%`, n === "return" ? "SEITH" : n === "bench" ? "IHSG" : n]} labelFormatter={(l: string) => `date ${l}`} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="plainline" />
                <Area type="monotone" dataKey="return" fill="#10b981" fillOpacity={0.10} stroke="none" />
                <Area type="monotone" dataKey="bench" fill="#fbbf24" fillOpacity={0.06} stroke="none" />
                <Line type="monotone" dataKey="return" name="SEITH" stroke="#e4e4e7" strokeWidth={2.5} dot={false} activeDot={{ r: 3, fill: "#e4e4e7" }} />
                <Line type="monotone" dataKey="bench" name="IHSG" stroke="#fbbf24" strokeWidth={2} strokeDasharray="6 4" dot={false} />
                <ReferenceLine y={-0.08} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.5} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-[#24242e]/60 bg-[#0B0E14]/40 px-4 py-2 text-[11px] text-zinc-500">
        <span>Bukan rekomendasi investasi — synthetic forecast-based · metrics ER-based (Top-20 cross-sectional, bukan equity time-series) · 500 rows/25 tickers DB</span>
        <span className="font-mono text-zinc-600">{points?.length ?? 0}w · 2025-09-21→2026-09-13</span>
      </div>
    </div>
  );
}
