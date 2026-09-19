export type Metrics = { hit_rate?: number; sharpe?: number; drawdown?: number; top5_forward_20d?: number; totalReturn?: number; cumulative?: number; win_rate?: number };
const realCells: { k: keyof Metrics; label: string; fmt: (v: number) => string }[] = [
  { k: "hit_rate", label: "Signal Accuracy (Top-20)", fmt: (v) => `${(v * 100).toFixed(0)}%` },
  { k: "win_rate", label: "Win Rate (Top-20)", fmt: (v) => `${(v * 100).toFixed(0)}%` },
];
const synthCells: { k: keyof Metrics; label: string; fmt: (v: number) => string }[] = [
  { k: "sharpe", label: "Sharpe (ER-based)", fmt: (v) => v.toFixed(2) },
  { k: "drawdown", label: "Drawdown", fmt: (v) => `${(v * 100).toFixed(1)}%` },
  { k: "top5_forward_20d", label: "Top5 fwd 20d", fmt: (v) => `${(v * 100).toFixed(1)}%` },
  { k: "totalReturn", label: "Total return", fmt: (v) => `${(v * 100).toFixed(1)}%` },
];
function Row({ label, value, fmt, k }: { label: string; value: number | undefined; fmt: (v: number) => string; k: string }) {
  const isNeg = k === "drawdown" || (k === "totalReturn" && value !== undefined && value < 0);
  const isPos = (k === "hit_rate" || k === "win_rate" || k === "totalReturn") && value !== undefined && value > 0;
  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-[#151a2a]/50 transition-colors">
      <span className="text-xs font-medium tracking-wide text-zinc-400">{label}</span>
      <span className={`font-mono text-sm font-bold tabular-nums ${value === undefined ? "text-zinc-600" : isNeg ? "text-red-400" : isPos ? "text-emerald-400" : "text-zinc-100"}`}>{value !== undefined ? fmt(value) : "-"}</span>
    </div>
  );
}
export default function MetricsTable({ m }: { m: Metrics }) {
  const sharpe = m.sharpe;
  return (
    <div className="overflow-hidden rounded-xl border border-[#24242e] bg-[#11151F] shadow-card">
      <div className="flex items-center justify-between border-b border-[#24242e]/60 bg-[#0f1320]/50 px-4 py-3">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-200">Metrics</span>
        <span className="rounded-full border border-zinc-800 bg-[#0B0E14] px-2.5 py-0.5 font-mono text-[11px] text-zinc-500">universe 100 · AA eval</span>
      </div>
      <div className="border-b border-zinc-800/60 bg-[#0f1320]/30 px-4 py-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-300/90">Live Signal Metrics</span>
        <span className="ml-2 text-[11px] text-zinc-500">real · cross-sectional</span>
      </div>
      <div className="divide-y divide-zinc-800/60">
        {realCells.map((c) => (
          <Row key={c.k} k={c.k} label={c.label} value={m[c.k] as number | undefined} fmt={c.fmt} />
        ))}
      </div>
      <div className="border-y border-amber-900/30 bg-amber-950/20 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-amber-300">Synthetic Projection (52w)</span>
          <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold leading-none text-zinc-900">NOT REALIZED</span>
        </div>
        <div className="mt-1.5 rounded-lg border border-amber-900/40 bg-amber-950/30 px-2.5 py-2 text-[11px] leading-relaxed text-amber-200/90">
          <span className="font-semibold">⚠ Synthetic projection — bukan realized return.</span> Upgrade path: fetch 250+ hari OHLCV penuh untuk rolling backtest realized (lihat README §15).
        </div>
      </div>
      <div className="divide-y divide-zinc-800/60">
        {synthCells.map((c) => (
          <Row key={c.k} k={c.k} label={c.label} value={m[c.k] as number | undefined} fmt={c.fmt} />
        ))}
      </div>
      <div className="border-t border-[#24242e]/60 bg-[#0B0E14]/50 px-4 py-2.5 text-[11px] leading-relaxed text-zinc-500">Bukan rekomendasi investasi · Sharpe (ER-based) {sharpe !== undefined ? sharpe.toFixed(2) : "-"} cross-sectional Top-20 · live metrics · idx.co.id ↗</div>
    </div>
  );
}
