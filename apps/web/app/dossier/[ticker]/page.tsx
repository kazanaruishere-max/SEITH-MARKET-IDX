import dynamic from "next/dynamic";
import { fetchDossier } from "@/lib/api";
import ScoreBadge from "@/components/ScoreBadge";
const DossierClient = dynamic(() => import("./DossierClient"), { ssr: false });
type Peer = { ticker: string; score: number; market: string; sector?: string; qvDistance?: number };
type DossierData = {
  ticker: string; market: string; lang?: string; score?: number;
  breakdown?: { expected_return: number; anomaly_z: number; quality_value: number; sector_mom: number };
  peerComparison?: Peer[];
  kronos?: { forecastReturn?: number; volatility?: number };
  research?: { fundamentalMemo?: string; technicalMemo?: string; synthesizerMemo?: string };
  anomaly?: { z?: number; flag?: boolean; reason?: string };
  sector?: string; rank?: number; disclaimer: string;
};
export default async function DossierPage({ params, searchParams }: { params: { ticker: string }; searchParams: { market?: string; lang?: string } }) {
  const ticker = params.ticker.toUpperCase().split(".")[0];
  const market = searchParams.market ?? "id";
  const lang = searchParams.lang ?? "id";
  let data: DossierData | null = null;
  let error: string | null = null;
  try {
    const r = await fetchDossier(ticker, market, "json", lang) as { data: DossierData };
    data = r.data;
  } catch (e: unknown) { error = e instanceof Error ? e.message : String(e); }
  const peers = data?.peerComparison ?? [];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-mono text-lg">{ticker} · {market}{data?.sector ? ` · ${data.sector}` : ""}{data?.rank ? ` · rank ${data.rank}` : ""}</h1>
        {data ? <DossierClient ticker={ticker} market={market} lang={lang} dossier={{ ticker, market, lang, score: data.score, breakdown: data.breakdown, peerComparison: peers, kronos: data.kronos, research: data.research, disclaimer: data.disclaimer }} /> : null}
      </div>
      {error ? <div className="rounded border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-300">{error}</div> : null}
      {data ? (
        <>
          <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-[#11151F] p-4">
            <ScoreBadge score={data.score ?? 0} anomaly={data.anomaly?.flag} />
            <span className="text-sm text-zinc-300">Skor {data.score?.toFixed(1)} · |Z| {(data.anomaly?.z ?? 0).toFixed(1)}{data.anomaly?.reason ? ` · ${data.anomaly.reason}` : ""}</span>
          </div>
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#11151F]">
            <div className="border-b border-zinc-800 px-3 py-2 text-xs uppercase tracking-wide text-zinc-400">Peer benchmark · same sector+market · QV+cap ±50%</div>
            <table className="w-full text-sm">
              <thead className="bg-[#1A1F2E] text-left text-xs uppercase text-zinc-400">
                <tr><th className="px-3 py-2">Ticker</th><th className="px-3 py-2">Score</th><th className="px-3 py-2">QV dist</th></tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {peers.map((p) => (
                  <tr key={p.ticker}>
                    <td className="px-3 py-2 font-mono"><a className="hover:underline" href={`/dossier/${p.ticker}?market=${p.market}`}>{p.ticker}</a></td>
                    <td className="px-3 py-2">{p.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-zinc-400">{p.qvDistance?.toFixed(1) ?? "-"}</td>
                  </tr>
                ))}
                {peers.length === 0 ? <tr><td colSpan={3} className="px-3 py-6 text-center text-zinc-500">No peers</td></tr> : null}
              </tbody>
            </table>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-[#11151F] p-4 text-sm text-zinc-300">
            <div className="text-xs uppercase tracking-wide text-zinc-500">Synthesizer memo</div>
            <p className="mt-1 text-zinc-300">{data.research?.synthesizerMemo ?? "-"}</p>
            <div className="mt-3 text-xs uppercase tracking-wide text-zinc-500">Fundamental / Technical</div>
            <p className="mt-1 text-zinc-400">{data.research?.fundamentalMemo ?? "-"}</p>
            <p className="mt-1 text-zinc-400">{data.research?.technicalMemo ?? "-"}</p>
          </div>
        </>
      ) : null}
      <p className="text-xs text-zinc-500">Bukan rekomendasi investasi — informasi &amp; analisis saja</p>
    </div>
  );
}
