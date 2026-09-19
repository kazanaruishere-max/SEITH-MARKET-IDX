"use client";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ZAxis, Cell } from "recharts";
export type ScatterItem = { ticker: string; er: number; z: number; close: number; flag: boolean };
export default function ScatterERvsZ({ items }: { items: ScatterItem[] }) {
  const data = items.map((d) => ({ x: d.er, y: Math.abs(d.z), z: Math.max(30, Math.min(800, Math.sqrt(d.close) * 2)), ticker: d.ticker, flag: d.flag }));
  const flagged = data.filter((d) => d.flag);
  return (
    <div className="overflow-hidden rounded-xl border border-[#24242e] bg-[#11151F] shadow-card">
      <div className="flex items-center justify-between border-b border-[#24242e]/60 bg-[#0f1320]/40 px-4 py-2.5">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-200">Scatter ER vs |Z| — size=close · red flag |Z|&gt;2</span>
        <span className="rounded-full border border-zinc-800 bg-[#0B0E14] px-2 py-0.5 font-mono text-[11px] text-zinc-500">{data.length} pts · flagged {flagged.length}</span>
      </div>
      <div className="p-3">
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 8, right: 12, bottom: 20, left: 10 }}>
              <CartesianGrid stroke="#24242e" strokeDasharray="3 3" />
              <XAxis type="number" dataKey="x" name="ER" tick={{ fill: "#71717a", fontSize: 10 }} tickLine={false} label={{ value: "ER 30%", position: "insideBottom", offset: -10, fill: "#71717a", fontSize: 10 }} />
              <YAxis type="number" dataKey="y" name="|Z|" tick={{ fill: "#71717a", fontSize: 10 }} tickLine={false} label={{ value: "|Z| 20%", angle: -90, position: "insideLeft", fill: "#71717a", fontSize: 10 }} />
              <ZAxis dataKey="z" range={[40, 400]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#11151F", border: "1px solid #24242e", borderRadius: 12, fontSize: 12 }} formatter={(v: unknown, n: string) => [typeof v === "number" ? v.toFixed(2) : String(v), n]} />
              <Scatter data={data} fill="#a1a1aa">
                {data.map((e, i) => (
                  <Cell key={i} fill={e.flag ? "#ef4444" : e.y > 2 ? "#fbbf24" : "#71717a"} />
                ))}
              </Scatter>
              {flagged.length ? <Scatter data={flagged} fill="#ef4444" /> : null}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="border-t border-[#24242e]/60 bg-[#0B0E14]/40 px-4 py-2 text-[11px] text-zinc-500">Bukan rekomendasi investasi — dot merah = anomaly flag · size = √close · hover ticker</div>
    </div>
  );
}
