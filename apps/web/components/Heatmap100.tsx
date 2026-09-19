"use client";
import { profileOf } from "@/data/companyProfiles";
export type HeatItem = { ticker: string; mispricingScore: number; sector?: string; rank?: number; close?: number; marketCapHint?: number };
const SECTOR_COLOR: Record<string, string> = { FINANCE: "#0ea5e9", ENERGY: "#f59e0b", CONSUMER: "#a78bfa", INFRA: "#14b8a6", OTHER: "#f43f5e" };
function sectorBg(sector?: string) { return SECTOR_COLOR[sector ?? "OTHER"] ?? "#71717a"; }
function gradient(score: number) {
  const v = Math.max(0, Math.min(100, score));
  const t = v / 100;
  if (t < 0.5) {
    const k = t / 0.5;
    const r = Math.round(185 + (100 - 185) * k);
    const g = Math.round(28 + (116 - 28) * k);
    const b = Math.round(28 + (116 - 28) * k);
    const r2 = Math.round(39 + (100 - 39) * k);
    const g2 = Math.round(39 + (116 - 39) * k);
    const b2 = Math.round(42 + (116 - 42) * k);
    const mix = (a: number, b: number) => Math.round(a + (b - a) * 0.45);
    return `rgb(${mix(r, r2)},${mix(g, g2)},${mix(b, b2)})`;
  }
  const k = (t - 0.5) / 0.5;
  const r = Math.round(100 + (22 - 100) * k);
  const g = Math.round(116 + (163 - 116) * k);
  const b = Math.round(116 + (74 - 116) * k);
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
  let cx = x, cy = y, cw = w, ch = h;
  let rem = [...areas];
  while (rem.length) {
    const side = Math.min(cw, ch);
    let bestN = 1;
    let bestW = worst(rem.slice(0, 1), side);
    for (let n = 2; n <= rem.length; n++) {
      const cur = worst(rem.slice(0, n), side);
      if (cur < bestW) { bestW = cur; bestN = n; } else break;
    }
    const row = rem.slice(0, bestN);
    const sum = row.reduce((a, b) => a + b, 0);
    if (cw >= ch) {
      const rh = sum / cw;
      let curX = cx;
      for (const a of row) { const rw = a / rh; out.push({ x: curX, y: cy, w: rw, h: rh }); curX += rw; }
      cy += rh; ch -= rh;
    } else {
      const rw = sum / ch;
      let curY = cy;
      for (const a of row) { const rh = a / rw; out.push({ x: cx, y: curY, w: rw, h: rh }); curY += rh; }
      cx += rw; cw -= rw;
    }
    rem = rem.slice(bestN);
    if (cw <= 0.5 || ch <= 0.5) break;
  }
  return out;
}
export default function Heatmap100({ items }: { items: HeatItem[] }) {
  const filtered = items.filter((x) => x.ticker && x.ticker !== "-" && x.ticker !== "—");
  const sorted = [...filtered].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
  if (!sorted.length) return <div className="rounded-xl border border-[#24242e] bg-[#11151F] p-8 text-center text-sm text-zinc-500">No data — /api/v1/ranking</div>;
  const weight = (x: HeatItem) => {
    if (x.marketCapHint && x.marketCapHint > 0) return x.marketCapHint;
    return Math.max(1, Math.abs(x.mispricingScore - 50) * 2 + 6);
  };
  const groups = ["FINANCE", "ENERGY", "CONSUMER", "INFRA", "OTHER"].map((sec) => ({ sec, list: sorted.filter((x) => x.sector === sec) })).filter((g) => g.list.length > 0);
  const bySector = groups.map((g) => ({ ...g, totalW: g.list.reduce((s, x) => s + weight(x), 0) }));
  const sectorWeights = bySector.map((g) => g.totalW);
  const sectorRects = getRects(sectorWeights, 0, 0, 100, 100);
  return (
    <div className="overflow-hidden rounded-xl border border-[#24242e] bg-[#11151F] shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#24242e]/60 bg-[#0f1320]/40 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-100">Stock Heatmap</span>
          <span className="hidden rounded-full border border-zinc-800 bg-[#0B0E14] px-2 py-0.5 text-[10px] font-medium text-zinc-400 md:inline">Treemap by sector · {filtered.length} · sektor ∝ count · merah→abu→hijau</span>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] text-zinc-400">
          <span className="h-2 w-3 rounded-sm" style={{ background: gradient(15) }} />20
          <span className="h-2 w-3 rounded-sm" style={{ background: gradient(40) }} />40
          <span className="h-2 w-3 rounded-sm" style={{ background: gradient(60) }} />60
          <span className="h-2 w-3 rounded-sm" style={{ background: gradient(85) }} />85
          <span className="ml-2 hidden text-zinc-500 md:inline">· tap cell → dossier · avatar 2 huruf</span>
        </span>
      </div>
      <div className="relative w-full bg-[#0B0E14]" style={{ height: 640 }}>
        {bySector.map(({ sec, list }, si) => {
          const sr = sectorRects[si];
          if (!sr) return null;
          const vals = list.map((x) => weight(x));
          const rects = getRects(vals, 0, 0, 100, 100);
          const avg = list.reduce((s, x) => s + x.mispricingScore, 0) / list.length;
          return (
            <div key={sec} className="absolute overflow-hidden border border-[#24242e]/70 bg-[#0B0E14]" style={{ left: `${sr.x}%`, top: `${sr.y}%`, width: `${sr.w}%`, height: `${sr.h}%` }}>
              <div className="flex items-center justify-between border-b border-[#24242e]/60 bg-[#1A1F2E]/80 px-2 py-1.5">
                <span className="text-[11px] font-bold tracking-wide text-zinc-100">{sec}<span className="ml-1 font-normal text-zinc-500">›</span></span>
                <span className="font-mono text-[10px] text-zinc-500">{list.length} · {avg.toFixed(1)}</span>
              </div>
              <div className="absolute inset-x-0 bottom-0 top-[28px]">
                {list.map((t, i) => {
                  const r = rects[i];
                  if (!r) return null;
                  const prof = profileOf(t.ticker);
                  const bg = gradient(t.mispricingScore);
                  const showAvatar = r.w > 14 && r.h > 28;
                  const showScore = r.w > 12 && r.h > 22;
                  const showTicker = r.w > 9 && r.h > 14;
                  const initials = t.ticker.slice(0, 2).toUpperCase();
                  const avatarBg = sectorBg(sec);
                  const title = `${t.ticker} — ${prof?.name ?? t.ticker} — ${prof?.desc ?? sec} — skor ${t.mispricingScore.toFixed(1)} — rank ${t.rank ?? i + 1} — ${prof?.idxUrl ?? ""} — klik → dossier`;
                  return (
                    <a key={t.ticker} href={`/dossier/${t.ticker}?market=id`} title={title} className="absolute flex flex-col items-center justify-center overflow-hidden rounded-[5px] border border-black/20 p-1 text-center transition-all hover:z-10 hover:scale-[1.015] hover:border-white/20 hover:shadow-[0_6px_20px_rgba(0,0,0,0.5)]" style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.w}%`, height: `${r.h}%`, background: bg }}>
                      {showAvatar ? <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold leading-none text-white shadow-sm md:h-7 md:w-7 md:text-[11px]" style={{ background: avatarBg }}>{initials}</span> : null}
                      {showTicker ? <span className="mt-1 font-mono text-[10px] font-extrabold leading-none tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] md:text-xs">{t.ticker}</span> : null}
                      {showScore ? <span className="font-mono text-[9px] font-semibold leading-none text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] md:text-[10px]">{t.mispricingScore.toFixed(1)}</span> : null}
                    </a>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#24242e]/60 bg-[#0B0E14]/50 px-3 py-2 text-[11px] text-zinc-500">
        <span>Bukan rekomendasi investasi — warna = mispricingScore 0→100 (merah pekat rendah → abu 50 → hijau pekat tinggi) · area sektor ∝ jumlah emiten · tap cell → dossier · idx.co.id ↗</span>
        <span className="font-mono text-zinc-600">{filtered.length} live · global weighted treemap · FINANCE {bySector.find((g) => g.sec === "FINANCE")?.list.length ?? 0} &gt; OTHER {bySector.find((g) => g.sec === "OTHER")?.list.length ?? 0}</span>
      </div>
    </div>
  );
}
