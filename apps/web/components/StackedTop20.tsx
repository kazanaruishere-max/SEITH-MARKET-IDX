"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export type StackItem = {
  ticker: string;
  mispricingScore: number;
  components: {
    expected_return: number;
    anomaly_z: number;
    quality_value: number;
    sector_mom: number;
  };
};

function row(s: StackItem) {
  const c = s.components;
  return {
    ticker: s.ticker,
    ER: +(c.expected_return * 0.3).toFixed(1),
    Z: +(c.anomaly_z * 0.2).toFixed(1),
    QV: +(c.quality_value * 0.3).toFixed(1),
    SM: +(c.sector_mom * 0.2).toFixed(1),
    score: s.mispricingScore,
  };
}

export default function StackedTop20({ items }: { items: StackItem[] }) {
  const data = [...items]
    .sort((a, b) => b.mispricingScore - a.mispricingScore)
    .slice(0, 20)
    .map(row);

  return (
    <div className="terminal-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#1E2638] bg-[#0A0D15] px-3 py-2 font-mono">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
          STACKED FACTOR DECOMPOSITION (TOP 20)
        </span>
        <span className="rounded-[2px] border border-[#1E2638] bg-[#131824] px-1.5 py-0.2 text-[9px] text-zinc-400">
          30ER · 20|Z| · 30QV · 20SM
        </span>
      </div>
      <div className="p-3">
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 36, left: -14 }}>
              <CartesianGrid stroke="#1E2638" strokeDasharray="3 3" />
              <XAxis
                dataKey="ticker"
                tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: "JetBrains Mono" }}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={40}
                tickLine={false}
                axisLine={{ stroke: "#1E2638" }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: "JetBrains Mono" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#0D111A",
                  border: "1px solid #1E2638",
                  borderRadius: 4,
                  fontSize: 11,
                  fontFamily: "JetBrains Mono",
                }}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Legend
                wrapperStyle={{ fontSize: 10, paddingTop: 4, fontFamily: "JetBrains Mono" }}
                iconType="square"
                iconSize={8}
              />
              <Bar dataKey="ER" stackId="a" fill="#F59E0B" name="ER 30%" />
              <Bar dataKey="Z" stackId="a" fill="#EAB308" name="|Z| 20%" />
              <Bar dataKey="QV" stackId="a" fill="#089981" name="QV 30%" />
              <Bar dataKey="SM" stackId="a" fill="#0284C7" name="SM 20%" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="border-t border-[#1E2638] bg-[#0A0D15] px-3 py-1 font-mono text-[9px] text-zinc-500">
        Bukan rekomendasi investasi · Dekomposisi 4 pilar kuantitatif
      </div>
    </div>
  );
}
