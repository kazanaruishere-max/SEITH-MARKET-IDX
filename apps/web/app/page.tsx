import Link from "next/link";
import { fetchAnomalies } from "@/lib/api";
import TopLeaks from "@/components/TopLeaks";
export default async function Page() {
  let leaks: { ticker: string; mispricingScore: number; anomalyZ?: number; rank?: number; sector?: string }[] = [];
  try {
    const r = await fetchAnomalies({ market: "id", minZ: 2.0, pageSize: 5 });
    leaks = (r.data.items ?? []) as typeof leaks;
  } catch { leaks = []; }
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-[#11151F] p-6">
        <h1 className="font-mono text-xl tracking-tight">SEITH — Market Intelligence IDX</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Mispricing Score 0-100 · Anomaly Rank · Dossier 2-page. 60s ranking → deep dive → export PDF.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/ranking" className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-white">Lihat Ranking →</Link>
          <Link href="/backtest" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300">Backtest 100 →</Link>
          <Link href="/dossier/BBCA?market=id" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300">Dossier BBCA →</Link>
          <a href="/api/v1/health" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300">API health</a>
        </div>
      </div>
      <TopLeaks items={leaks} />
      <p className="text-xs text-zinc-500">Bukan rekomendasi investasi — informasi &amp; analisis saja</p>
    </div>
  );
}
