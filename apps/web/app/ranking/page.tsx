import { fetchRanking } from "@/lib/api";
import RankingTable from "@/components/RankingTable";
export default async function RankingPage({ searchParams }: { searchParams: { market?: string; sector?: string; page?: string; pageSize?: string } }) {
  const market = searchParams.market ?? "id";
  const sector = searchParams.sector;
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const pageSize = searchParams.pageSize ? parseInt(searchParams.pageSize, 10) : 20;
  let items: never[] = [];
  let pagination = { page, pageSize, total: 0 };
  let error: string | null = null;
  try {
    const r = await fetchRanking({ market, sector, page, pageSize });
    items = (r.data as never as { items: never[] }).items ?? [];
    if (r.pagination) pagination = r.pagination;
  } catch (e: unknown) { error = e instanceof Error ? e.message : String(e); }
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Ranking · market {market}</h1>
      {error ? <div className="rounded border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-300">{error}</div> : null}
      <RankingTable items={items as never} pagination={pagination} />
      <p className="text-xs text-zinc-500">Bukan rekomendasi investasi. Informasi &amp; analisis saja.</p>
    </div>
  );
}
