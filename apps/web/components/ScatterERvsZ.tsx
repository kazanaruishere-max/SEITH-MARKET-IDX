"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  ReferenceLine,
} from "recharts";
import { profileOf } from "@/data/companyProfiles";

export type ScatterItem = {
  ticker: string;
  er: number;
  score?: number;
  sector?: string;
  z: number;
  close: number;
  flag: boolean;
};

interface TooltipPayloadItem {
  payload?: {
    x: number;
    y: number;
    zVal: number;
    size: number;
    ticker: string;
    score: number;
    er: number;
    close: number;
    flag: boolean;
  };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const prof = profileOf(d.ticker);

  return (
    <div className="rounded-[3px] border border-[#1E2638] bg-[#0D111A] p-2.5 font-mono text-xs shadow-2xl">
      <div className="flex items-center justify-between gap-3 border-b border-[#1E2638] pb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-amber-400">{d.ticker}</span>
          <span className="text-[10px] text-zinc-400 truncate max-w-[16ch]">
            {prof?.name ?? d.ticker}
          </span>
        </div>
        <span
          className={`rounded-[2px] px-1 py-0.2 text-[9px] font-bold ${
            d.flag
              ? "bg-red-950 text-red-300 border border-red-800"
              : "bg-[#131824] text-zinc-400"
          }`}
        >
          {d.flag ? "ANOMALY FLAGGED" : "NORMAL"}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
        <div className="text-zinc-500">Mispricing Score:</div>
        <div className="font-bold text-amber-400 text-right">{d.score.toFixed(1)} / 100</div>
        <div className="text-zinc-500">Expected Return (30%):</div>
        <div className="font-bold text-zinc-200 text-right">{d.er.toFixed(2)}</div>
        <div className="text-zinc-500">|Z| Deviation:</div>
        <div className={`font-bold text-right ${d.y >= 2 ? "text-red-400" : "text-zinc-200"}`}>
          {d.zVal > 0 ? `+${d.zVal.toFixed(2)}` : d.zVal.toFixed(2)}σ
        </div>
        <div className="text-zinc-500">Close Price:</div>
        <div className="text-zinc-300 text-right">Rp {d.close.toLocaleString("id-ID")}</div>
      </div>
      <div className="mt-2 border-t border-[#1E2638] pt-1 text-[9px] text-zinc-500 text-center">
        Klik titik untuk membuka Dossier ↗
      </div>
    </div>
  );
}

export default function ScatterERvsZ({ items }: { items: ScatterItem[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<"er" | "score">("score");

  const data = items.map((d) => {
    const xVal = mode === "score" ? (d.score ?? d.er) : d.er;
    return {
      x: xVal,
      y: Math.abs(d.z),
      zVal: d.z,
      size: d.flag ? 140 : 65,
      ticker: d.ticker,
      score: d.score ?? 50,
      er: d.er,
      close: d.close,
      flag: d.flag,
    };
  });

  const flagged = data.filter((d) => d.flag);

  return (
    <div className="terminal-card overflow-hidden">
      {/* Titlebar with Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2638] bg-[#0A0D15] px-3 py-2 font-mono">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            SCATTER: {mode === "score" ? "MISPRICING SCORE" : "EXPECTED RETURN"} VS |Z| ANOMALY
          </span>
          <span className="rounded-[2px] border border-[#1E2638] bg-[#131824] px-1.5 py-0.2 text-[9px] text-zinc-400">
            {data.length} PTS · FLAGGED: {flagged.length}
          </span>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center rounded-[2px] border border-[#1E2638] bg-[#07090E] p-0.5 text-[10px]">
          <button
            onClick={() => setMode("score")}
            className={`px-2 py-0.5 font-bold transition-all rounded-[1px] ${
              mode === "score"
                ? "bg-amber-400 text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            X: SKOR (60→82)
          </button>
          <button
            onClick={() => setMode("er")}
            className={`px-2 py-0.5 font-bold transition-all rounded-[1px] ${
              mode === "er"
                ? "bg-amber-400 text-zinc-950 shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            X: ER (48→51)
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="p-3 bg-[#07090E]">
        <div style={{ width: "100%", height: 270 }}>
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 12, right: 18, bottom: 24, left: 0 }}>
              <CartesianGrid stroke="#1E2638" strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                name={mode === "score" ? "Mispricing Score" : "Expected Return"}
                domain={mode === "score" ? ["dataMin - 2", "dataMax + 2"] : ["dataMin - 0.3", "dataMax + 0.3"]}
                tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: "JetBrains Mono" }}
                tickLine={false}
                axisLine={{ stroke: "#1E2638" }}
                tickFormatter={(v: number) => (mode === "score" ? v.toFixed(0) : v.toFixed(1))}
                label={{
                  value: mode === "score" ? "Composite Mispricing Score (0→100)" : "Kronos Expected Return (30%)",
                  position: "insideBottom",
                  offset: -14,
                  fill: "#64748B",
                  fontSize: 10,
                  fontFamily: "JetBrains Mono",
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="|Z| Anomaly"
                domain={[0, "auto"]}
                width={38}
                tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: "JetBrains Mono" }}
                tickLine={false}
                axisLine={{ stroke: "#1E2638" }}
                tickFormatter={(v: number) => `${v.toFixed(1)}σ`}
              />
              <ZAxis dataKey="size" range={[65, 140]} />

              {/* Reference Threshold at |Z| = 2.0 */}
              <ReferenceLine
                y={2.0}
                stroke="#EF4444"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: "Ambang Anomali (|Z| > 2.0)",
                  fill: "#EF4444",
                  fontSize: 9,
                  fontFamily: "JetBrains Mono",
                  position: "insideTopRight",
                }}
              />

              {/* Reference Threshold at Baseline Median */}
              <ReferenceLine
                x={mode === "score" ? 68.4 : 50.0}
                stroke="#64748B"
                strokeDasharray="3 3"
                strokeWidth={0.8}
                label={{
                  value: mode === "score" ? "Median 68.4" : "Baseline 50.0",
                  fill: "#64748B",
                  fontSize: 8,
                  fontFamily: "JetBrains Mono",
                  position: "insideTopLeft",
                }}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "#2D374D" }} />

              <Scatter
                data={data}
                fill="#64748B"
                className="cursor-pointer"
                onClick={(e: unknown) => {
                  const pt = (e as { ticker?: string })?.ticker;
                  if (pt) router.push(`/dossier/${pt}?market=id`);
                }}
              >
                {data.map((e) => (
                  <Cell
                    key={e.ticker}
                    fill={e.flag ? "#F23645" : e.y >= 2 ? "#EF4444" : e.x >= 70 ? "#089981" : "#475569"}
                    stroke={e.flag ? "#FECACA" : "none"}
                    strokeWidth={e.flag ? 1 : 0}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#1E2638] bg-[#0A0D15] px-3 py-1.5 font-mono text-[9px] text-zinc-500">
        <span>Bukan rekomendasi investasi · Titik merah = Anomaly Flag (|Z|&gt;2) · Ukuran titik ∝ √Close</span>
        <span>KLIK TITIK EMITEN → BUKA DOSSIER</span>
      </div>
    </div>
  );
}
