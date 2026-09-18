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
    <div className="overflow-hidden rounded-xl border border-[#24242e] bg-[#11151F] shadow-card">
      <div className="flex items-center justify-between border-b border-[#24242e]/60 bg-[#0f1320]/40 px-4 py-2.5">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-200">Stacked Top 20 — 30ER · 20|Z| · 30QV · 20SM</span>
        <span className="rounded-full border border-zinc-800 bg-[#0B0E14] px-2 py-0.5 font-mono text-[11px] text-zinc-500">{data.length} tickers · score breakdown</span>
      </div>
      <div className="p-3">
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 4, right: 8, bottom: 44, left: -12 }}>
              <CartesianGrid stroke="#24242e" strokeDasharray="3 3" />
              <XAxis dataKey="ticker" tick={{ fill: "#71717a", fontSize: 10, fontFamily: "JetBrains Mono" }} interval={0} angle={-28} textAnchor="end" height={50} tickLine={false} axisLine={{ stroke: "#27272a" }} />
              <YAxis domain={[0, 100]} tick={{ fill: "#71717a", fontSize: 10, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#11151F", border: "1px solid #24242e", borderRadius: 12, fontSize: 12 }} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" iconSize={8} />
              <Bar dataKey="ER" stackId="a" fill="#fbbf24" name="ER 30%" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Z" stackId="a" fill="#eab308" name="Z 20%" />
              <Bar dataKey="QV" stackId="a" fill="#10b981" name="QV 30%" />
              <Bar dataKey="SM" stackId="a" fill="#0ea5e9" name="SM 20%" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="border-t border-[#24242e]/60 bg-[#0B0E14]/40 px-4 py-2 text-[11px] text-zinc-500">Bukan rekomendasi investasi — sum segmen = score 0→100 · hover untuk breakdown</div>
    </div>
  );
}
