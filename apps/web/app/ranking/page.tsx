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
  const pageSize = searchParams.pageSize ? parseInt(searchParams.pageSize, 10) : 20;
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
  const scatterItems = allForCharts.map((it) => ({ ticker: it.ticker, er: it.components?.expected_return ?? 50, z: it.anomaly?.z ?? it.anomalyZ ?? 0, close: it.close ?? 1000, flag: it.anomaly?.flag ?? it.anomalyFlag ?? false }));
  const stackItems = allForCharts.filter((x) => x.components).slice(0, 20).map((x) => ({ ticker: x.ticker, mispricingScore: x.mispricingScore, components: x.components! }));
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Ranking — market {market}{sector ? ` — ${sector}` : ""}</h1>
      <div className="flex flex-wrap gap-2 text-xs">
        {SECTORS.map((s) => (
          <a key={s} href={`/ranking?market=${market}&sector=${s}&sort=${sort}&order=${order}&pageSize=${pageSize}`} className={`rounded border px-2 py-1 ${sector === s ? "border-amber-400 text-amber-300" : "border-zinc-700 text-zinc-300"}`}>{s}</a>
        ))}
        <a href={link("mispricing")} className="rounded border border-zinc-700 px-2 py-1 text-zinc-300">sort mispricing</a>
        <a href={link("anomaly")} className="rounded border border-zinc-700 px-2 py-1 text-zinc-300">sort anomaly</a>
      </div>
      {error ? <div className="rounded border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-300">{error}</div> : null}
      <Heatmap100 items={allForCharts} />
      <div className="grid gap-4 lg:grid-cols-2">
        <StackedTop20 items={stackItems} />
        <ScatterERvsZ items={scatterItems} />
      </div>
      <RankingTable items={items as never} pagination={pagination} />
      <p className="text-xs text-zinc-500">Bukan rekomendasi investasi. Informasi &amp; analisis saja.</p>
    </div>
  );
}
