"use client";

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

export type EquityPoint = { date: string; return: number; bench: number };

function maxDrawdown(points: EquityPoint[]) {
  let peak = -Infinity;
  let worst = 0;
  for (const p of points) {
    peak = Math.max(peak, p.return);
    worst = Math.min(worst, p.return - peak);
  }
  return worst;
}

export default function BacktestChart({ points }: { points: EquityPoint[] }) {
  const dd = maxDrawdown(points);
  const empty = !points || points.length === 0;

  return (
    <div className="terminal-card overflow-hidden">
      {/* Titlebar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2638] bg-[#0A0D15] px-3 py-2 font-mono">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            STRATEGY TESTER // EQUITY VS IHSG BENCHMARK
          </span>
          <span className="rounded-[2px] border border-[#1E2638] bg-[#131824] px-1.5 py-0.2 text-[9px] text-zinc-400">
            52-WEEK SIMULATION
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold">
          <span className="text-zinc-400">
            MAX DRAWDOWN: <span className="text-red-400">{(dd * 100).toFixed(1)}%</span>
          </span>
          <span className="text-zinc-600">│</span>
          <span className="text-zinc-400">{points?.length ?? 0} PERIOD PTS</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="p-3 bg-[#07090E]">
        <div style={{ width: "100%", height: 280 }}>
          {empty ? (
            <div className="flex h-full items-center justify-center font-mono text-xs text-zinc-500">
              NO EQUITY CURVE DATA AVAILABLE
            </div>
          ) : (
            <ResponsiveContainer>
              <ComposedChart
                data={points}
                margin={{ top: 8, right: 12, bottom: 8, left: -10 }}
              >
                <CartesianGrid stroke="#1E2638" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: "JetBrains Mono" }}
                  tickLine={false}
                  axisLine={{ stroke: "#1E2638" }}
                  interval={7}
                />
                <YAxis
                  tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: "JetBrains Mono" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `${(v * 100).toFixed(1)}%`}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0D111A",
                    border: "1px solid #1E2638",
                    borderRadius: 4,
                    fontSize: 11,
                    fontFamily: "JetBrains Mono",
                  }}
                  formatter={(v: unknown, n: string) => [
                    `${((v as number) * 100).toFixed(2)}%`,
                    n === "return" ? "SEITH Top-10 Portofolio" : n === "bench" ? "IHSG Benchmark" : n,
                  ]}
                  labelFormatter={(l: string) => `Periode: ${l}`}
                />
                <Legend
                  wrapperStyle={{ fontSize: 10, paddingTop: 4, fontFamily: "JetBrains Mono" }}
                  iconType="plainline"
                />
                <Area
                  type="monotone"
                  dataKey="return"
                  fill="#089981"
                  fillOpacity={0.06}
                  stroke="none"
                />
                <Area
                  type="monotone"
                  dataKey="bench"
                  fill="#F59E0B"
                  fillOpacity={0.04}
                  stroke="none"
                />
                <Line
                  type="monotone"
                  dataKey="return"
                  name="SEITH Strategy"
                  stroke="#089981"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#089981" }}
                />
                <Line
                  type="monotone"
                  dataKey="bench"
                  name="IHSG Benchmark"
                  stroke="#F59E0B"
                  strokeWidth={1.5}
                  strokeDasharray="5 3"
                  dot={false}
                />
                <ReferenceLine
                  y={-0.08}
                  stroke="#EF4444"
                  strokeDasharray="4 4"
                  strokeOpacity={0.4}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Footer Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#1E2638] bg-[#0A0D15] px-3 py-1.5 font-mono text-[9px] text-zinc-500">
        <span>Bukan rekomendasi investasi · Metrik ER-based cross-sectional Top-20 · DB 500 baris</span>
        <span>RENTANG SIMULASI: 2025-09-21 → 2026-09-13 (52 PEKAN)</span>
      </div>
    </div>
  );
}
