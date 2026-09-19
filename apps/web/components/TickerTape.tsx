"use client";

export type TapeItem = {
  ticker: string;
  close?: number;
  mispricingScore: number;
  rank?: number | null;
  anomalyFlag?: boolean;
};

export default function TickerTape({ items }: { items: TapeItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="border-b border-[#1E2638] bg-[#07090E] px-3 py-1 font-mono text-[11px] leading-tight text-zinc-300">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
        <div className="flex shrink-0 items-center gap-2 border-r border-[#1E2638] pr-3">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">IDX FEED</span>
        </div>
        <div className="flex flex-1 items-center gap-5 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap py-0.5">
          {items.slice(0, 12).map((it) => {
            const scoreColor =
              it.mispricingScore > 70
                ? "text-emerald-400"
                : it.mispricingScore >= 40
                ? "text-amber-400"
                : "text-red-400";
            return (
              <a
                key={it.ticker}
                href={`/dossier/${it.ticker}?market=id`}
                className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <span className="font-bold text-zinc-100">{it.ticker}</span>
                {it.close ? (
                  <span className="text-zinc-400">Rp {it.close.toLocaleString("id-ID")}</span>
                ) : null}
                <span className={`text-[10px] font-semibold ${scoreColor}`}>
                  SCR {it.mispricingScore.toFixed(1)}
                </span>
                {it.anomalyFlag ? (
                  <span className="rounded-[2px] bg-red-950 px-1 py-0.2 text-[9px] font-bold text-red-300 border border-red-800/50">
                    !Z
                  </span>
                ) : null}
                <span className="text-zinc-700">│</span>
              </a>
            );
          })}
        </div>
        <div className="hidden shrink-0 items-center gap-2 text-[10px] text-zinc-500 md:flex">
          <span>MARKET=ID</span>
          <span>·</span>
          <span>100 UNIVERSE</span>
        </div>
      </div>
    </div>
  );
}
