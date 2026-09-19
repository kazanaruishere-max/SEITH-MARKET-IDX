export type Metrics = {
  hit_rate?: number;
  sharpe?: number;
  drawdown?: number;
  top5_forward_20d?: number;
  totalReturn?: number;
  cumulative?: number;
  win_rate?: number;
};

const realCells: { k: keyof Metrics; label: string; fmt: (v: number) => string }[] = [
  { k: "hit_rate", label: "Signal Accuracy (Top-20)", fmt: (v) => `${(v * 100).toFixed(0)}%` },
  { k: "win_rate", label: "Win Rate (Top-20)", fmt: (v) => `${(v * 100).toFixed(0)}%` },
];

const synthCells: { k: keyof Metrics; label: string; fmt: (v: number) => string }[] = [
  { k: "sharpe", label: "Sharpe Ratio (ER-based)", fmt: (v) => v.toFixed(2) },
  { k: "drawdown", label: "Max Drawdown", fmt: (v) => `${(v * 100).toFixed(1)}%` },
  { k: "top5_forward_20d", label: "Top-5 Fwd 20-Day Return", fmt: (v) => `${(v * 100).toFixed(1)}%` },
  { k: "totalReturn", label: "Cumulative Strategy Return", fmt: (v) => `${(v * 100).toFixed(1)}%` },
];

function Row({
  label,
  value,
  fmt,
  k,
}: {
  label: string;
  value: number | undefined;
  fmt: (v: number) => string;
  k: string;
}) {
  const isNeg = k === "drawdown" || (k === "totalReturn" && value !== undefined && value < 0);
  const isPos =
    (k === "hit_rate" || k === "win_rate" || k === "totalReturn") &&
    value !== undefined &&
    value > 0;

  return (
    <div className="flex items-center justify-between px-3 py-2 text-xs font-mono transition-colors hover:bg-[#131824]">
      <span className="text-zinc-400">{label}</span>
      <span
        className={`font-bold tabular-nums ${
          value === undefined
            ? "text-zinc-600"
            : isNeg
            ? "text-red-400"
            : isPos
            ? "text-emerald-400"
            : "text-zinc-200"
        }`}
      >
        {value !== undefined ? fmt(value) : "-"}
      </span>
    </div>
  );
}

export default function MetricsTable({ m }: { m: Metrics }) {
  const sharpe = m.sharpe;
  return (
    <div className="terminal-card overflow-hidden">
      {/* Titlebar */}
      <div className="flex items-center justify-between border-b border-[#1E2638] bg-[#0A0D15] px-3 py-2 font-mono">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
          VALIDATION METRICS
        </span>
        <span className="rounded-[2px] border border-[#1E2638] bg-[#131824] px-1.5 py-0.5 text-[9px] text-zinc-400">
          AA EVAL GRADE
        </span>
      </div>

      {/* Real Section */}
      <div className="border-b border-[#1E2638] bg-[#080B12] px-3 py-1.5 font-mono text-[10px] font-bold tracking-wider text-emerald-400 flex items-center justify-between">
        <span>LIVE SIGNAL METRICS (TOP-20)</span>
        <span className="text-[9px] text-emerald-400/70 border border-emerald-900/50 bg-emerald-950/40 px-1 rounded-[2px]">
          VERIFIED FAKTA
        </span>
      </div>
      <div className="divide-y divide-[#1E2638]/50">
        {realCells.map((c) => (
          <Row key={c.k} k={c.k} label={c.label} value={m[c.k] as number | undefined} fmt={c.fmt} />
        ))}
      </div>

      {/* Synthetic Projection Section */}
      <div className="border-y border-amber-900/40 bg-amber-950/20 px-3 py-1.5 font-mono text-[10px] text-amber-300 flex items-center justify-between">
        <span className="font-bold">SYNTHETIC PROJECTION (52W)</span>
        <span className="rounded-[2px] bg-amber-400 px-1 py-0.2 font-black text-[9px] text-zinc-950">
          NOT REALIZED
        </span>
      </div>
      <div className="p-2 bg-amber-950/10 text-[10px] font-mono leading-relaxed text-amber-200/80 border-b border-[#1E2638]">
        Simulasi forecast-based 52-minggu. Realized DB saat ini 500 baris (lihat README §15).
      </div>
      <div className="divide-y divide-[#1E2638]/50">
        {synthCells.map((c) => (
          <Row key={c.k} k={c.k} label={c.label} value={m[c.k] as number | undefined} fmt={c.fmt} />
        ))}
      </div>

      <div className="border-t border-[#1E2638] bg-[#0A0D15] px-3 py-1.5 font-mono text-[9px] text-zinc-500">
        Bukan rekomendasi investasi · Sharpe (ER-based): {sharpe !== undefined ? sharpe.toFixed(2) : "-"}
      </div>
    </div>
  );
}
