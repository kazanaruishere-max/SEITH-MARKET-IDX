"use client";
import { LineChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
type Pt = { date: string; value: number; upper: number; lower: number };
export default function DossierKronosChart({ kronos, close }: { kronos?: { forecastReturn?: number; volatility?: number; chartPoints?: Pt[] }; close?: number }) {
  const pts: Pt[] = kronos?.chartPoints ?? [];
  if (!pts.length) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-[#11151F] p-3">
        <div className="mb-2 text-xs uppercase tracking-wide text-zinc-400">Kronos 400\u219220 \u2014 forecast amber dashed + \u00B12\u03C3 band</div>
        <div className="flex h-[200px] items-center justify-center text-sm text-zinc-500">Prediksi belum tersedia \u2014 degraded</div>
        <div className="mt-1 text-xs text-zinc-500">Bukan rekomendasi investasi \u2014 20 titik kronos + band vol 2\u03C3</div>
      </div>
    );
  }
  const hist: Pt[] = pts;
  return (
    <div className="rounded-xl border border-zinc-800 bg-[#11151F] p-3">
      <div className="mb-2 text-xs uppercase tracking-wide text-zinc-400">Kronos 400\u219220 \u2014 forecast amber dashed + \u00B12\u03C3 band</div>
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          <LineChart data={hist} margin={{ top: 4, right: 8, bottom: 4, left: -8 }}>
            <CartesianGrid stroke="#24242e" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 9 }} tickLine={false} interval={4} />
            <YAxis tick={{ fill: "#a1a1aa", fontSize: 9 }} tickLine={false} domain={["auto", "auto"]} />
            <Tooltip contentStyle={{ background: "#11151F", border: "1px solid #27272a", fontSize: 12 }} />
            <Area type="monotone" dataKey="upper" stroke="none" fill="#ef4444" fillOpacity={0} />
            <Area type="monotone" dataKey="lower" stroke="none" fill="#ef4444" fillOpacity={0.10} />
            <Line type="monotone" dataKey="value" stroke="#fbbf24" strokeWidth={2} strokeDasharray="5 5" dot={false} name="forecast" />
            <Line type="monotone" dataKey="upper" stroke="#ef4444" strokeWidth={1} strokeOpacity={0.3} dot={false} />
            <Line type="monotone" dataKey="lower" stroke="#ef4444" strokeWidth={1} strokeOpacity={0.3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 text-xs text-zinc-500">Bukan rekomendasi investasi — 20 titik kronos + band vol 2sigma</div>
    </div>
  );
}
