"use client";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ZAxis, Cell } from "recharts";
export type ScatterItem = { ticker: string; er: number; z: number; close: number; flag: boolean };
export default function ScatterERvsZ({ items }: { items: ScatterItem[] }) {
  const data = items.map((d) => ({ x: d.er, y: Math.abs(d.z), z: Math.max(30, Math.min(800, Math.sqrt(d.close) * 2)), ticker: d.ticker, flag: d.flag }));
  const flagged = data.filter((d) => d.flag);
  return (
    <div className="rounded-xl border border-zinc-800 bg-[#11151F] p-3">
      <div className="mb-2 text-xs uppercase tracking-wide text-zinc-400">Scatter ER vs |Z| — size=close · red flag |Z|&gt;2</div>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 8, right: 12, bottom: 20, left: 10 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis type="number" dataKey="x" name="ER" tick={{ fill: "#a1a1aa", fontSize: 10 }} tickLine={false} label={{ value: "ER", position: "insideBottom", offset: -10, fill: "#71717a", fontSize: 10 }} />
            <YAxis type="number" dataKey="y" name="|Z|" tick={{ fill: "#a1a1aa", fontSize: 10 }} tickLine={false} label={{ value: "|Z|", angle: -90, position: "insideLeft", fill: "#71717a", fontSize: 10 }} />
            <ZAxis dataKey="z" range={[40, 400]} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#11151F", border: "1px solid #27272a", fontSize: 12 }} />
            <Scatter data={data} fill="#a1a1aa">
              {data.map((e, i) => (
                <Cell key={i} fill={e.flag ? "#ef4444" : e.y > 2 ? "#fbbf24" : "#a1a1aa"} />
              ))}
            </Scatter>
            {flagged.length ? <Scatter data={flagged} fill="#ef4444" /> : null}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 text-xs text-zinc-500">Bukan rekomendasi investasi — dot merah = anomaly flag</div>
    </div>
  );
}
