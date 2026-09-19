import Link from "next/link";
import { fetchRanking, fetchBacktest, fetchAnomalies } from "@/lib/api";
import Heatmap100 from "@/components/Heatmap100";
import RankingTable from "@/components/RankingTable";
import MetricsTable, { type Metrics } from "@/components/MetricsTable";
import TopLeaks from "@/components/TopLeaks";

const SECTORS = ["FINANCE", "ENERGY", "CONSUMER", "INFRA", "OTHER"] as const;

export default async function Page() {
  let items: {
    ticker: string;
    mispricingScore: number;
    anomalyFlag?: boolean;
    anomalyZ?: number;
    sector?: string;
    market?: string;
    rank?: number;
    close?: number;
    components?: {
      expected_return: number;
      anomaly_z: number;
      quality_value: number;
      sector_mom: number;
    };
    anomaly?: { z?: number; flag?: boolean };
  }[] = [];
  let leaks: {
    ticker: string;
    mispricingScore: number;
    anomalyZ?: number;
    rank?: number;
    sector?: string;
    close?: number;
  }[] = [];
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
    const bd = b.data as {
      items?: unknown[];
      metrics?: Metrics;
      universe?: number;
      as_of?: string;
      degraded?: boolean;
    };
    metrics = (bd.metrics ?? {}) as Metrics;
    universe = bd.universe ?? 100;
    asOf = bd.as_of ?? "";
    degraded = bd.degraded;
    leaks = ((a.data as { items: typeof leaks }).items ?? []) as typeof leaks;
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : String(e);
  }

  const flagged = items.filter((x) => x.anomalyFlag ?? x.anomaly?.flag).length;
  const avg = items.length
    ? (items.reduce((s, x) => s + x.mispricingScore, 0) / items.length).toFixed(1)
    : "-";
  const top10 = [...items]
    .sort((x, y) => y.mispricingScore - x.mispricingScore)
    .slice(0, 10) as never[];

  const sectorAvg = (s: string) => {
    const sect = items.filter((x) => x.sector === s);
    return sect.length ? sect.reduce((a, x) => a + x.mispricingScore, 0) / sect.length : 0;
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb / Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2638] pb-2 font-mono text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-amber-400">SEITH // TERMINAL</span>
          <span className="text-zinc-600">&gt;</span>
          <span className="text-zinc-200">MARKET INTELLIGENCE</span>
          <span className="text-zinc-600">&gt;</span>
          <span className="text-zinc-400">IDX OVERVIEW</span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span>AS OF: {asOf || "2026-09-13"}</span>
          <span className="text-zinc-700">│</span>
          <span className={degraded ? "text-amber-400" : "text-emerald-400"}>
            STATUS: {degraded ? "DEGRADED (FALLBACK)" : "LIVE"}
          </span>
          <span className="text-zinc-700">│</span>
          <span>MARKET: IDX (ID)</span>
        </div>
      </div>

      {/* Offline Alert */}
      {error ? (
        <div
          role="alert"
          className="flex flex-col gap-2 rounded-[4px] border border-red-800/80 bg-red-950/40 p-3 font-mono md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-start gap-2.5">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping mt-1" />
            <div>
              <div className="text-xs font-bold text-red-200">API UPSTREAM OFFLINE</div>
              <div className="text-[11px] text-red-300/80">
                Data gagal dimuat dari http://127.0.0.1:8181 — {error}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-zinc-400">./scripts/fast-boot.ps1</span>
            <a
              href="/"
              className="rounded-[3px] border border-red-700 bg-red-900/60 px-3 py-1 text-xs font-bold text-white hover:bg-red-800"
            >
              RETRY ↻
            </a>
          </div>
        </div>
      ) : null}

      {/* Bloomberg Telemetry Deck */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="terminal-kpi">
          <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            UNIVERSE COVERAGE
          </div>
          <div className="mt-1 font-mono text-2xl font-black tracking-tight text-zinc-100">
            {universe}
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-zinc-400">
            5 Sektor · 296 Credits Sectors
          </div>
        </div>

        <div className="terminal-kpi">
          <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            MEAN MISPRICING
          </div>
          <div className="mt-1 font-mono text-2xl font-black tracking-tight text-amber-400">
            {avg}
            <span className="text-xs text-zinc-500 ml-1 font-normal">/ 100</span>
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-zinc-400">
            30ER · 20|Z| · 30QV · 20SM
          </div>
        </div>

        <div className="terminal-kpi">
          <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            ANOMALY ALERTS
          </div>
          <div className="mt-1 font-mono text-2xl font-black tracking-tight text-red-400">
            {flagged}
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-zinc-400">
            |Z| &gt; 2.0 / Volume Spike
          </div>
        </div>

        <div className="terminal-kpi">
          <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            PIPELINE STATUS
          </div>
          <div className="mt-1 font-mono text-sm font-black tracking-tight text-emerald-400 truncate">
            SECTORS → KRONOS
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-zinc-400 truncate">
            Top-10 Nemotron Memo
          </div>
        </div>
      </div>

      {/* Sector Quick Switcher */}
      <div className="terminal-card flex flex-wrap items-center gap-1.5 p-2 font-mono text-xs">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500 px-1 font-bold">
          SECTOR:
        </span>
        <Link
          href="/ranking?market=id"
          className="rounded-[3px] border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-amber-300 font-bold hover:bg-amber-400/20"
        >
          ALL (100)
        </Link>
        {SECTORS.map((s) => {
          const a = sectorAvg(s);
          return (
            <Link
              key={s}
              href={`/ranking?market=id&sector=${s}`}
              className="flex items-center gap-1.5 rounded-[3px] border border-[#1E2638] bg-[#07090E] px-2 py-1 text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
            >
              <span>{s}</span>
              <span className="text-zinc-500">·</span>
              <span className="text-amber-400 font-semibold">{a.toFixed(1)}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Grid: Treemap + Sidebars */}
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Heatmap100 items={items as never} />
        </div>
        <div className="space-y-3">
          <TopLeaks items={leaks} />
          <MetricsTable m={metrics} />
        </div>
      </div>

      {/* Top 10 Preview Data Grid */}
      <section className="terminal-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#1E2638] bg-[#0A0D15] px-3 py-2 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              TOP 10 MISPRICING LEADERBOARD
            </span>
            <span className="rounded-[2px] border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
              PREVIEW
            </span>
          </div>
          <Link
            href="/ranking?market=id"
            className="rounded-[3px] border border-[#1E2638] bg-[#131824] px-2.5 py-0.5 text-xs text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
          >
            LIHAT SEMUA 100 →
          </Link>
        </div>
        <RankingTable items={top10} />
      </section>

      {/* Disclaimer */}
      <div className="font-mono text-[10px] text-zinc-500 leading-relaxed border-t border-[#1E2638] pt-2">
        Bukan rekomendasi investasi — Informasi &amp; analisis saja · Sectors CORE · Kronos 400→20 · 30ER/20|Z|/30QV/20SM · Top-10 Nemutron · Data resmi emiten idx.co.id ↗
      </div>
    </div>
  );
}
