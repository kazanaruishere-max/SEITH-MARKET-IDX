"use client";

import { useMemo } from "react";
import Link from "next/link";
import { profileOf } from "@/data/companyProfiles";

export type HeatItem = {
  ticker: string;
  mispricingScore: number;
  sector?: string;
  rank?: number | null;
  close?: number;
  marketCapHint?: number;
};

const SECTOR_COLOR: Record<string, string> = {
  FINANCE: "#0284C7",
  ENERGY: "#D97706",
  CONSUMER: "#8B5CF6",
  INFRA: "#0D9488",
  OTHER: "#E11D48",
};

function sectorBadgeBg(sector?: string) {
  return SECTOR_COLOR[sector ?? "OTHER"] ?? "#475569";
}

function itemWeight(x: HeatItem) {
  if (x.marketCapHint && x.marketCapHint > 0) return x.marketCapHint;
  return Math.max(1, Math.abs(x.mispricingScore - 50) * 2 + 6);
}

function gradient(score: number) {
  const v = Math.max(0, Math.min(100, score));
  const t = v / 100;
  if (t < 0.5) {
    const k = t / 0.5;
    // Deep Matte Red -> Neutral Dark Slate
    const r = Math.round(180 - 135 * k);
    const g = Math.round(35 + 15 * k);
    const b = Math.round(45 + 25 * k);
    return `rgb(${r},${g},${b})`;
  }
  const k = (t - 0.5) / 0.5;
  // Neutral Dark Slate -> Vibrant Bull Green
  const r = Math.round(45 - 37 * k);
  const g = Math.round(50 + 103 * k);
  const b = Math.round(70 + 59 * k);
  return `rgb(${r},${g},${b})`;
}

function worst(row: number[], side: number) {
  const sum = row.reduce((a, b) => a + b, 0);
  const mx = Math.max(...row);
  const mn = Math.min(...row);
  if (mn === 0) return Infinity;
  return Math.max((side * side * mx) / (sum * sum), (sum * sum) / (side * side * mn));
}

function getRects(values: number[], x: number, y: number, w: number, h: number) {
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const areas = values.map((v) => (v / total) * w * h);
  const out: { x: number; y: number; w: number; h: number }[] = [];
  let cx = x,
    cy = y,
    cw = w,
    ch = h;
  let rem = [...areas];

  while (rem.length) {
    const side = Math.min(cw, ch);
    let bestN = 1;
    let bestW = worst(rem.slice(0, 1), side);
    for (let n = 2; n <= rem.length; n++) {
      const cur = worst(rem.slice(0, n), side);
      if (cur < bestW) {
        bestW = cur;
        bestN = n;
      } else break;
    }
    const row = rem.slice(0, bestN);
    const sum = row.reduce((a, b) => a + b, 0);
    if (cw >= ch) {
      const rh = sum / cw;
      let curX = cx;
      for (const a of row) {
        const rw = a / rh;
        out.push({ x: curX, y: cy, w: rw, h: rh });
        curX += rw;
      }
      cy += rh;
      ch -= rh;
    } else {
      const rw = sum / ch;
      let curY = cy;
      for (const a of row) {
        const rh = a / rw;
        out.push({ x: cx, y: curY, w: rw, h: rh });
        curY += rh;
      }
      cx += rw;
      cw -= rw;
    }
    rem = rem.slice(bestN);
    if (cw <= 0.5 || ch <= 0.5) break;
  }
  return out;
}

export default function Heatmap100({ items }: { items: HeatItem[] }) {
  const filtered = items.filter((x) => x.ticker && x.ticker !== "-" && x.ticker !== "—");
  const sorted = [...filtered].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));

  const { bySector, sectorRects } = useMemo(() => {
    const groups = ["FINANCE", "ENERGY", "CONSUMER", "INFRA", "OTHER"]
      .map((sec) => ({ sec, list: sorted.filter((x) => x.sector === sec) }))
      .filter((g) => g.list.length > 0);

    const bs = groups.map((g) => ({
      ...g,
      totalW: g.list.reduce((s, x) => s + itemWeight(x), 0),
    }));

    const sectorWeights = bs.map((g) => g.totalW);
    const sRects = getRects(sectorWeights, 0, 0, 100, 100);
    return { bySector: bs, sectorRects: sRects };
  }, [sorted]);

  if (!sorted.length) {
    return (
      <div className="terminal-card flex h-[480px] items-center justify-center p-6 text-center font-mono text-xs text-zinc-500">
        NO DATA FROM /api/v1/ranking
      </div>
    );
  }

  return (
    <div className="terminal-card overflow-hidden">
      {/* Terminal Titlebar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2638] bg-[#0A0D15] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
            TREEMAP MAP&lt;GO&gt;
          </span>
          <span className="text-zinc-600">│</span>
          <span className="font-mono text-[11px] text-zinc-400">
            {filtered.length} IDX EMITEN · PROPORTIONAL BY SECTOR WEIGHT
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-[1px]" style={{ background: gradient(15) }} /> &lt;30
            <span className="h-2 w-2 rounded-[1px] ml-1" style={{ background: gradient(50) }} /> 50
            <span className="h-2 w-2 rounded-[1px] ml-1" style={{ background: gradient(85) }} /> &gt;70
          </span>
          <span className="hidden sm:inline text-zinc-600">│</span>
          <span className="hidden sm:inline text-zinc-500">KLIK CELL → DOSSIER</span>
        </div>
      </div>

      {/* Main Treemap Canvas */}
      <div className="relative w-full bg-[#07090E] h-[460px] sm:h-[500px] md:h-[540px]">
        {bySector.map(({ sec, list }, si) => {
          const sr = sectorRects[si];
          if (!sr) return null;

          const vals = list.map((x) => itemWeight(x));
          const rects = getRects(vals, 0, 0, 100, 100);
          const avg = list.reduce((s, x) => s + x.mispricingScore, 0) / list.length;

          return (
            <div
              key={sec}
              className="absolute overflow-hidden border border-[#1E2638] bg-[#0A0D15]"
              style={{
                left: `${sr.x}%`,
                top: `${sr.y}%`,
                width: `${sr.w}%`,
                height: `${sr.h}%`,
              }}
            >
              {/* Sector Header Header */}
              <div className="flex h-[24px] items-center justify-between border-b border-[#1E2638] bg-[#10141E] px-2 text-[10px] font-mono leading-none">
                <span className="font-bold text-zinc-200">
                  {sec}
                  <span className="text-zinc-500 ml-1">({list.length})</span>
                </span>
                <span className="text-zinc-400">AVG {avg.toFixed(1)}</span>
              </div>

              {/* Tickers Intra-Sector Grid */}
              <div className="absolute inset-x-0 bottom-0 top-[24px]">
                {list.map((t, i) => {
                  const r = rects[i];
                  if (!r) return null;
                  const prof = profileOf(t.ticker);
                  const bg = gradient(t.mispricingScore);

                  // Adaptive content display based on real dimensions
                  const isLarge = r.w > 18 && r.h > 26;
                  const isMedium = r.w > 11 && r.h > 17;
                  const isSmall = r.w > 7 && r.h > 11;

                  const title = `${t.ticker} — ${prof?.name ?? t.ticker} | Sektor: ${sec} | Close: ${
                    t.close ? "Rp " + t.close.toLocaleString("id-ID") : "-"
                  } | Mispricing: ${t.mispricingScore.toFixed(1)} | Rank: #${
                    t.rank ?? i + 1
                  } | idx.co.id ↗`;

                  return (
                    <Link
                      key={t.ticker}
                      href={`/dossier/${t.ticker}?market=id`}
                      title={title}
                      aria-label={`${t.ticker}: Skor Mispricing ${t.mispricingScore.toFixed(1)}, Sektor ${sec}`}
                      className="absolute flex flex-col items-center justify-center overflow-hidden border border-[#07090E]/80 p-0.5 text-center transition-all hover:z-20 hover:border-amber-400 hover:shadow-lg"
                      style={{
                        left: `${r.x}%`,
                        top: `${r.y}%`,
                        width: `${r.w}%`,
                        height: `${r.h}%`,
                        background: bg,
                      }}
                    >
                      <span className="sr-only">{t.ticker}</span>
                      {isLarge ? (
                        <>
                          <span
                            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[2px] font-mono text-[8px] font-black text-white"
                            style={{ background: sectorBadgeBg(sec) }}
                          >
                            {t.ticker.slice(0, 2)}
                          </span>
                          <span className="font-mono text-[10px] font-black text-white drop-shadow-sm leading-tight mt-0.5">
                            {t.ticker}
                          </span>
                          <span className="font-mono text-[8px] font-semibold text-zinc-200 leading-none">
                            {t.mispricingScore.toFixed(1)}
                          </span>
                          {t.close ? (
                            <span className="font-mono text-[7px] text-zinc-300/80 leading-none hidden xl:block">
                              {t.close.toLocaleString("id-ID")}
                            </span>
                          ) : null}
                        </>
                      ) : isMedium ? (
                        <>
                          <span className="font-mono text-[9px] font-black text-white leading-tight">
                            {t.ticker}
                          </span>
                          <span className="font-mono text-[8px] font-bold text-zinc-200 leading-none">
                            {t.mispricingScore.toFixed(1)}
                          </span>
                        </>
                      ) : isSmall ? (
                        <span className="font-mono text-[8px] font-bold text-white leading-none">
                          {t.ticker}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Terminal Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#1E2638] bg-[#0A0D15] px-3 py-1.5 font-mono text-[10px] text-zinc-400">
        <span>STATUS: PROPORTIONAL GLOBAL SQUARIFY · FINANCE 25 &gt; OTHER 15</span>
        <span className="text-zinc-500">Bukan rekomendasi investasi · Data riil Sectors API</span>
      </div>
    </div>
  );
}
