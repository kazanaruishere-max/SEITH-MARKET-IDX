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
  return (
    <div className="rounded-xl border border-zinc-800 bg-[#11151F] p-3">
      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-zinc-400"><span>Equity vs IHSG — 12 titik</span><span className="text-[10px] text-zinc-500">drawdown {(dd * 100).toFixed(1)}% · area shade -8%</span></div>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <ComposedChart data={points} margin={{ top: 4, right: 8, bottom: 4, left: -12 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 10 }} tickLine={false} interval={2} />
            <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} tickLine={false} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
            <Tooltip contentStyle={{ background: "#11151F", border: "1px solid #27272a", fontSize: 12 }} formatter={(v: unknown, n: string) => [`${((v as number) * 100).toFixed(1)}%`, n === "return" ? "SEITH" : n === "bench" ? "IHSG" : n]} labelFormatter={(l: string) => `date ${l}`} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="return" fill="#10b981" fillOpacity={0.12} stroke="none" />
            <Area type="monotone" dataKey="bench" fill="#fbbf24" fillOpacity={0.08} stroke="none" />
            <Line type="monotone" dataKey="return" name="SEITH" stroke="#e4e4e7" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="bench" name="IHSG" stroke="#fbbf24" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            <ReferenceLine y={-0.08} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.6} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-zinc-500">Bukan rekomendasi investasi — delta = return − bench di tooltip</div>
    </div>
  );
}
