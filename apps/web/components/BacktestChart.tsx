"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
export type EquityPoint = { date: string; return: number; bench: number };
export default function BacktestChart({ points }: { points: EquityPoint[] }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-[#11151F] p-3">
      <div className="mb-2 text-xs uppercase tracking-wide text-zinc-400">Equity vs IHSG · 12 titik</div>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={points} margin={{ top: 4, right: 8, bottom: 4, left: -12 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 10 }} tickLine={false} interval={2} />
            <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} tickLine={false} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
            <Tooltip contentStyle={{ background: "#11151F", border: "1px solid #27272a", fontSize: 12 }} formatter={(v: unknown) => [`${((v as number) * 100).toFixed(1)}%`]} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="return" name="SEITH" stroke="#a1a1aa" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="bench" name="IHSG" stroke="#fbbf24" strokeWidth={2} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-zinc-500">Bukan rekomendasi investasi — informasi & analisis saja</div>
    </div>
  );
}
