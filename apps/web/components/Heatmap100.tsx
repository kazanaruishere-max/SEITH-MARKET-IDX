"use client";
function c(score: number) {
  const v = Math.max(0, Math.min(100, score));
  if (v <= 50) {
    const t = v / 50;
    const r = Math.round(239 + (251 - 239) * t);
    const g = Math.round(68 + (191 - 68) * t);
    const b = Math.round(68 + (36 - 68) * t);
    return `rgb(${r},${g},${b})`;
  }
  const t = (v - 50) / 50;
  const r = Math.round(251 + (16 - 251) * t);
  const g = Math.round(191 + (185 - 191) * t);
  const b = Math.round(36 + (129 - 36) * t);
  return `rgb(${r},${g},${b})`;
}
export type HeatItem = { ticker: string; mispricingScore: number; sector?: string; rank?: number; companyProfile?: { name: string; description: string; sourceUrl: string } };
export default function Heatmap100({ items }: { items: HeatItem[] }) {
  const sorted = [...items].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999)).slice(0, 100);
  const padded = sorted.length < 100 ? [...sorted, ...Array(100 - sorted.length).fill({ ticker: "-", mispricingScore: 0, sector: "-" })] : sorted;
  const bySector = ["FINANCE", "ENERGY", "CONSUMER", "INFRA", "OTHER"].map((sec) => ({ sec, list: padded.filter((x) => x.sector === sec) }));
  const avg = (list: HeatItem[]) => list.length ? (list.reduce((s, x) => s + x.mispricingScore, 0) / list.length).toFixed(1) : "-";
  return (
    <div className="card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-200">Heatmap — treemap by sector</span>
          <span className="hidden rounded-full border border-zinc-800 bg-[#0B0E14] px-2 py-0.5 text-[10px] font-medium text-zinc-500 md:inline">10x10 rank→score</span>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] text-zinc-500"><span className="h-2 w-3 rounded-sm bg-[#ef4444]" />0 <span className="h-2 w-3 rounded-sm bg-[#fbbf24]" />50 <span className="h-2 w-3 rounded-sm bg-[#10b981]" />100<span className="ml-2 hidden text-zinc-600 md:inline">— red→amber→emerald — dot = mispricing</span></span>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 min-h-[420px]">
        {bySector.map(({ sec, list }) => (
          <div key={sec} className="flex flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-[#0B0E14] aspect-[3/4] min-h-[320px]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-[#0B0E14] px-2.5 py-1.5">
              <span className="text-[11px] font-bold tracking-wide text-zinc-200">{sec}</span>
              <span className="font-mono text-[11px] text-zinc-500">{list.length} · {avg(list)}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-1.5 [scrollbar-width:thin]">
              <div className="grid grid-cols-2 gap-[4px]">
                {list.map((r, i) => (
                  <a key={r.ticker + i} href={r.ticker === "-" ? undefined : `/dossier/${r.ticker}?market=id`} aria-label={`${r.ticker} ${sec} score ${r.mispricingScore.toFixed(1)}`} title={`${r.ticker} - ${r.companyProfile?.name ?? r.ticker} - score ${r.mispricingScore.toFixed(1)} rank ${r.rank ?? i + 1}`} className="flex aspect-[2/3] min-h-[52px] min-w-[52px] items-center justify-center rounded-[6px] font-mono text-[9px] font-bold leading-none tabular-nums transition-all hover:brightness-110 hover:scale-[1.02] hover:shadow-[0_2px_8px_rgba(0,0,0,0.4)]" style={{ background: r.ticker === "-" ? "#1a1a1a" : c(r.mispricingScore), color: r.mispricingScore >= 38 && r.mispricingScore <= 72 ? "#0B0E14" : "#fff" }}>
                    {r.ticker === "-" ? "" : r.ticker.slice(0, 6)}
                  </a>
                ))}
              </div>
              {list.length === 0 ? <div className="col-span-2 py-4 text-center text-[11px] text-zinc-600">no ticker</div> : null}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800/60 pt-2 text-[11px] text-zinc-500">
        <span>Bukan rekomendasi investasi — warna = mispricingScore 0→100 — tap cell → dossier</span>
        <span className="font-mono text-zinc-600">{padded.filter((x) => x.ticker !== "-").length} live · grouped AA×TV</span>
      </div>
    </div>
  );
}
