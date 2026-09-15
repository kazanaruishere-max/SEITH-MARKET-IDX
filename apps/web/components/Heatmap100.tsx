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
export type HeatItem = { ticker: string; mispricingScore: number; sector?: string; rank?: number };
export default function Heatmap100({ items }: { items: HeatItem[] }) {
  const sorted = [...items].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999)).slice(0, 100);
  const padded = sorted.length < 100 ? [...sorted, ...Array(100 - sorted.length).fill({ ticker: "-", mispricingScore: 0, sector: "-" })] : sorted;
  return (
    <div className="rounded-xl border border-zinc-800 bg-[#11151F] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-zinc-400">Heatmap 10×10 rank→score</span>
        <span className="flex items-center gap-1 text-[10px] text-zinc-500"><span className="h-2 w-2 rounded-sm bg-[#ef4444]" />0 <span className="h-2 w-2 rounded-sm bg-[#fbbf24]" />50 <span className="h-2 w-2 rounded-sm bg-[#10b981]" />100</span>
      </div>
      <div className="grid grid-cols-10 gap-[2px]">
        {padded.map((r, i) => (
          <div key={r.ticker + i} title={`${r.ticker} ${r.sector ?? ""} score ${r.mispricingScore.toFixed(1)} rank ${r.rank ?? i + 1}`} className="flex aspect-square items-center justify-center rounded-[2px] text-[7px] font-mono font-semibold leading-none" style={{ background: c(r.mispricingScore), color: r.mispricingScore >= 40 && r.mispricingScore <= 70 ? "#0B0E14" : "#fff" }}>
            {r.ticker === "-" ? "" : r.ticker.slice(0, 4)}
          </div>
        ))}
      </div>
      <div className="mt-2 text-xs text-zinc-500">Bukan rekomendasi investasi — warna = mispricingScore 0→100 red→amber→emerald</div>
    </div>
  );
}
