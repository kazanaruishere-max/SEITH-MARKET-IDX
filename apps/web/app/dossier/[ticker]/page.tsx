import { fetchDossier } from "@/lib/api";
export default async function DossierPage({ params, searchParams }: { params: { ticker: string }; searchParams: { market?: string; format?: string } }) {
  const ticker = params.ticker.toUpperCase().split(".")[0];
  const market = searchParams.market ?? "id";
  let data: unknown = null;
  let error: string | null = null;
  try {
    const r = await fetchDossier(ticker, market, "json");
    data = (r as { data: unknown }).data;
  } catch (e: unknown) { error = e instanceof Error ? e.message : String(e); }
  const d = data as never as { peerComparison?: unknown[]; research?: { fundamentalMemo?: string } } | null;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-lg">{ticker} · {market}</h1>
        <a href={`/api/v1/tickers/${encodeURIComponent(ticker)}/dossier?market=${market}&format=pdf`} className="rounded bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-white">Download PDF</a>
      </div>
      {error ? <div className="rounded border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-300">{error}</div> : null}
      <div className="rounded-xl border border-zinc-800 bg-[#11151F] p-4 text-sm text-zinc-300">
        <div className="text-xs uppercase tracking-wide text-zinc-500">peerComparison</div>
        <pre className="mt-1 overflow-auto text-xs">{JSON.stringify(d?.peerComparison ?? [], null, 2)}</pre>
        <div className="mt-3 text-xs uppercase tracking-wide text-zinc-500">research memo</div>
        <p className="mt-1 text-zinc-400">{String((d?.research as never as { synthesizerMemo?: string })?.synthesizerMemo ?? "-")}</p>
      </div>
      <p className="text-xs text-zinc-500">Bukan rekomendasi investasi — informasi &amp; analisis saja</p>
    </div>
  );
}
