import ScoreBadge from "./ScoreBadge";
export type LeakItem = { ticker: string; mispricingScore: number; anomalyZ?: number; rank?: number; sector?: string };
export default function TopLeaks({ items }: { items: LeakItem[] }) {
  const top = [...items].sort((a, b) => Math.abs(b.anomalyZ ?? 0) - Math.abs(a.anomalyZ ?? 0)).slice(0, 5);
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#11151F]">
      <div className="border-b border-zinc-800 px-3 py-2 text-xs uppercase tracking-wide text-amber-400">Money Leak Radar · Top 5 |Z|</div>
      <ul className="divide-y divide-zinc-800">
        {top.map((r) => (
          <li key={r.ticker} className="flex items-center justify-between px-3 py-2 text-sm">
            <a href={`/dossier/${r.ticker}?market=id`} className="font-mono hover:underline">{r.ticker}</a>
            <span className="text-xs text-zinc-400">|Z| {(r.anomalyZ ?? 0).toFixed(1)}</span>
            <ScoreBadge score={r.mispricingScore} anomaly />
          </li>
        ))}
        {top.length === 0 ? <li className="px-3 py-6 text-center text-sm text-zinc-500">No anomalies — minZ 2.0</li> : null}
      </ul>
      <div className="border-t border-zinc-800 px-3 py-2 text-xs text-zinc-500">Bukan rekomendasi investasi</div>
    </div>
  );
}
