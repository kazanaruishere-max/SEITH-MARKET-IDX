import { fetchBacktest } from "@/lib/api";
import BacktestChart, { type EquityPoint } from "@/components/BacktestChart";
import MetricsTable, { type Metrics } from "@/components/MetricsTable";
import RankingTable from "@/components/RankingTable";
type BacktestData = { universe?: number; items?: { mispricingScore: number }[]; metrics?: Metrics; equity_curve?: EquityPoint[] };
export default async function BacktestPage({ searchParams }: { searchParams: { market?: string } }) {
  const market = searchParams.market ?? "id";
  let data: BacktestData | null = null;
  let error: string | null = null;
  try {
    const r = await fetchBacktest(market);
    data = r.data as BacktestData;
  } catch (e: unknown) { error = e instanceof Error ? e.message : String(e); }
  const items = data?.items ?? [];
  const top = [...items].sort((a, b) => b.mispricingScore - a.mispricingScore).slice(0, 10) as never[];
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Backtest · universe {data?.universe ?? 100} · market {market}</h1>
      {error ? <div className="rounded border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-300">{error}</div> : null}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2"><BacktestChart points={(data?.equity_curve ?? []) as EquityPoint[]} /></div>
        <MetricsTable m={(data?.metrics ?? {}) as Metrics} />
      </div>
      <RankingTable items={top} />
      <p className="text-xs text-zinc-500">Bukan rekomendasi investasi. Informasi & analisis saja.</p>
    </div>
  );
}
