import ScoreBadge from "./ScoreBadge";
export type RankingItem = { ticker: string; mispricingScore: number; anomalyZ?: number; sector?: string; market?: string; anomalyFlag?: boolean; rank?: number; close?: number };
function flagDot(flag?: boolean, z?: number) {
  if (flag) return <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 border border-red-500/30 px-1.5 py-0.5 text-[10px] font-bold text-red-400" title={`flag |Z| ${(z ?? 0).toFixed(1)}`}>● {(z ?? 0).toFixed(1)}</span>;
  return <span className="inline-flex h-2 w-2 rounded-full bg-zinc-700" title="no flag" />;
}
function barWidth(score: number) { return `${Math.max(6, Math.min(100, score))}%`; }
export default function RankingTable({ items, pagination }: { items: RankingItem[]; pagination?: { page: number; pageSize: number; total: number } }) {
  const sorted = [...items].sort((a, b) => b.mispricingScore - a.mispricingScore);
  return (
    <div className="overflow-hidden rounded-xl border border-[#24242e] bg-[#11151F] shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-[#0f1320] text-left text-[11px] uppercase tracking-[0.12em] text-zinc-400 shadow-[0_1px_0_#24242e]">
            <tr>
              <th className="whitespace-nowrap px-3 py-3 font-semibold">#</th>
              <th className="whitespace-nowrap px-3 py-3 font-semibold">Ticker</th>
              <th className="whitespace-nowrap px-3 py-3 font-semibold">Sector</th>
              <th className="whitespace-nowrap px-3 py-3 font-semibold text-right">Close</th>
              <th className="min-w-[160px] px-3 py-3 font-semibold">Score</th>
              <th className="whitespace-nowrap px-3 py-3 font-semibold text-right">|Z|</th>
              <th className="whitespace-nowrap px-3 py-3 text-center font-semibold">Flag</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {sorted.map((r) => (
              <tr key={r.ticker} className="group hover:bg-[#151a2a]/80 transition-colors">
                <td className="px-3 py-2.5 font-mono text-xs text-zinc-500">{r.rank ?? "-"}</td>
                <td className="px-3 py-2.5"><a className="font-mono text-sm font-bold tracking-tight hover:text-amber-300 hover:underline decoration-amber-400/30 underline-offset-4" href={`/dossier/${r.ticker}?market=${r.market ?? "id"}`}>{r.ticker}</a><span className="ml-2 hidden text-[11px] text-zinc-500 md:inline">{r.market?.toUpperCase() ?? "ID"}</span></td>
                <td className="px-3 py-2.5"><span className="rounded-full border border-zinc-700/60 bg-[#0B0E14] px-2 py-0.5 text-xs font-medium text-zinc-400 group-hover:border-zinc-600 group-hover:text-zinc-300 transition-colors">{r.sector ?? "-"}</span></td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-xs font-medium text-zinc-200">{r.close ? r.close.toLocaleString("id-ID") : "-"}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <ScoreBadge score={r.mispricingScore} anomaly={r.anomalyFlag} />
                    <span className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-zinc-800 md:block"><span className="block h-full rounded-full transition-all" style={{ width: barWidth(r.mispricingScore), background: r.mispricingScore > 70 ? "#10b981" : r.mispricingScore >= 40 ? "#fbbf24" : "#ef4444" }} /></span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-xs"><span className={Math.abs(r.anomalyZ ?? 0) > 2 ? "font-bold text-red-400" : Math.abs(r.anomalyZ ?? 0) > 1 ? "text-amber-300" : "text-zinc-400"}>{(r.anomalyZ ?? 0).toFixed(2)}</span></td>
                <td className="px-3 py-2.5 text-center">{flagDot(r.anomalyFlag, r.anomalyZ)}</td>
              </tr>
            ))}
            {sorted.length === 0 ? <tr><td colSpan={7} className="px-3 py-12 text-center"><div className="mx-auto max-w-sm rounded-xl border border-dashed border-zinc-700 bg-[#0B0E14] px-6 py-8"><div className="font-mono text-sm font-semibold text-zinc-300">No data</div><div className="mt-1 text-xs text-zinc-500">consume /api/v1/ranking · universe 100 live</div></div></td></tr> : null}
          </tbody>
        </table>
      </div>
      {pagination ? <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#24242e] bg-[#0B0E14]/50 px-4 py-3 text-xs text-zinc-400"><span className="font-mono">page {pagination.page} · {pagination.pageSize}/page · total {pagination.total}</span><span className="flex items-center gap-2"><span className="hidden md:inline">Bukan rekomendasi investasi</span><span className="h-3 w-px bg-zinc-800 hidden md:block" /><span className="font-mono text-zinc-500">sort mispricing · |Z| tie-break</span></span></div> : <div className="border-t border-[#24242e] bg-[#0B0E14]/50 px-4 py-2.5 text-center text-xs text-zinc-500">Bukan rekomendasi investasi — informasi &amp; analisis saja</div>}
    </div>
  );
}
