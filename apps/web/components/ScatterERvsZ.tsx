"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ZAxis,
  Cell,
} from "recharts";

export type ScatterItem = {
  ticker: string;
  er: number;
  z: number;
  close: number;
  flag: boolean;
};

export default function ScatterERvsZ({ items }: { items: ScatterItem[] }) {
  const data = items.map((d) => ({
    x: d.er,
    y: Math.abs(d.z),
    z: Math.max(30, Math.min(800, Math.sqrt(d.close) * 2)),
    ticker: d.ticker,
    flag: d.flag,
  }));
  const flagged = data.filter((d) => d.flag);

  return (
    <div className="terminal-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#1E2638] bg-[#0A0D15] px-3 py-2 font-mono">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
          SCATTER: EXPECTED RETURN VS |Z| ANOMALY
        </span>
        <span className="rounded-[2px] border border-[#1E2638] bg-[#131824] px-1.5 py-0.2 text-[9px] text-zinc-400">
          {data.length} PTS · FLAGGED: {flagged.length}
        </span>
      </div>
      <div className="p-3">
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 8, right: 12, bottom: 20, left: -6 }}>
              <CartesianGrid stroke="#1E2638" strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                name="Expected Return"
                tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: "JetBrains Mono" }}
                tickLine={false}
                label={{
                  value: "Kronos Expected Return (30%)",
                  position: "insideBottom",
                  offset: -10,
                  fill: "#64748B",
                  fontSize: 10,
                  fontFamily: "JetBrains Mono",
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="|Z| Anomaly"
                tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: "JetBrains Mono" }}
                tickLine={false}
                label={{
                  value: "|Z| Deviation",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#64748B",
                  fontSize: 10,
                  fontFamily: "JetBrains Mono",
                }}
              />
              <ZAxis dataKey="z" range={[35, 280]} />
              <Tooltip
                cursor={{ strokeDasharray: "3 3", stroke: "#2D374D" }}
                contentStyle={{
                  background: "#0D111A",
                  border: "1px solid #1E2638",
                  borderRadius: 4,
                  fontSize: 11,
                  fontFamily: "JetBrains Mono",
                }}
                formatter={(v: unknown, n: string) => [
                  typeof v === "number" ? v.toFixed(2) : String(v),
                  n,
                ]}
              />
              <Scatter data={data} fill="#64748B">
                {data.map((e, i) => (
                  <Cell
                    key={i}
                    fill={e.flag ? "#F23645" : e.y > 2 ? "#F59E0B" : "#475569"}
                  />
                ))}
              </Scatter>
              {flagged.length ? <Scatter data={flagged} fill="#F23645" /> : null}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="border-t border-[#1E2638] bg-[#0A0D15] px-3 py-1 font-mono text-[9px] text-zinc-500">
        Bukan rekomendasi investasi · Titik merah = Anomaly Flag (|Z|&gt;2) · Ukuran titik ∝ √Close
      </div>
    </div>
  );
}
