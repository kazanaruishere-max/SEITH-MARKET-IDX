import ScoreBadge from "./ScoreBadge";
import { profileOf } from "@/data/companyProfiles";
export type RankingItem = { ticker: string; mispricingScore: number; anomalyZ?: number; sector?: string; market?: string; anomalyFlag?: boolean; rank?: number | null; close?: number; excluded?: boolean; reason?: string };
function flagDot(flag?: boolean, z?: number) {
  if (flag) return <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/15 px-1.5 py-0.5 text-[10px] font-bold text-red-400" title={`flag |Z| ${(z ?? 0).toFixed(1)}`}>● {(z ?? 0).toFixed(1)}</span>;
  return <span className="inline-flex h-2 w-2 rounded-full bg-zinc-700" title="no flag" />;
}
function barWidth(s: number) { return `${Math.max(6, Math.min(100, s))}%`; }
export default function RankingTable({ items, pagination, pageHref }: { items: RankingItem[]; pagination?: { page: number; pageSize: number; total: number }; pageHref?: (p: number) => string }) {
  const sorted = [...items].sort((a, b) => b.mispricingScore - a.mispricingScore);
  return (
    <div className="overflow-hidden rounded-xl border border-[#24242e] bg-[#11151F] shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-[#0f1320] text-left text-[11px] uppercase tracking-[0.12em] text-zinc-400 shadow-[0_1px_0_#24242e]">
            <tr><th className="px-3 py-3 font-semibold">#</th><th className="px-3 py-3 font-semibold">Ticker & Emiten</th><th className="px-3 py-3 font-semibold">Sektor</th><th className="px-3 py-3 text-right font-semibold">Close</th><th className="min-w-[170px] px-3 py-3 font-semibold">Score</th><th className="px-3 py-3 text-right font-semibold">|Z|</th><th className="px-3 py-3 text-center font-semibold">Flag</th></tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {sorted.map((r) => {
              const p = profileOf(r.ticker);
              const isExcluded = !!r.excluded;
              const reason = r.reason || (r.excluded ? "excluded" : "");
              const title = isExcluded ? `${r.ticker} — excluded: ${reason} — cleansing gate OHLC missing → no score` : `${r.ticker} — ${p?.name ?? r.ticker} — ${p?.desc ?? r.sector ?? ""} — sumber: ${p?.idxUrl ?? "idx.co.id"} — klik → dossier`;
              return (
                <tr key={r.ticker} className={`group transition-colors ${isExcluded ? "opacity-60 bg-amber-950/10 hover:bg-amber-950/20" : "hover:bg-[#151a2a]/80"}`}>
                  <td className="px-3 py-2.5 font-mono text-xs text-zinc-500">{isExcluded ? "—" : r.rank ?? "-"}</td>
                  <td className="px-3 py-2.5">
                    {isExcluded ? (
                      <span title={title} className="block">
                        <span className="font-mono text-sm font-bold tracking-tight text-zinc-400">{r.ticker}</span>
                        <span className="ml-2 inline-flex rounded-full border border-amber-900/40 bg-amber-950/30 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">excluded · {reason || "no OHLC"}</span>
                      </span>
                    ) : (
                      <a href={`/dossier/${r.ticker}?market=${r.market ?? "id"}`} title={title} className="block hover:opacity-90">
                        <span className="font-mono text-sm font-bold tracking-tight text-zinc-100 group-hover:text-amber-300 group-hover:underline decoration-amber-400/30 underline-offset-4">{r.ticker}</span>
                        <span className="ml-2 hidden text-[11px] text-zinc-500 md:inline">{r.market?.toUpperCase() ?? "ID"}</span>
                        {p ? <span className="mt-0.5 block max-w-[28ch] truncate text-[11px] leading-tight text-zinc-400" title={p.desc}>{p.name}</span> : null}
                        {p ? <span className="hidden truncate text-[10px] leading-tight text-zinc-500 md:block" title={p.desc}>{p.desc}</span> : null}
                      </a>
                    )}
                  </td>
                  <td className="px-3 py-2.5"><span className="rounded-full border border-zinc-700/60 bg-[#0B0E14] px-2 py-0.5 text-xs font-medium text-zinc-400 group-hover:border-zinc-600">{r.sector ?? "-"}</span></td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-xs font-medium text-zinc-200">{r.close ? r.close.toLocaleString("id-ID") : "—"}</td>
                  <td className="px-3 py-2.5">{isExcluded ? <span className="rounded-full border border-zinc-800 bg-[#0B0E14] px-2 py-0.5 text-xs font-medium text-zinc-500">— · excluded</span> : <div className="flex items-center gap-2"><ScoreBadge score={r.mispricingScore} anomaly={r.anomalyFlag} /><span className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-zinc-800 md:block"><span className="block h-full rounded-full" style={{ width: barWidth(r.mispricingScore), background: r.mispricingScore > 70 ? "#10b981" : r.mispricingScore >= 40 ? "#fbbf24" : "#ef4444" }} /></span></div>}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-xs"><span className={Math.abs(r.anomalyZ ?? 0) > 2 ? "font-bold text-red-400" : Math.abs(r.anomalyZ ?? 0) > 1 ? "text-amber-300" : "text-zinc-400"}>{(r.anomalyZ ?? 0).toFixed(2)}</span></td>
                  <td className="px-3 py-2.5 text-center">{isExcluded ? <span className="text-[11px] text-zinc-500">—</span> : flagDot(r.anomalyFlag, r.anomalyZ)}</td>
                </tr>
              );
            })}
            {sorted.length === 0 ? <tr><td colSpan={7} className="px-3 py-12 text-center"><div className="mx-auto max-w-sm rounded-xl border border-dashed border-zinc-700 bg-[#0B0E14] px-6 py-8"><div className="font-mono text-sm font-semibold text-zinc-300">No data</div><div className="mt-1 text-xs text-zinc-500">consume /api/v1/ranking · universe 100 live — sumber profil idx.co.id</div></div></td></tr> : null}
          </tbody>
        </table>
      </div>
      {pagination ? (() => { const totalPages = Math.max(1, Math.ceil((pagination.total || 100) / pagination.pageSize)); const isFirst = pagination.page <= 1; const isLast = pagination.page >= totalPages; return (<div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#24242e] bg-[#0B0E14]/50 px-4 py-3"><span className="font-mono text-xs text-zinc-400">page {pagination.page}/{totalPages} · {pagination.pageSize}/page · total {pagination.total}</span><span className="flex items-center gap-2">{pageHref ? (isFirst ? <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs font-medium text-zinc-600">← Prev</span> : <a href={pageHref(pagination.page - 1)} className="rounded-full border border-zinc-700 bg-[#11151F] px-3 py-1 text-xs font-medium text-zinc-200 hover:bg-[#151a2a] hover:text-white">← Prev</a>) : null}{pageHref ? (isLast ? <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs font-medium text-zinc-600">Next →</span> : <a href={pageHref(pagination.page + 1)} className="rounded-full border border-zinc-700 bg-[#11151F] px-3 py-1 text-xs font-medium text-zinc-200 hover:bg-[#151a2a] hover:text-white">Next →</a>) : null}</span></div>); })() : <div className="border-t border-[#24242e] bg-[#0B0E14]/50 px-4 py-2.5 text-center text-xs text-zinc-500">Bukan rekomendasi investasi — informasi & analisis saja · profil emiten idx.co.id ↗</div>}
    </div>
  );
}
