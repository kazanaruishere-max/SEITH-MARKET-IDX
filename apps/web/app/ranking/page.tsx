import Link from "next/link";
import { fetchRanking } from "@/lib/api";
import RankingTable from "@/components/RankingTable";
import Heatmap100 from "@/components/Heatmap100";
import StackedTop20 from "@/components/StackedTop20";
import ScatterERvsZ from "@/components/ScatterERvsZ";

const SECTORS = ["FINANCE", "ENERGY", "CONSUMER", "INFRA", "OTHER"];

type Item = {
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
};

export default async function RankingPage({
  searchParams,
}: {
  searchParams: {
    market?: string;
    sector?: string;
    sort?: string;
    order?: string;
    page?: string;
    pageSize?: string;
  };
}) {
  const market = searchParams.market ?? "id";
  const sector = searchParams.sector;
  const sort = searchParams.sort ?? "mispricing";
  const order = searchParams.order ?? "desc";
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const pageSize = searchParams.pageSize ? parseInt(searchParams.pageSize, 10) : 50;

  let items: Item[] = [];
  let pagination = { page, pageSize, total: 0 };
  let error: string | null = null;
  let allForCharts: Item[] = [];

  try {
    const r = await fetchRanking({ market, sector, sort, order, page, pageSize });
    items = ((r.data as { items: Item[] }).items ?? []) as Item[];
    if (r.pagination) pagination = r.pagination;
    const rc = await fetchRanking({ market, pageSize: 100 });
    allForCharts = ((rc.data as { items: Item[] }).items ?? []) as Item[];
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : String(e);
  }

  const link = (s: string) =>
    `/ranking?market=${market}${sector ? `&sector=${sector}` : ""}&sort=${s}&order=${order}&page=${page}&pageSize=${pageSize}`;
  const pageHref = (p: number) =>
    `/ranking?market=${market}${sector ? `&sector=${sector}` : ""}&sort=${sort}&order=${order}&page=${p}&pageSize=${pageSize}`;

  const scatterItems = allForCharts
    .filter((it) => it.components?.expected_return !== undefined && it.close !== undefined)
    .map((it) => ({
      ticker: it.ticker,
      er: it.components!.expected_return,
      z: it.anomaly?.z ?? it.anomalyZ ?? 0,
      close: it.close!,
      flag: it.anomaly?.flag ?? it.anomalyFlag ?? false,
    }));

  const stackItems = allForCharts
    .filter((x) => x.components)
    .slice(0, 20)
    .map((x) => ({
      ticker: x.ticker,
      mispricingScore: x.mispricingScore,
      components: x.components!,
    }));

  return (
    <div className="space-y-4">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2638] pb-2 font-mono text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            SEITH // TERMINAL
          </Link>
          <span className="text-zinc-600">&gt;</span>
          <span className="font-bold text-amber-400">SCREENER</span>
          <span className="text-zinc-600">&gt;</span>
          <span className="text-zinc-200">
            {market.toUpperCase()} {sector ? `// ${sector}` : "// ALL SECTORS"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="rounded-[2px] border border-[#1E2638] bg-[#0A0D15] px-1.5 py-0.5">
            SORT: {sort.toUpperCase()} ({order.toUpperCase()})
          </span>
          <span className="rounded-[2px] border border-[#1E2638] bg-[#0A0D15] px-1.5 py-0.5">
            PAGE {pagination.page} / {Math.ceil((pagination.total || 100) / pagination.pageSize)}
          </span>
        </div>
      </div>

      {/* Screener Toolbar Card */}
      <section className="terminal-card p-3 md:p-4 font-mono">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
              MULTI-FACTOR SCREENER // RANKING 0→100
            </div>
            <p className="mt-1 text-[11px] text-zinc-400 max-w-2xl leading-relaxed">
              Kombinasi kuantitatif <span className="text-zinc-200">30% ER · 20% |Z| · 30% QV · 20% SM</span>.
              Warna gradien merefleksikan deviasi mispricing, bukan sekadar pergerakan harga.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-[2px] border border-[#1E2638] bg-[#07090E] px-2 py-1 text-[10px] text-zinc-400">
              {pagination.total} TOTAL EMITEN
            </span>
          </div>
        </div>

        {/* Filters & Sorting */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-[#1E2638] pt-3 text-xs">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 mr-1 font-bold">
            SEKTOR:
          </span>
          <Link
            href={`/ranking?market=${market}&sort=${sort}&order=${order}&pageSize=${pageSize}`}
            className={`rounded-[3px] border px-2.5 py-1 text-xs font-bold transition-all ${
              !sector
                ? "border-amber-400/60 bg-amber-400/10 text-amber-300"
                : "border-[#1E2638] bg-[#07090E] text-zinc-400 hover:border-zinc-500 hover:text-white"
            }`}
          >
            ALL
          </Link>
          {SECTORS.map((s) => (
            <Link
              key={s}
              href={`/ranking?market=${market}&sector=${s}&sort=${sort}&order=${order}&pageSize=${pageSize}`}
              className={`rounded-[3px] border px-2.5 py-1 text-xs font-bold transition-all ${
                sector === s
                  ? "border-amber-400/60 bg-amber-400/10 text-amber-300"
                  : "border-[#1E2638] bg-[#07090E] text-zinc-400 hover:border-zinc-500 hover:text-white"
              }`}
            >
              {s}
            </Link>
          ))}

          <span className="mx-1 hidden h-4 w-px bg-[#1E2638] md:block" />

          <span className="text-[10px] uppercase tracking-wider text-zinc-500 mr-1 font-bold">
            SORT:
          </span>
          <Link
            href={link("mispricing")}
            className={`rounded-[3px] border px-2.5 py-1 text-xs font-bold transition-all ${
              sort === "mispricing"
                ? "border-zinc-200 bg-zinc-200 text-zinc-950"
                : "border-[#1E2638] bg-[#07090E] text-zinc-400 hover:border-zinc-500 hover:text-white"
            }`}
          >
            MISPRICING
          </Link>
          <Link
            href={link("anomaly")}
            className={`rounded-[3px] border px-2.5 py-1 text-xs font-bold transition-all ${
              sort === "anomaly"
                ? "border-zinc-200 bg-zinc-200 text-zinc-950"
                : "border-[#1E2638] bg-[#07090E] text-zinc-400 hover:border-zinc-500 hover:text-white"
            }`}
          >
            ANOMALY |Z|
          </Link>
        </div>
      </section>

      {error ? (
        <div className="rounded-[4px] border border-red-800/80 bg-red-950/40 p-3 font-mono text-xs text-red-300">
          Gagal mengambil data ranking: {error}
        </div>
      ) : null}

      {/* Stock Treemap Overview */}
      <Heatmap100 items={allForCharts} />

      {/* Dual Factor Visual Panels */}
      <div className="grid gap-3 lg:grid-cols-2">
        <StackedTop20 items={stackItems} />
        <ScatterERvsZ items={scatterItems} />
      </div>

      {/* Screener Data Grid Table */}
      <section className="terminal-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#1E2638] bg-[#0A0D15] px-3 py-2 font-mono">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
            EMITEN SCREENER DATA GRID
          </span>
          <span className="text-[10px] text-zinc-500">
            KLIK ROW / TIKER UNTUK BUKA DOSSIER LENGKAP
          </span>
        </div>
        <RankingTable items={items as never} pagination={pagination} pageHref={pageHref} />
      </section>

      {/* Disclaimer */}
      <div className="font-mono text-[10px] text-zinc-500 leading-relaxed border-t border-[#1E2638] pt-2">
        Bukan rekomendasi investasi. Informasi &amp; analisis saja · Sectors CORE · Kronos 400→20 · 30ER/20|Z|/30QV/20SM · Sumber data resmi idx.co.id ↗
      </div>
    </div>
  );
}
