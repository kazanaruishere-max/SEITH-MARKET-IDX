export type Metrics = { hit_rate?: number; sharpe?: number; drawdown?: number; top5_forward_20d?: number; totalReturn?: number; cumulative?: number; win_rate?: number };
const cells: { k: keyof Metrics; label: string; fmt: (v: number) => string; tone?: "pos"|"neg"|"neutral" }[] = [
  { k: "hit_rate", label: "Hit rate", fmt: (v) => `${(v * 100).toFixed(0)}%` },
  { k: "win_rate", label: "Win rate", fmt: (v) => `${(v * 100).toFixed(0)}%` },
  { k: "sharpe", label: "Sharpe", fmt: (v) => v.toFixed(2) },
  { k: "drawdown", label: "Drawdown", fmt: (v) => `${(v * 100).toFixed(1)}%` },
  { k: "top5_forward_20d", label: "Top5 fwd 20d", fmt: (v) => `${(v * 100).toFixed(1)}%` },
  { k: "totalReturn", label: "Total return", fmt: (v) => `${(v * 100).toFixed(1)}%` },
];
export default function MetricsTable({ m }: { m: Metrics }) {
  const fallbackSharpe = m.sharpe;
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#24242e] bg-[#0f1320]/50 px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-200">Metrics</span>
        <span className="rounded-full border border-zinc-800 bg-[#0B0E14] px-2 py-0.5 font-mono text-[11px] text-zinc-500">universe 100 · AA eval</span>
      </div>
      <div className="divide-y divide-zinc-800/60">
        {cells.map((c) => {
          const v = m[c.k] as number | undefined;
          const isNeg = c.k === "drawdown" || (c.k === "totalReturn" && v !== undefined && v < 0);
          const isPos = (c.k === "hit_rate" || c.k === "win_rate" || c.k === "cumulative" || c.k === "totalReturn") && v !== undefined && v > 0;
          return (
            <div key={c.k} className="flex items-center justify-between px-4 py-3 hover:bg-[#151a2a]/50 transition-colors">
              <span className="text-xs font-medium tracking-wide text-zinc-400">{c.label}</span>
              <span className={`font-mono text-sm font-bold tabular-nums ${v === undefined ? "text-zinc-600" : isNeg ? "text-red-400" : isPos ? "text-emerald-400" : "text-zinc-100"}`}>{v !== undefined ? c.fmt(v) : "-"}</span>
            </div>
          );
        })}
      </div>
      <div className="border-t border-[#24242e] bg-[#0B0E14]/50 px-4 py-2 text-[11px] leading-relaxed text-zinc-500">
        Bukan rekomendasi investasi · sharpe {fallbackSharpe !== undefined ? fallbackSharpe.toFixed(2) : "-"} · live metrics
      </div>
    </div>
  );
}
