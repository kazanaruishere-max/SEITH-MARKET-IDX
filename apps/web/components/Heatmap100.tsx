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

// Data-driven linear weighting based on quant rank (1..100)
// Higher-ranked tickers receive proportionally larger visual area (3.3x spread [1.2, 4.0])
// to display full ticker, score, and company profile without extreme visual distortion.
function itemWeight(x: HeatItem): number {
  if (x.marketCapHint && x.marketCapHint > 0) return x.marketCapHint;
  const rank = x.rank ?? 50;
  return Number((1.2 + ((100 - Math.min(100, Math.max(1, rank))) / 99) * 2.8).toFixed(2));
}

// Finviz Green-Red only color palette (matching real Mispricing Score vs Universe Median)
// High mispricing / undervalued = Green; Low mispricing / overvalued / anomaly = Red
function getFinvizColor(score: number, median: number = 68.4): { bg: string; text: string } {
  const delta = score - median;

  if (delta >= 6.0) return { bg: "#00B060", text: "#FFFFFF" }; // Vibrant Bull Green
  if (delta >= 4.0) return { bg: "#089981", text: "#FFFFFF" }; // Bright Emerald
  if (delta >= 2.0) return { bg: "#15803D", text: "#FFFFFF" }; // Forest Green
  if (delta >= 0.5) return { bg: "#166534", text: "#F1F5F9" }; // Medium Dark Green
  if (delta > 0.0) return { bg: "#14532D", text: "#E2E8F0" }; // Deep Green

  if (delta <= -6.0) return { bg: "#F23645", text: "#FFFFFF" }; // Vibrant Bear Red
  if (delta <= -4.0) return { bg: "#DC2626", text: "#FFFFFF" }; // Bright Crimson
  if (delta <= -2.0) return { bg: "#B91C1C", text: "#FFFFFF" }; // Brick Red
  if (delta <= -0.5) return { bg: "#991B1B", text: "#F1F5F9" }; // Medium Dark Red
  if (delta < 0.0) return { bg: "#7F1D1D", text: "#E2E8F0" }; // Deep Wine Red

  return { bg: "#27272A", text: "#D4D4D8" }; // Neutral Charcoal Gray
}

function worst(row: number[], side: number): number {
  const sum = row.reduce((a, b) => a + b, 0);
  const mx = Math.max(...row);
  const mn = Math.min(...row);
  if (mn === 0 || sum === 0 || side === 0) return Infinity;
  return Math.max((side * side * mx) / (sum * sum), (sum * sum) / (side * side * mn));
}

// Standard Squarified Treemap (Bruls, Huizing, van Wijk)
// Always cuts along the shorter side to prevent razor-thin slithers!
function getRects(
  values: number[],
  x: number,
  y: number,
  w: number,
  h: number
): { x: number; y: number; w: number; h: number }[] {
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
      if (cur <= bestW) {
        bestW = cur;
        bestN = n;
      } else break;
    }
    const row = rem.slice(0, bestN);
    const sum = row.reduce((a, b) => a + b, 0);

    // If cw >= ch (wide area), shorter side is ch -> cut vertical column of width = sum / ch
    if (cw >= ch) {
      const rw = sum / ch;
      let curY = cy;
      for (const a of row) {
        const rh = a / rw;
        out.push({ x: cx, y: curY, w: rw, h: rh });
        curY += rh;
      }
      cx += rw;
      cw -= rw;
    } else {
      // If ch > cw (tall area), shorter side is cw -> cut horizontal row of height = sum / cw
      const rh = sum / cw;
      let curX = cx;
      for (const a of row) {
        const rw = a / rh;
        out.push({ x: curX, y: cy, w: rw, h: rh });
        curX += rw;
      }
      cy += rh;
      ch -= rh;
    }
    rem = rem.slice(bestN);
    if (cw <= 0.01 || ch <= 0.01) break;
  }
  return out;
}

export default function Heatmap100({ items }: { items: HeatItem[] }) {
  const filtered = items.filter((x) => x.ticker && x.ticker !== "-" && x.ticker !== "—");
  const sorted = [...filtered].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));

  // Compute actual factual universe median for accurate green/red bifurcation
  const medianScore = useMemo(() => {
    if (!sorted.length) return 68.4;
    const scores = sorted.map((x) => x.mispricingScore).sort((a, b) => a - b);
    return scores[Math.floor(scores.length / 2)] ?? 68.4;
  }, [sorted]);

  const { bySector, sectorRects } = useMemo(() => {
    const groups = ["FINANCE", "ENERGY", "CONSUMER", "INFRA", "OTHER"]
      .map((sec) => ({ sec, list: sorted.filter((x) => x.sector === sec) }))
      .filter((g) => g.list.length > 0);

    const bs = groups.map((g) => ({
      ...g,
      totalW: g.list.reduce((s, x) => s + itemWeight(x), 0),
    }));

    // Partition sector areas using 1000x500 normalized canvas
    const sectorWeights = bs.map((g) => g.totalW);
    const sRects = getRects(sectorWeights, 0, 0, 1000, 500);
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
      {/* Titlebar with Finviz-Style Green/Red Scale Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2638] bg-[#0A0D15] px-3 py-2.5">
        <div className="flex items-center gap-2 font-mono">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            MARKET MAP MAP&lt;GO&gt;
          </span>
          <span className="text-zinc-600">│</span>
          <span className="text-[11px] text-zinc-300">
            {filtered.length} IDX EMITEN · SECTOR WEIGHTED SQUARIFY
          </span>
        </div>

        {/* Real Green & Red Legend Bar */}
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="text-zinc-400 uppercase hidden sm:inline">SKOR VS MEDIAN ({medianScore.toFixed(1)}):</span>
          <div className="flex items-center rounded-[2px] overflow-hidden border border-[#1E2638]">
            <span className="px-1.5 py-0.5 text-[9px] font-bold text-white bg-[#F23645]">&lt; -5</span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold text-white bg-[#DC2626]">-3</span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold text-white bg-[#991B1B]">-1</span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold text-zinc-300 bg-[#27272A]">0</span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold text-white bg-[#166534]">+1</span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold text-white bg-[#089981]">+3</span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold text-white bg-[#00B060]">&gt; +5</span>
          </div>
          <span className="text-emerald-400 font-bold hidden md:inline">HIJAU = UNDERVALUED</span>
          <span className="text-zinc-600 hidden md:inline">│</span>
          <span className="text-red-400 font-bold hidden md:inline">MERAH = OVERVALUED</span>
        </div>
      </div>

      {/* Main Treemap Canvas (Responsive Height, Finviz Mosaic) */}
      <div className="relative w-full bg-[#07090E] h-[520px] sm:h-[580px] md:h-[620px] lg:h-[660px]">
        {bySector.map(({ sec, list }, si) => {
          const sr = sectorRects[si];
          if (!sr) return null;

          // Convert normalized coordinates (1000x500) to percentage
          const secLeft = (sr.x / 1000) * 100;
          const secTop = (sr.y / 500) * 100;
          const secW = (sr.w / 1000) * 100;
          const secH = (sr.h / 500) * 100;

          // Compute intra-sector squarified tiles using the sector's exact aspect ratio!
          const vals = list.map((x) => itemWeight(x));
          const rects = getRects(vals, 0, 0, sr.w, Math.max(10, sr.h - 22));
          const avg = list.reduce((s, x) => s + x.mispricingScore, 0) / list.length;

          return (
            <div
              key={sec}
              className="absolute overflow-hidden border border-[#07090E] bg-[#0A0D15]"
              style={{
                left: `${secLeft}%`,
                top: `${secTop}%`,
                width: `${secW}%`,
                height: `${secH}%`,
              }}
            >
              {/* Finviz Sector Header Strip */}
              <div className="flex h-[20px] items-center justify-between border-b border-[#07090E] bg-[#0D111A] px-2 text-[9px] font-mono leading-none">
                <span className="font-bold text-zinc-300 uppercase tracking-wide truncate">
                  {sec} <span className="text-zinc-500 font-normal">({list.length})</span>
                </span>
                <span className="text-zinc-400 shrink-0">AVG {avg.toFixed(1)}</span>
              </div>

              {/* Tickers Intra-Sector Grid */}
              <div className="absolute inset-x-0 bottom-0 top-[20px]">
                {list.map((t, i) => {
                  const r = rects[i];
                  if (!r) return null;
                  const prof = profileOf(t.ticker);
                  const color = getFinvizColor(t.mispricingScore, medianScore);
                  const delta = t.mispricingScore - medianScore;
                  const deltaStr = delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1);

                  // Convert intra-sector rect to percentage inside the sector content container
                  const tileLeft = (r.x / sr.w) * 100;
                  const tileTop = (r.y / Math.max(10, sr.h - 22)) * 100;
                  const tileW = (r.w / sr.w) * 100;
                  const tileH = (r.h / Math.max(10, sr.h - 22)) * 100;

                  // Adaptive content thresholds based on pixel size
                  const isLarge = r.w >= 70 && r.h >= 55;
                  const isMedium = r.w >= 45 && r.h >= 35;
                  const isSmall = r.w >= 28 && r.h >= 20;

                  const title = `${t.ticker} — ${prof?.name ?? t.ticker} | Sektor: ${sec} | Close: ${
                    t.close ? "Rp " + t.close.toLocaleString("id-ID") : "-"
                  } | Mispricing: ${t.mispricingScore.toFixed(1)} (${deltaStr} vs median) | Rank: #${
                    t.rank ?? i + 1
                  } | idx.co.id ↗`;

                  return (
                    <Link
                      key={t.ticker}
                      href={`/dossier/${t.ticker}?market=id`}
                      title={title}
                      aria-label={`${t.ticker}: Skor ${t.mispricingScore.toFixed(1)}, Sektor ${sec}`}
                      className="absolute flex flex-col items-center justify-center overflow-hidden border border-[#07090E] p-0.5 text-center transition-all hover:z-20 hover:scale-[1.02] hover:border-white hover:shadow-2xl"
                      style={{
                        left: `${tileLeft}%`,
                        top: `${tileTop}%`,
                        width: `${tileW}%`,
                        height: `${tileH}%`,
                        background: color.bg,
                      }}
                    >
                      <span className="sr-only">{t.ticker}</span>
                      {isLarge ? (
                        <>
                          <span className="font-mono text-xs md:text-sm font-black text-white drop-shadow leading-tight">
                            {t.ticker}
                          </span>
                          <span className="font-mono text-[10px] md:text-[11px] font-bold text-white/95 leading-none mt-0.5">
                            {t.mispricingScore.toFixed(1)}
                          </span>
                          <span className="font-mono text-[8px] text-white/80 leading-none mt-0.5">
                            {deltaStr}
                          </span>
                          {t.close ? (
                            <span className="font-mono text-[8px] text-white/70 leading-none mt-0.5 hidden xl:block">
                              Rp {t.close.toLocaleString("id-ID")}
                            </span>
                          ) : null}
                        </>
                      ) : isMedium ? (
                        <>
                          <span className="font-mono text-[10px] md:text-[11px] font-black text-white leading-tight">
                            {t.ticker}
                          </span>
                          <span className="font-mono text-[8px] md:text-[9px] font-bold text-white/95 leading-none">
                            {t.mispricingScore.toFixed(1)}
                          </span>
                        </>
                      ) : isSmall ? (
                        <span className="font-mono text-[9px] font-black text-white leading-none">
                          {t.ticker}
                        </span>
                      ) : (
                        <span className="font-mono text-[7px] font-bold text-white/90 leading-none">
                          {t.ticker.slice(0, 3)}
                        </span>
                      )}
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
        <span>STATUS: PROPORTIONAL SQUARIFIED MARKET MAP · 100% HIJAU &amp; MERAH</span>
        <span className="text-zinc-500">Bukan rekomendasi investasi · Data riil Sectors API</span>
      </div>
    </div>
  );
}
