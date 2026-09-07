import Link from "next/link";
export default function Page() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-[#11151F] p-6">
        <h1 className="font-mono text-xl tracking-tight">SEITH — Market Intelligence IDX</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Mispricing Score 0-100 · Anomaly Rank · Dossier 1-page. 60s ranking → deep dive → export PDF.</p>
        <div className="mt-4 flex gap-2">
          <Link href="/ranking" className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-white">Lihat Ranking →</Link>
          <a href="/api/v1/health" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300">API health</a>
        </div>
      </div>
      <p className="text-xs text-zinc-500">Bukan rekomendasi investasi — informasi &amp; analisis saja</p>
    </div>
  );
}
