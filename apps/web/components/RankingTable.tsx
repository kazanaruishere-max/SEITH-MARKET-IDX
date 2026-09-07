import ScoreBadge from "./ScoreBadge";
export type RankingItem = { ticker: string; mispricingScore: number; sector?: string; market?: string; anomalyFlag?: boolean; rank?: number };
export default function RankingTable({ items, pagination }: { items: RankingItem[]; pagination?: { page: number; pageSize: number; total: number } }) {
  const sorted = [...items].sort((a, b) => b.mispricingScore - a.mispricingScore);
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#11151F]">
      <table className="w-full text-sm">
        <thead className="bg-[#1A1F2E] text-left text-xs uppercase tracking-wide text-zinc-400">
          <tr><th className="px-3 py-2">Ticker</th><th className="px-3 py-2">Market</th><th className="px-3 py-2">Score</th><th className="px-3 py-2">Rank</th></tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {sorted.map((r) => (
            <tr key={r.ticker} className="hover:bg-zinc-900/40">
              <td className="px-3 py-2 font-mono">{r.ticker}</td>
              <td className="px-3 py-2"><span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs uppercase">{r.market ?? "id"}</span></td>
              <td className="px-3 py-2"><ScoreBadge score={r.mispricingScore} anomaly={r.anomalyFlag} /></td>
              <td className="px-3 py-2 text-zinc-400">{r.rank ?? "-"}</td>
            </tr>
          ))}
          {sorted.length === 0 ? <tr><td colSpan={4} className="px-3 py-8 text-center text-zinc-500">No data — consume /api/v1/ranking</td></tr> : null}
        </tbody>
      </table>
      {pagination ? <div className="flex items-center justify-between border-t border-zinc-800 px-3 py-2 text-xs text-zinc-400"><span>page {pagination.page} · {pagination.pageSize}/page · total {pagination.total}</span><span>Bukan rekomendasi investasi</span></div> : <div className="px-3 py-2 text-center text-xs text-zinc-500">Bukan rekomendasi investasi — informasi & analisis saja</div>}
    </div>
  );
}
