import { fetchRanking } from "@/lib/api";
import RankingTable from "@/components/RankingTable";
const SECTORS = ["FINANCE", "ENERGY", "CONSUMER", "INFRA", "OTHER"];
export default async function RankingPage({ searchParams }: { searchParams: { market?: string; sector?: string; sort?: string; order?: string; page?: string; pageSize?: string } }) {
  const market = searchParams.market ?? "id";
  const sector = searchParams.sector;
  const sort = searchParams.sort ?? "mispricing";
  const order = searchParams.order ?? "desc";
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const pageSize = searchParams.pageSize ? parseInt(searchParams.pageSize, 10) : 20;
  let items: never[] = [];
  let pagination = { page, pageSize, total: 0 };
  let error: string | null = null;
  try {
    const r = await fetchRanking({ market, sector, sort, order, page, pageSize });
    items = (r.data as never as { items: never[] }).items ?? [];
    if (r.pagination) pagination = r.pagination;
  } catch (e: unknown) { error = e instanceof Error ? e.message : String(e); }
  const link = (s: string) => `/ranking?market=${market}${sector ? `&sector=${sector}` : ""}&sort=${s}&order=${order}&page=${page}&pageSize=${pageSize}`;
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Ranking · market {market}{sector ? ` · ${sector}` : ""}</h1>
      <div className="flex flex-wrap gap-2 text-xs">
        {SECTORS.map((s) => (
          <a key={s} href={`/ranking?market=${market}&sector=${s}&sort=${sort}&order=${order}&pageSize=${pageSize}`} className={`rounded border px-2 py-1 ${sector === s ? "border-amber-400 text-amber-300" : "border-zinc-700 text-zinc-300"}`}>{s}</a>
        ))}
        <a href={link("mispricing")} className="rounded border border-zinc-700 px-2 py-1 text-zinc-300">sort mispricing</a>
        <a href={link("anomaly")} className="rounded border border-zinc-700 px-2 py-1 text-zinc-300">sort anomaly</a>
      </div>
      {error ? <div className="rounded border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-300">{error}</div> : null}
      <RankingTable items={items as never} pagination={pagination} />
      <p className="text-xs text-zinc-500">Bukan rekomendasi investasi. Informasi & analisis saja.</p>
    </div>
  );
}
