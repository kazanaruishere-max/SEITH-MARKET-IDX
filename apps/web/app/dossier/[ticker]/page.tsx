import dynamic from "next/dynamic";
import { fetchDossier } from "@/lib/api";
import ScoreBadge from "@/components/ScoreBadge";
import DossierKronosChart from "@/components/DossierKronosChart";
const DossierClient = dynamic(() => import("./DossierClient"), { ssr: false });
type Peer = { ticker: string; score: number; market: string; sector?: string; qvDistance?: number };
type DossierData = {
  ticker: string; market: string; lang?: string; score?: number;
  breakdown?: { expected_return: number; anomaly_z: number; quality_value: number; sector_mom: number };
  peerComparison?: Peer[];
  kronos?: { forecastReturn?: number; volatility?: number; chartPoints?: { date:string; value:number; upper:number; lower:number }[] };
  research?: { fundamentalMemo?: string; technicalMemo?: string; synthesizerMemo?: string };
  anomaly?: { z?: number; flag?: boolean; reason?: string };
  sector?: string; rank?: number; close?: number; disclaimer: string;
};
function Bar({ label, value, w }: { label: string; value: number; w: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] uppercase tracking-wide"><span className="text-zinc-500">{label}</span><span className="font-mono text-zinc-300">{value.toFixed(1)}</span></div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800"><div className="h-full rounded-full bg-amber-400" style={{ width: w }} /></div>
    </div>
  );
}
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
  const b = data?.breakdown;
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#11151F] p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded bg-amber-400 px-1.5 py-0.5 font-mono text-[11px] font-bold tracking-widest text-zinc-900">DOSSIER</span>
              <span className="rounded border border-zinc-700 bg-[#0B0E14] px-2 py-0.5 font-mono text-zinc-300">{ticker}</span>
              <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-zinc-400">{market.toUpperCase()}</span>
              {data?.sector ? <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-zinc-400">{data.sector}</span> : null}
              {data?.rank ? <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-xs text-zinc-900">rank #{data.rank}</span> : null}
              {data?.anomaly?.flag ? <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">FLAG |Z| {(data.anomaly.z ?? 0).toFixed(1)}</span> : null}
            </div>
            <h1 className="mt-3 font-mono text-2xl tracking-tight">{ticker} <span className="font-sans text-sm font-normal text-zinc-400">· {market.toUpperCase()}{data?.sector ? ` · ${data.sector}` : ""}</span></h1>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-400">Mispricing 0-100 blended 30ER·20|Z|·30QV·20SM · Kronos 400→20 forecast amber dashed ±2σ band · Peer same sector QV±50%. {data?.anomaly?.reason ? `Flag: ${data.anomaly.reason}` : ""}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            {data ? <ScoreBadge score={data.score ?? 0} anomaly={data.anomaly?.flag} /> : null}
            <div className="text-right"><div className="font-mono text-2xl">{data?.score !== undefined ? data.score.toFixed(1) : "-"}</div><div className="text-xs text-zinc-500">score / 100</div></div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {data ? <DossierClient ticker={ticker} market={market} lang={lang} dossier={{ ticker, market, lang, score: data.score, breakdown: data.breakdown, peerComparison: peers, kronos: data.kronos, research: data.research, disclaimer: data.disclaimer } as never} /> : null}
          <a href={`/ranking?market=${market}`} className="rounded-full border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800">← Ranking</a>
          <a href={`/backtest?market=${market}`} className="rounded-full border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800">Backtest</a>
        </div>
      </div>

      {error ? <div className="rounded border border-red-900 bg-red-950/30 px-3 py-2 text-sm text-red-300">{error}</div> : null}

      {data ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <DossierKronosChart kronos={data.kronos as never} close={data.close} />
              <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#11151F]">
                <div className="border-b border-zinc-800 px-3 py-2 text-xs uppercase tracking-wide text-zinc-400">Peer benchmark · same sector+market · QV±50%</div>
                <table className="w-full text-sm">
                  <thead className="bg-[#1A1F2E] text-left text-xs uppercase text-zinc-400">
                    <tr><th className="px-3 py-2">Ticker</th><th className="px-3 py-2">Score</th><th className="px-3 py-2">QV dist</th></tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {peers.map((p) => (
                      <tr key={p.ticker} className="hover:bg-zinc-900/40">
                        <td className="px-3 py-2 font-mono"><a className="hover:underline" href={`/dossier/${p.ticker}?market=${p.market}`}>{p.ticker}</a></td>
                        <td className="px-3 py-2 font-mono">{p.score.toFixed(1)}</td>
                        <td className="px-3 py-2 font-mono text-zinc-400">{p.qvDistance?.toFixed(1) ?? "-"}</td>
                      </tr>
                    ))}
                    {peers.length === 0 ? <tr><td colSpan={3} className="px-3 py-6 text-center text-zinc-500">No peers</td></tr> : null}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-800 bg-[#11151F] p-4">
                <div className="text-xs uppercase tracking-wide text-amber-300">Breakdown 30/20/30/20</div>
                <div className="mt-3 space-y-3">
                  <Bar label="ER 30% · expected return" value={b?.expected_return ?? 0} w={`${Math.max(4, Math.min(100, b?.expected_return ?? 0))}%`} />
                  <Bar label="|Z| 20% · anomaly" value={b?.anomaly_z ?? 0} w={`${Math.max(4, Math.min(100, b?.anomaly_z ?? 0))}%`} />
                  <Bar label="QV 30% · quality value" value={b?.quality_value ?? 0} w={`${Math.max(4, Math.min(100, b?.quality_value ?? 0))}%`} />
                  <Bar label="SM 20% · sector momentum" value={b?.sector_mom ?? 0} w={`${Math.max(4, Math.min(100, b?.sector_mom ?? 0))}%`} />
                </div>
                <div className="mt-3 text-xs text-zinc-500">Sum tertimbang = mispricing score. Close {data.close ? `Rp ${data.close.toLocaleString("id-ID")}` : "-"} · |Z| {(data.anomaly?.z ?? 0).toFixed(2)}</div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-[#11151F] p-4">
                <div className="text-xs uppercase tracking-wide text-zinc-400">Synthesizer memo</div>
                <p className="mt-2 text-sm leading-6 text-zinc-200">{data.research?.synthesizerMemo ?? "-"}</p>
                <div className="mt-4 border-t border-zinc-800 pt-3">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">Fundamental</div>
                  <p className="mt-1 text-sm leading-6 text-zinc-400">{data.research?.fundamentalMemo ?? "-"}</p>
                </div>
                <div className="mt-3">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">Technical</div>
                  <p className="mt-1 text-sm leading-6 text-zinc-400">{data.research?.technicalMemo ?? "-"}</p>
                </div>
                <p className="mt-4 text-xs text-zinc-500">Top-10 nemutron · template fallback jika degraded</p>
              </div>
            </div>
          </div>
        </>
      ) : null}
      <p className="text-xs text-zinc-500">Bukan rekomendasi investasi — informasi &amp; analisis saja · {data?.disclaimer ?? ""}</p>
    </div>
  );
}
