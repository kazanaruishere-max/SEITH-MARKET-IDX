import Link from "next/link";
import ScoreBadge from "./ScoreBadge";
import { profileOf } from "@/data/companyProfiles";

export type RankingItem = {
  ticker: string;
  mispricingScore: number;
  anomalyZ?: number | null;
  sector?: string;
  market?: string;
  anomalyFlag?: boolean;
  rank?: number | null;
  close?: number;
  excluded?: boolean;
  reason?: string;
  components?: {
    expected_return?: number;
    anomaly_z?: number;
    quality_value?: number;
    sector_mom?: number;
  };
};

function barWidth(s: number) {
  return `${Math.max(4, Math.min(100, s))}%`;
}

export default function RankingTable({
  items,
  pagination,
  pageHref,
}: {
  items: RankingItem[];
  pagination?: { page: number; pageSize: number; total: number };
  pageHref?: (p: number) => string;
}) {
  const sorted = [...items].sort((a, b) => b.mispricingScore - a.mispricingScore);

  return (
    <div className="overflow-x-auto no-scrollbar font-mono text-xs">
      <table className="w-full text-left border-collapse" aria-label="Tabel Pemeringkatan Emiten IDX">
        <thead className="sticky top-0 z-10 border-b border-[#1E2638] bg-[#0A0D15] text-[10px] uppercase tracking-wider text-zinc-400">
          <tr>
            <th scope="col" className="px-3 py-2 font-bold w-12">#</th>
            <th scope="col" className="px-3 py-2 font-bold min-w-[200px]">EMITEN / TIKER</th>
            <th scope="col" className="px-3 py-2 font-bold min-w-[100px]">SEKTOR</th>
            <th scope="col" className="px-3 py-2 text-right font-bold min-w-[100px]">CLOSE RP</th>
            <th scope="col" className="px-3 py-2 font-bold min-w-[160px]">MISPRICING SCORE</th>
            <th scope="col" className="px-3 py-2 text-right font-bold min-w-[80px]">|Z| SCORE</th>
            <th scope="col" className="px-3 py-2 text-center font-bold min-w-[90px]">STATUS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1E2638]/50 bg-[#07090E]">
          {sorted.map((r, idx) => {
            const p = profileOf(r.ticker);
            const isExcluded = !!r.excluded;
            const reason = r.reason || (r.excluded ? "excluded" : "");
            const z = r.anomalyZ ?? 0;
            const absZ = Math.abs(z);
            const rankDisplay = isExcluded ? "—" : r.rank ?? idx + 1;

            return (
              <tr
                key={r.ticker}
                className={`transition-colors ${
                  isExcluded
                    ? "bg-amber-950/10 opacity-70 hover:bg-amber-950/20"
                    : "hover:bg-[#10141E]"
                }`}
              >
                {/* Rank */}
                <td className="px-3 py-2 text-zinc-500 font-semibold">{rankDisplay}</td>

                {/* Ticker & Name */}
                <td className="px-3 py-2">
                  {isExcluded ? (
                    <div>
                      <span className="font-bold text-zinc-400">{r.ticker}</span>
                      <span className="ml-2 rounded-[2px] border border-amber-900/50 bg-amber-950/30 px-1 py-0.2 text-[9px] text-amber-300">
                        {reason || "EXCLUDED"}
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={`/dossier/${r.ticker}?market=${r.market ?? "id"}`}
                      className="block group"
                      title={`${r.ticker} — ${p?.name ?? r.ticker} — ${p?.desc ?? ""} (idx.co.id ↗)`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
                          {r.ticker}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-normal">
                          {r.market?.toUpperCase() ?? "ID"}
                        </span>
                      </div>
                      {p ? (
                        <div className="text-[10px] text-zinc-400 truncate max-w-[28ch]">
                          {p.name}
                        </div>
                      ) : null}
                    </Link>
                  )}
                </td>

                {/* Sector */}
                <td className="px-3 py-2">
                  <span className="rounded-[2px] border border-[#1E2638] bg-[#0D111A] px-1.5 py-0.5 text-[10px] text-zinc-300">
                    {r.sector ?? "-"}
                  </span>
                </td>

                {/* Close Price */}
                <td className="px-3 py-2 text-right font-bold text-zinc-200">
                  {r.close ? r.close.toLocaleString("id-ID") : "—"}
                </td>

                {/* Mispricing Score & Visual Bar */}
                <td className="px-3 py-2">
                  {isExcluded ? (
                    <span className="text-zinc-500 text-[10px]">CLEANSED // NO SCORE</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ScoreBadge score={r.mispricingScore} anomaly={r.anomalyFlag} />
                      <div className="hidden sm:block h-1.5 w-20 rounded-[1px] bg-[#1E2638] overflow-hidden">
                        <div
                          className="h-full"
                          style={{
                            width: barWidth(r.mispricingScore),
                            background:
                              r.mispricingScore > 70
                                ? "#089981"
                                : r.mispricingScore >= 40
                                ? "#F59E0B"
                                : "#F23645",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </td>

                {/* Anomaly Z Score */}
                <td className="px-3 py-2 text-right font-semibold">
                  {isExcluded ? (
                    <span className="text-zinc-500">—</span>
                  ) : (
                    <span
                      className={
                        absZ >= 2
                          ? "text-red-400 font-bold"
                          : absZ >= 1
                          ? "text-amber-400"
                          : "text-zinc-400"
                      }
                    >
                      {z > 0 ? `+${z.toFixed(2)}` : z.toFixed(2)}
                    </span>
                  )}
                </td>

                {/* Status Badge */}
                <td className="px-3 py-2 text-center">
                  {isExcluded ? (
                    <span className="rounded-[2px] border border-amber-900/60 bg-amber-950/40 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
                      EXCLUDED
                    </span>
                  ) : r.anomalyFlag ? (
                    <span
                      className="rounded-[2px] border border-red-800/60 bg-red-950/60 px-1.5 py-0.2 text-[9px] font-bold text-red-300"
                      title="Anomaly Flagged (|Z|>2 or Volume Spike)"
                    >
                      ALERT !Z
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-500">NORMAL</span>
                  )}
                </td>
              </tr>
            );
          })}

          {sorted.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-3 py-10 text-center text-zinc-500">
                NO EMITEN DATA FOUND
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>

      {/* Pagination Bar */}
      {pagination ? (
        (() => {
          const totalPages = Math.max(1, Math.ceil((pagination.total || 100) / pagination.pageSize));
          const isFirst = pagination.page <= 1;
          const isLast = pagination.page >= totalPages;

          return (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#1E2638] bg-[#0A0D15] px-3 py-2 text-[10px] text-zinc-400">
              <div>
                PAGE {pagination.page} OF {totalPages} │ {pagination.pageSize} PER PAGE │ TOTAL:{" "}
                {pagination.total} EMITEN
              </div>
              <div className="flex items-center gap-1.5">
                {pageHref ? (
                  isFirst ? (
                    <span className="rounded-[2px] border border-[#1E2638] bg-[#07090E] px-2 py-0.5 text-zinc-600 cursor-not-allowed">
                      PREV
                    </span>
                  ) : (
                    <Link
                      href={pageHref(pagination.page - 1)}
                      className="rounded-[2px] border border-[#1E2638] bg-[#131824] px-2 py-0.5 text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
                    >
                      PREV
                    </Link>
                  )
                ) : null}

                {pageHref ? (
                  isLast ? (
                    <span className="rounded-[2px] border border-[#1E2638] bg-[#07090E] px-2 py-0.5 text-zinc-600 cursor-not-allowed">
                      NEXT
                    </span>
                  ) : (
                    <Link
                      href={pageHref(pagination.page + 1)}
                      className="rounded-[2px] border border-[#1E2638] bg-[#131824] px-2 py-0.5 text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
                    >
                      NEXT
                    </Link>
                  )
                ) : null}
              </div>
            </div>
          );
        })()
      ) : null}
    </div>
  );
}
