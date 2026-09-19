import Link from "next/link";
import { fetchRanking, fetchBacktest, fetchAnomalies } from "@/lib/api";
import Heatmap100 from "@/components/Heatmap100";
import RankingTable from "@/components/RankingTable";
import MetricsTable, { type Metrics } from "@/components/MetricsTable";
import TopLeaks from "@/components/TopLeaks";

const SECTORS = ["FINANCE", "ENERGY", "CONSUMER", "INFRA", "OTHER"] as const;

export default async function Page() {
  let items: { ticker: string; mispricingScore: number; anomalyFlag?: boolean; anomalyZ?: number; sector?: string; market?: string; rank?: number; close?: number; components?: { expected_return: number; anomaly_z: number; quality_value: number; sector_mom: number }; anomaly?: { z?: number; flag?: boolean } }[] = [];
  let leaks: { ticker: string; mispricingScore: number; anomalyZ?: number; rank?: number; sector?: string }[] = [];
  let metrics: Metrics = {};
  let universe = 100;
  let asOf = "";
  let degraded: boolean | undefined;
  let error: string | null = null;
  try {
    const [r, b, a] = await Promise.all([
      fetchRanking({ market: "id", pageSize: 100 }),
      fetchBacktest("id"),
      fetchAnomalies({ market: "id", minZ: 2.0, pageSize: 5 }),
    ]);
    items = ((r.data as { items: typeof items }).items ?? []) as typeof items;
    const bd = b.data as { items?: unknown[]; metrics?: Metrics; universe?: number; as_of?: string; degraded?: boolean };
    metrics = (bd.metrics ?? {}) as Metrics;
    universe = bd.universe ?? 100;
    asOf = bd.as_of ?? "";
    degraded = bd.degraded;
    leaks = ((a.data as { items: typeof leaks }).items ?? []) as typeof leaks;
  } catch (e: unknown) { error = e instanceof Error ? e.message : String(e); }
  const flagged = items.filter((x) => x.anomalyFlag ?? x.anomaly?.flag).length;
  const avg = items.length ? (items.reduce((s, x) => s + x.mispricingScore, 0) / items.length).toFixed(1) : "-";
  const top10 = [...items].sort((x, y) => y.mispricingScore - x.mispricingScore).slice(0, 10) as never[];
  const sectorAvg = (s: string) => {
    const sect = items.filter((x) => x.sector === s);
    return sect.length ? (sect.reduce((a, x) => a + x.mispricingScore, 0) / sect.length) : 0;
  };
  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-[11px] tracking-wide text-zinc-500">
        <span className="font-mono font-semibold text-zinc-300">IDX</span><span className="text-zinc-700">›</span><span>Sectors 100</span><span className="text-zinc-700">›</span><span className="text-zinc-400">Market Intelligence</span><span className="ml-2 hidden rounded-full border border-zinc-800 bg-[#11151F] px-2 py-0.5 font-mono text-[10px] md:inline">as_of {asOf || "live"} · {degraded ? "degraded" : "live"}</span>
      </nav>

      {error ? (
        <div role="alert" className="flex flex-col gap-2 rounded-[14px] border border-red-900/60 bg-red-950/40 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-red-200">API offline — data tidak dapat dimuat</div>
              <div className="mt-0.5 font-mono text-[11px] leading-relaxed text-red-300/80 break-all">ranking · backtest · anomalies dari http://127.0.0.1:8181 — {error}</div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 md:pl-4">
            <span className="hidden font-mono text-[10px] text-red-300/60 md:inline">./scripts/fast-boot.ps1</span>
            <a href="/" className="rounded-full border border-red-800/60 bg-red-900/30 px-3 py-1 text-xs font-medium text-red-200 hover:bg-red-900/60 transition-colors">Retry ↻</a>
          </div>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[16px] border border-[#24242e] bg-gradient-to-br from-[#11151F] via-[#11151F] to-[#0f1320] p-5 md:p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300"><span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" /> Market Intelligence · IDX · Sectors 100</div>
            <h1 className="mt-3 font-mono text-[28px] font-extrabold leading-none tracking-[-0.03em] md:text-[34px]">SEITH<span className="ml-2 align-super text-[11px] font-semibold tracking-[0.16em] text-zinc-500">BLOOMBERG GRADE</span></h1>
            <p className="mt-2 max-w-[60ch] text-balance text-sm leading-6 text-zinc-400">Mispricing <span className="font-mono font-semibold text-zinc-200">0–100</span> · Anomaly Rank · Dossier 1-page. <span className="text-zinc-300">60s ranking → deep dive → export PDF.</span> Warna = skor, bukan harga. TradingView sector flow + Artificial Analysis density. <span className="text-zinc-300">100 profil emiten idx.co.id ↗ — hover/klik treemap → dossier.</span></p>
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="flex gap-2">
                <Link href="/ranking" className="rounded-full bg-amber-400 px-5 py-2 text-sm font-bold text-zinc-900 hover:bg-amber-300 active:scale-[0.98] transition-all shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_8px_20px_-12px_rgba(251,191,36,0.6)]">Lihat Ranking →</Link>
                <Link href="/backtest" className="rounded-full border border-zinc-700 bg-zinc-900/50 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors">Backtest 100</Link>
                <Link href="/dossier/BBCA?market=id" className="hidden rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900 md:inline-flex">Dossier BBCA</Link>
              </div>
            </div>
          </div>
          <div className="grid w-full grid-cols-2 gap-2 lg:w-[420px] lg:grid-cols-2">
            <div className="kpi"><div className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">Universe</div><div className="mt-1 font-mono text-2xl font-bold leading-none">{universe}</div><div className="mt-1 text-xs text-zinc-500 truncate">{asOf || "live 2026-09-13"} · 296 credits</div></div>
            <div className="kpi"><div className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">Avg score</div><div className="mt-1 font-mono text-2xl font-bold leading-none">{avg}</div><div className="mt-1 text-xs text-zinc-500">0→100 · 30/20/30/20</div></div>
            <div className="kpi"><div className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">Flagged |Z|&gt;2</div><div className="mt-1 font-mono text-2xl font-bold leading-none text-red-400">{flagged}</div><div className="mt-1 text-xs text-zinc-500">anomaly · vol &gt;2σ</div></div>
            <div className="kpi"><div className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">Pipeline</div><div className="mt-1 font-mono text-xs font-semibold leading-tight">Sectors → Kronos 400→20</div><div className="mt-1 text-xs text-zinc-500">live 100 · Top-10 nemutron</div></div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5 border-t border-zinc-800/60 pt-4">
          {SECTORS.map((s) => {
            const a = sectorAvg(s);
            const pct = Math.max(8, Math.round(a));
            return (
              <Link key={s} href={`/ranking?market=id&sector=${s}`} className="group flex items-center gap-2 rounded-full border border-zinc-800 bg-[#0B0E14] px-3 py-1.5 hover:border-zinc-700 hover:bg-[#151a2a] transition-colors">
                <span className="text-xs font-semibold tracking-wide text-zinc-300 group-hover:text-white">{s}</span>
                <span className="hidden h-3 w-px bg-zinc-800 md:block" />
                <span className="font-mono text-xs text-zinc-400">{a.toFixed(1)}</span>
                <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-zinc-800 md:block"><span className="block h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} /></span>
              </Link>
            );
          })}
          <Link href="/ranking?market=id" className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-white transition-colors">All 100 →</Link>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><Heatmap100 items={items as never} /></div>
        <div className="space-y-4">
          <TopLeaks items={leaks} />
          <MetricsTable m={metrics} />
        </div>
      </div>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#24242e] bg-[#0f1320]/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-200">Top 10 mispricing — preview</span>
            <span className="hidden rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-300 md:inline">AA leaderboard</span>
          </div>
          <Link href="/ranking" className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-colors">full ranking →</Link>
        </div>
        <RankingTable items={top10} />
      </section>

      <p className="text-xs leading-relaxed text-zinc-500">Bukan rekomendasi investasi — informasi &amp; analisis saja · disclaimer tiap view · Sectors CORE · Kronos 400→20 · 30/20/30/20 · Top-10 nemutron</p>
    </div>
  );
}
