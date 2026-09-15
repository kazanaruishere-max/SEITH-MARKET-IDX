"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
export type StackItem = { ticker: string; mispricingScore: number; components: { expected_return: number; anomaly_z: number; quality_value: number; sector_mom: number } };
function row(s: StackItem) {
  const c = s.components;
  return { ticker: s.ticker, ER: +(c.expected_return * 0.3).toFixed(1), Z: +(c.anomaly_z * 0.2).toFixed(1), QV: +(c.quality_value * 0.3).toFixed(1), SM: +(c.sector_mom * 0.2).toFixed(1), score: s.mispricingScore };
}
export default function StackedTop20({ items }: { items: StackItem[] }) {
  const data = [...items].sort((a, b) => b.mispricingScore - a.mispricingScore).slice(0, 20).map(row);
  return (
    <div className="rounded-xl border border-zinc-800 bg-[#11151F] p-3">
      <div className="mb-2 text-xs uppercase tracking-wide text-zinc-400">Stacked Top 20 — 30ER · 20|Z| · 30QV · 20SM</div>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 40, left: -12 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis dataKey="ticker" tick={{ fill: "#a1a1aa", fontSize: 9 }} interval={0} angle={-28} textAnchor="end" height={50} />
            <YAxis domain={[0, 100]} tick={{ fill: "#a1a1aa", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#11151F", border: "1px solid #27272a", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="ER" stackId="a" fill="#fbbf24" name="ER 30%" />
            <Bar dataKey="Z" stackId="a" fill="#eab308" name="Z 20%" />
            <Bar dataKey="QV" stackId="a" fill="#10b981" name="QV 30%" />
            <Bar dataKey="SM" stackId="a" fill="#0ea5e9" name="SM 20%" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 text-xs text-zinc-500">Bukan rekomendasi investasi — sum segmen = score</div>
    </div>
  );
}
