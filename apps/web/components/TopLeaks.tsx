import ScoreBadge from "./ScoreBadge";
export type LeakItem = { ticker: string; mispricingScore: number; anomalyZ?: number; rank?: number; sector?: string };
export default function TopLeaks({ items }: { items: LeakItem[] }) {
  const top = [...items].sort((a, b) => Math.abs(b.anomalyZ ?? 0) - Math.abs(a.anomalyZ ?? 0)).slice(0, 5);
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#11151F]">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-[#1A1F2E]/60 px-3 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-amber-300">Money Leak Radar · Top 5 |Z|</span>
        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold tracking-wide text-red-300">LIVE 100</span>
      </div>
      <ul className="divide-y divide-zinc-800">
        {top.map((r, i) => (
          <li key={r.ticker} className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-zinc-900/30">
            <span className="font-mono text-xs text-zinc-500">#{i + 1}</span>
            <a href={`/dossier/${r.ticker}?market=id`} className="min-w-0 flex-1 font-mono font-semibold hover:text-amber-300 hover:underline">{r.ticker}<span className="ml-2 text-[10px] font-normal text-zinc-500">{r.sector ?? ""}</span></a>
            <span className="font-mono text-xs text-red-300">|Z| {(r.anomalyZ ?? 0).toFixed(1)}</span>
            <ScoreBadge score={r.mispricingScore} anomaly />
          </li>
        ))}
        {top.length === 0 ? <li className="px-3 py-8 text-center text-sm text-zinc-500">No anomalies — minZ 2.0 · 100 live</li> : null}
      </ul>
      <div className="border-t border-zinc-800 bg-[#0B0E14]/40 px-3 py-2 text-xs text-zinc-500">Anomaly |Z|&gt;2 · Flag merah · Top 5 |Z| terbesar</div>
    </div>
  );
}
