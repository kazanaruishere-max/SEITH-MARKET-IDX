import Link from "next/link";
import ScoreBadge from "./ScoreBadge";
import { profileOf } from "@/data/companyProfiles";

export type LeakItem = {
  ticker: string;
  mispricingScore: number;
  anomalyZ?: number;
  rank?: number;
  sector?: string;
  close?: number;
};

export default function TopLeaks({ items }: { items: LeakItem[] }) {
  const top = [...items]
    .sort((a, b) => Math.abs(b.anomalyZ ?? 0) - Math.abs(a.anomalyZ ?? 0))
    .slice(0, 5);

  return (
    <div className="terminal-card overflow-hidden">
      {/* Titlebar */}
      <div className="flex items-center justify-between border-b border-[#1E2638] bg-[#0A0D15] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
            ANOMALY RADAR |Z|&gt;2
          </span>
        </div>
        <span className="rounded-[2px] border border-red-800/60 bg-red-950/40 px-1.5 py-0.5 font-mono text-[9px] font-bold text-red-300">
          MONEY LEAKS
        </span>
      </div>

      {/* List with Horizontal Deviation Meter */}
      <div className="divide-y divide-[#1E2638]/70 font-mono text-xs">
        {top.map((r, i) => {
          const p = profileOf(r.ticker);
          const z = r.anomalyZ ?? 0;
          const absZ = Math.abs(z);
          const isNegative = z < 0;
          // Normalize position on -3 to +3 scale (percentage 0% to 100%, center at 50%)
          const clampedZ = Math.max(-3, Math.min(3, z));
          const meterPos = ((clampedZ + 3) / 6) * 100;
          const barWidth = Math.min(50, (absZ / 3) * 50);

          return (
            <div
              key={r.ticker}
              className="p-2.5 transition-colors hover:bg-[#131824] flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-zinc-500 font-bold">#{i + 1}</span>
                  <Link
                    href={`/dossier/${r.ticker}?market=id`}
                    className="font-bold text-zinc-100 hover:text-amber-400 hover:underline transition-colors"
                  >
                    {r.ticker}
                  </Link>
                  <span className="text-[10px] text-zinc-400 border border-[#1E2638] px-1 py-0.2 rounded-[2px] bg-[#07090E]">
                    {r.sector ?? "-"}
                  </span>
                  {p ? (
                    <span className="hidden sm:inline text-[10px] text-zinc-500 truncate max-w-[14ch]">
                      {p.name}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[11px] font-bold ${
                      absZ >= 2 ? "text-red-400" : "text-amber-400"
                    }`}
                  >
                    Z {z > 0 ? `+${z.toFixed(2)}` : z.toFixed(2)}
                  </span>
                  <ScoreBadge score={r.mispricingScore} anomaly />
                </div>
              </div>

              {/* Deviation Meter Bar (-3σ to +3σ) */}
              <div className="relative h-2 w-full bg-[#07090E] rounded-[2px] border border-[#1E2638] overflow-hidden">
                {/* Center marker (0σ) */}
                <div className="absolute inset-y-0 left-1/2 w-0.5 bg-zinc-700 z-10" />
                {/* -2σ and +2σ threshold marks */}
                <div className="absolute inset-y-0 left-[16.66%] w-px bg-red-900/60" />
                <div className="absolute inset-y-0 left-[83.33%] w-px bg-red-900/60" />

                {/* Actual Deviation Fill */}
                <div
                  className={`absolute inset-y-0 ${
                    absZ >= 2 ? "bg-red-500/80" : "bg-amber-400/80"
                  }`}
                  style={{
                    left: isNegative ? `${meterPos}%` : "50%",
                    width: `${barWidth}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-[9px] text-zinc-500 leading-none">
                <span>-3σ (Under)</span>
                <span>0σ</span>
                <span>+3σ (Over)</span>
              </div>
            </div>
          );
        })}

        {top.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-500 font-mono">
            NO ANOMALIES FLAGGED (|Z| &gt; 2.0)
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#1E2638] bg-[#0A0D15] px-3 py-1.5 font-mono text-[9px] text-zinc-500">
        <span>ALGORITHM: Z = (ACTUAL - KRONOS FORECAST) / VOLATILITY · |Z|&gt;2 FLAG</span>
        <span>Bukan rekomendasi investasi</span>
      </div>
    </div>
  );
}
