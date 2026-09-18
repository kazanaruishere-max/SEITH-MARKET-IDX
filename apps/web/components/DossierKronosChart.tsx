"use client";
import { ComposedChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
type Pt = { date: string; value: number; upper: number; lower: number };
export default function DossierKronosChart({ kronos, close }: { kronos?: { forecastReturn?: number; volatility?: number; chartPoints?: Pt[] }; close?: number }) {
  const pts: Pt[] = kronos?.chartPoints ?? [];
  const hist: Pt[] = pts.length ? pts : close ? Array.from({ length: 20 }, (_, i) => ({ date: `D${i + 1}`, value: close, upper: close * 1.02, lower: close * 0.98 })) : [];
  const fr = kronos?.forecastReturn !== undefined ? `${(kronos.forecastReturn * 100).toFixed(2)}%` : "-";
  const vol = kronos?.volatility !== undefined ? `${(kronos.volatility * 100).toFixed(2)}%` : "-";
  return (
    <div className="overflow-hidden rounded-xl border border-[#24242e] bg-[#11151F] shadow-card">
      <div className="flex items-center justify-between border-b border-[#24242e]/60 bg-[#0f1320]/40 px-4 py-2.5">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-200">Kronos 400→20 — forecast amber dashed + ±2σ band</span>
        <span className="flex items-center gap-2 font-mono text-[11px] text-zinc-500"><span className="hidden md:inline">forecast {fr} · vol {vol}</span><span className="rounded-full border border-zinc-800 bg-[#0B0E14] px-2 py-0.5">{hist.length} pts</span></span>
      </div>
      <div className="p-3">
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <ComposedChart data={hist} margin={{ top: 8, right: 12, bottom: 8, left: -8 }}>
              <CartesianGrid stroke="#24242e" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={{ stroke: "#27272a" }} interval={3} />
              <YAxis tick={{ fill: "#71717a", fontSize: 10, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} domain={["auto", "auto"]} tickFormatter={(v: number) => `${v.toLocaleString("id-ID")}`} />
              <Tooltip contentStyle={{ background: "#11151F", border: "1px solid #24242e", borderRadius: 12, fontSize: 12 }} labelFormatter={(l: string) => `date ${l}`} formatter={(v: unknown, n: string) => [typeof v === "number" ? v.toLocaleString("id-ID") : String(v), n]} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Area type="monotone" dataKey="lower" stroke="none" fill="#ef4444" fillOpacity={0.08} />
              <Area type="monotone" dataKey="upper" stroke="none" fill="#ef4444" fillOpacity={0.10} />
              <Line type="monotone" dataKey="value" name="forecast" stroke="#fbbf24" strokeWidth={2} strokeDasharray="6 4" dot={false} activeDot={{ r: 3 }} />
              <Line type="monotone" dataKey="upper" name="+2σ" stroke="#ef4444" strokeWidth={1} strokeOpacity={0.35} dot={false} />
              <Line type="monotone" dataKey="lower" name="−2σ" stroke="#ef4444" strokeWidth={1} strokeOpacity={0.35} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-[#24242e]/60 bg-[#0B0E14]/40 px-4 py-2 text-[11px] text-zinc-500">
        <span>Bukan rekomendasi investasi — 20 titik kronos + band vol 2σ · hover untuk nilai</span>
        <span className="font-mono text-zinc-600">400 actual → 20 forecast · T1.0</span>
      </div>
    </div>
  );
}
