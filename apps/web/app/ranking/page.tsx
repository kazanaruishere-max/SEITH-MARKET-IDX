import { fetchRanking } from "@/lib/api";
import RankingTable from "@/components/RankingTable";
import Heatmap100 from "@/components/Heatmap100";
import StackedTop20 from "@/components/StackedTop20";
import ScatterERvsZ from "@/components/ScatterERvsZ";
const SECTORS = ["FINANCE", "ENERGY", "CONSUMER", "INFRA", "OTHER"];
type Item = { ticker: string; mispricingScore: number; anomalyFlag?: boolean; anomalyZ?: number; sector?: string; market?: string; rank?: number; close?: number; components?: { expected_return: number; anomaly_z: number; quality_value: number; sector_mom: number }; anomaly?: { z?: number; flag?: boolean } };
export default async function RankingPage({ searchParams }: { searchParams: { market?: string; sector?: string; sort?: string; order?: string; page?: string; pageSize?: string } }) {
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
  } catch (e: unknown) { error = e instanceof Error ? e.message : String(e); }
  const link = (s: string) => `/ranking?market=${market}${sector ? `&sector=${sector}` : ""}&sort=${s}&order=${order}&page=${page}&pageSize=${pageSize}`;
  const pageHref = (p: number) => `/ranking?market=${market}${sector ? `&sector=${sector}` : ""}&sort=${sort}&order=${order}&page=${p}&pageSize=${pageSize}`;
  const scatterItems = allForCharts.map((it) => ({ ticker: it.ticker, er: it.components?.expected_return ?? 50, z: it.anomaly?.z ?? it.anomalyZ ?? 0, close: it.close ?? 1000, flag: it.anomaly?.flag ?? it.anomalyFlag ?? false }));
  const stackItems = allForCharts.filter((x) => x.components).slice(0, 20).map((x) => ({ ticker: x.ticker, mispricingScore: x.mispricingScore, components: x.components! }));
  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-1.5 text-[11px] tracking-wide text-zinc-500">
        <a href="/" className="hover:text-zinc-300">IDX</a><span className="text-zinc-700">›</span><span className="font-semibold text-zinc-300">Ranking</span><span className="text-zinc-700">›</span><span className="text-zinc-400">{market.toUpperCase()}{sector ? ` · ${sector}` : ""}</span>
      </nav>
      <section className="card p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-extrabold tracking-[0.12em] text-zinc-900">RANKING</span>
              <span className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">universe 100 · {market.toUpperCase()}{sector ? ` · ${sector}` : " · All sectors"}</span>
              <span className="hidden rounded-full border border-zinc-800 bg-[#0B0E14] px-2 py-0.5 font-mono text-[11px] text-zinc-500 md:inline">sort {sort} {order} · TV screener</span>
            </div>
            <h1 className="mt-2 font-mono text-xl font-extrabold tracking-[-0.02em] md:text-2xl">Ranking Mispricing</h1>
            <p className="mt-1 max-w-[70ch] text-xs leading-relaxed text-zinc-400">Sort <span className="font-mono font-semibold text-zinc-200">0→100 blended 30ER·20|Z|·30QV·20SM</span> — warna = skor, bukan harga. Flag <span className="font-mono text-red-400">|Z|&gt;2</span> atau vol spike &gt;2σ. Artificial Analysis leaderboard + TradingView screener density.</p>
          </div>
          <div className="flex flex-col items-end gap-2 text-xs">
            <div className="flex gap-2">
              <span className="rounded-full border border-zinc-800 bg-[#0B0E14] px-2.5 py-1 font-mono text-zinc-400">{allForCharts.length} mapped</span>
              <span className="rounded-full border border-zinc-800 bg-[#0B0E14] px-2.5 py-1 font-mono text-zinc-400">page {pagination.page} · {pagination.total} total</span>
            </div>
            <span className="hidden text-[11px] text-zinc-600 md:inline">tap ticker → dossier · score bar = mispricing</span>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Sector</span>
          {SECTORS.map((s) => (
            <a key={s} href={`/ranking?market=${market}&sector=${s}&sort=${sort}&order=${order}&pageSize=${pageSize}`} className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-[0.98] ${sector === s ? "border-amber-400 bg-amber-400 text-zinc-900 shadow-[0_1px_0_rgba(255,255,255,0.5)_inset]" : "border-zinc-700/60 bg-[#0B0E14] text-zinc-300 hover:border-zinc-600 hover:bg-[#151a2a] hover:text-white"}`}>{s}</a>
          ))}
          {sector ? <a href={`/ranking?market=${market}&sort=${sort}&order=${order}&pageSize=${pageSize}`} className="rounded-full border border-red-900/50 bg-red-950/20 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-950/30">clear {sector} ×</a> : null}
          <span className="mx-1 hidden h-6 w-px bg-zinc-800 md:block" />
          <a href={link("mispricing")} className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${sort === "mispricing" ? "border-zinc-200 bg-zinc-100 text-zinc-900" : "border-zinc-700/60 text-zinc-300 hover:bg-zinc-800 hover:text-white"}`}>sort mispricing</a>
          <a href={link("anomaly")} className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${sort === "anomaly" ? "border-zinc-200 bg-zinc-100 text-zinc-900" : "border-zinc-700/60 text-zinc-300 hover:bg-zinc-800 hover:text-white"}`}>sort anomaly</a>
        </div>
      </section>
      {error ? <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">{error}</div> : null}
      <Heatmap100 items={allForCharts} />
      <div className="grid gap-4 lg:grid-cols-2">
        <StackedTop20 items={stackItems} />
        <ScatterERvsZ items={scatterItems} />
      </div>
      <RankingTable items={items as never} pagination={pagination} pageHref={pageHref} />
      <p className="text-xs leading-relaxed text-zinc-500">Bukan rekomendasi investasi. Informasi &amp; analisis saja · Sectors CORE · Kronos 400→20 · 30/20/30/20 · pagination server · heatmap treemap by sector</p>
    </div>
  );
}
