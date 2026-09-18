import ScoreBadge from "./ScoreBadge";
import { profileOf } from "@/data/companyProfiles";
export type LeakItem = { ticker: string; mispricingScore: number; anomalyZ?: number; rank?: number; sector?: string };
export default function TopLeaks({ items }: { items: LeakItem[] }) {
  const top = [...items].sort((a, b) => Math.abs(b.anomalyZ ?? 0) - Math.abs(a.anomalyZ ?? 0)).slice(0, 5);
  return (
    <div className="overflow-hidden rounded-xl border border-[#24242e] bg-[#11151F] shadow-card">
      <div className="flex items-center justify-between border-b border-[#24242e]/60 bg-[#1A1F2E]/50 px-3 py-2.5">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-amber-300">Money Leak Radar · Top 5 |Z|</span>
        <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-red-300 ring-1 ring-red-500/20">LIVE 100</span>
      </div>
      <ul className="divide-y divide-zinc-800/60">
        {top.map((r, i) => {
          const p = profileOf(r.ticker);
          const title = `${r.ticker} — ${p?.name ?? r.ticker} — ${p?.desc ?? ""} — sumber idx.co.id`;
          return (
            <li key={r.ticker} className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-[#151a2a]/60 transition-colors">
              <span className="font-mono text-xs text-zinc-500">#{i + 1}</span>
              <a href={`/dossier/${r.ticker}?market=id`} title={title} className="min-w-0 flex-1 hover:opacity-90">
                <span className="font-mono text-sm font-bold tracking-tight hover:text-amber-300 hover:underline decoration-amber-400/30 underline-offset-4">{r.ticker}</span>
                <span className="ml-2 text-[11px] font-normal text-zinc-500">{r.sector ?? ""}</span>
                {p ? <span className="mt-0.5 block truncate text-[11px] leading-tight text-zinc-400" title={p.desc}>{p.name}</span> : null}
              </a>
              <span className="shrink-0 font-mono text-xs font-semibold text-red-300">|Z| {(r.anomalyZ ?? 0).toFixed(1)}</span>
              <ScoreBadge score={r.mispricingScore} anomaly />
            </li>
          );
        })}
        {top.length === 0 ? <li className="px-3 py-8 text-center text-sm text-zinc-500">No anomalies — minZ 2.0 · 100 live</li> : null}
      </ul>
      <div className="border-t border-[#24242e]/60 bg-[#0B0E14]/40 px-3 py-2 text-xs leading-relaxed text-zinc-500">Anomaly |Z|&gt;2 · Flag merah · Top 5 |Z| terbesar · profil idx.co.id ↗</div>
    </div>
  );
}
