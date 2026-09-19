import dynamic from "next/dynamic";
import { fetchDossier } from "@/lib/api";
import ScoreBadge from "@/components/ScoreBadge";
import DossierKronosChart from "@/components/DossierKronosChart";
import { profileOf } from "@/data/companyProfiles";
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
      <div className="flex justify-between text-[10px] uppercase tracking-wide"><span className="text-zinc-500">{label}</span><span className="font-mono font-semibold text-zinc-300">{value.toFixed(1)}</span></div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800"><div className="h-full rounded-full bg-amber-400" style={{ width: w }} /></div>
    </div>
  );
}
export default async function DossierPage({ params, searchParams }: { params: { ticker: string }; searchParams: { market?: string; lang?: string } }) {
  const ticker = params.ticker.toUpperCase().split(".")[0];
  const market = searchParams.market ?? "id";
  const lang = searchParams.lang ?? "id";
  const prof = profileOf(ticker);
  let data: DossierData | null = null;
  let error: string | null = null;
  try {
    const r = await fetchDossier(ticker, market, "json", lang) as { data: DossierData };
    data = r.data;
  } catch (e: unknown) { error = e instanceof Error ? e.message : String(e); }
  const peers = data?.peerComparison ?? [];
  const b = data?.breakdown;
  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-1.5 text-[11px] tracking-wide text-zinc-500">
        <a href="/" className="hover:text-zinc-300">IDX</a><span className="text-zinc-700">›</span><a href="/ranking" className="hover:text-zinc-300">Ranking</a><span className="text-zinc-700">›</span><span className="font-semibold text-zinc-300">{ticker}</span><span className="text-zinc-600">·</span><span className="text-zinc-400">{prof?.name ?? ticker}</span>
      </nav>
      <section className="overflow-hidden rounded-[16px] border border-[#24242e] bg-gradient-to-br from-[#11151F] via-[#11151F] to-[#0f1320] p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-extrabold tracking-[0.12em] text-zinc-900">DOSSIER</span>
              <span className="rounded-full border border-zinc-700 bg-[#0B0E14] px-2.5 py-1 font-mono text-xs font-bold text-zinc-100">{ticker}</span>
              <span className="rounded-full border border-zinc-700/60 bg-[#0B0E14] px-2 py-1 text-xs text-zinc-400">{market.toUpperCase()}</span>
              {data?.sector ? <span className="rounded-full border border-zinc-700/60 bg-[#0B0E14] px-2 py-1 text-xs text-zinc-400">{data.sector}</span> : prof ? <span className="rounded-full border border-zinc-700/60 bg-[#0B0E14] px-2 py-1 text-xs text-zinc-400">{prof.sector}</span> : null}
              {data?.rank ? <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-mono text-xs font-bold text-zinc-900">rank #{data.rank}</span> : null}
              {data?.anomaly?.flag ? <span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">FLAG |Z| {(data.anomaly.z ?? 0).toFixed(1)}</span> : null}
            </div>
            <h1 className="mt-3 font-mono text-2xl font-extrabold tracking-tight md:text-3xl">{prof?.name ?? ticker}<span className="ml-2 font-sans text-sm font-normal text-zinc-500">· {ticker}</span></h1>
            {prof ? <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-300">{prof.desc}</p> : null}
            {prof ? <a href={prof.idxUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-300 hover:text-amber-200 hover:underline underline-offset-4">Profil resmi IDX ↗<span className="font-mono text-[11px] text-zinc-500 ml-1">{prof.idxUrl.replace("https://","")}</span></a> : null}
            <p className="mt-3 max-w-2xl text-xs leading-relaxed text-zinc-500">Mispricing 0–100 blended <span className="font-mono font-semibold text-zinc-300">30ER·20|Z|·30QV·20SM</span> · Kronos 400→20 forecast amber dashed ±2σ · Peer same sector QV±50%. {data?.anomaly?.reason ? `Flag: ${data.anomaly.reason}` : ""}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {data ? <ScoreBadge score={data.score ?? 0} anomaly={data.anomaly?.flag} /> : null}
            <div className="text-right"><div className="font-mono text-3xl font-extrabold tracking-tight">{data?.score !== undefined ? data.score.toFixed(1) : "-"}</div><div className="text-xs tracking-wide text-zinc-500">score / 100 · {prof?.sector ?? data?.sector ?? "-"}</div></div>
            {data?.close ? <span className="rounded-full border border-zinc-800 bg-[#0B0E14] px-3 py-1 font-mono text-xs text-zinc-400">Close Rp {data.close.toLocaleString("id-ID")}</span> : null}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 border-t border-zinc-800/60 pt-4">
          {data ? <DossierClient ticker={ticker} market={market} lang={lang} dossier={{ ticker, market, lang, score: data.score, breakdown: data.breakdown, peerComparison: peers, kronos: data.kronos, research: data.research, disclaimer: data.disclaimer } as never} /> : null}
          <a href={`/ranking?market=${market}`} className="rounded-full border border-zinc-700 bg-[#0B0E14] px-4 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">← Ranking</a>
          <a href={`/backtest?market=${market}`} className="rounded-full border border-zinc-700 bg-[#0B0E14] px-4 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">Backtest</a>
        </div>
      </section>
      {error ? <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">{error}</div> : null}
      {data ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <DossierKronosChart kronos={data.kronos as never} close={data.close} />
            <div className="overflow-hidden rounded-xl border border-[#24242e] bg-[#11151F] shadow-card">
              <div className="flex items-center justify-between border-b border-[#24242e]/60 bg-[#0f1320]/50 px-4 py-3">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-200">Peer benchmark · same sector · QV±50%</span>
                <span className="hidden rounded-full border border-zinc-800 bg-[#0B0E14] px-2 py-0.5 text-[11px] text-zinc-500 md:inline">tap ticker → dossier · sumber idx.co.id ↗</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#1A1F2E]/60 text-left text-xs uppercase tracking-wide text-zinc-400">
                    <tr><th className="px-4 py-2.5">Ticker & Emiten</th><th className="px-3 py-2.5">Score</th><th className="px-3 py-2.5">QV dist</th></tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {peers.map((p) => {
                      const pp = profileOf(p.ticker);
                      return (
                        <tr key={p.ticker} className="hover:bg-[#151a2a]/60 transition-colors">
                          <td className="px-4 py-2.5"><a href={`/dossier/${p.ticker}?market=${p.market}`} className="block hover:opacity-90" title={`${p.ticker} — ${pp?.name ?? ""} — ${pp?.desc ?? ""} — ${pp?.idxUrl ?? ""}`}><span className="font-mono text-sm font-bold hover:text-amber-300 hover:underline decoration-amber-400/30 underline-offset-4">{p.ticker}</span>{pp ? <span className="block max-w-[28ch] truncate text-[11px] leading-tight text-zinc-400">{pp.name}</span> : null}{pp ? <span className="hidden truncate text-[10px] text-zinc-500 md:block">{pp.desc}</span> : null}</a></td>
                          <td className="px-3 py-2.5 font-mono text-sm font-semibold">{p.score.toFixed(1)}</td>
                          <td className="px-3 py-2.5 font-mono text-xs text-zinc-400">{p.qvDistance?.toFixed(1) ?? "-"}</td>
                        </tr>
                      );
                    })}
                    {peers.length === 0 ? <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-zinc-500">No peers — same sector+market QV distance + cap band ±50% · contoh BBCA vs BMRI bukan BUMI beda sektor</td></tr> : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-[#24242e] bg-[#11151F] p-4 shadow-card">
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-amber-300">Breakdown 30/20/30/20</div>
              <div className="mt-3 space-y-3">
                <Bar label="ER 30% · expected return" value={b?.expected_return ?? 0} w={`${Math.max(4, Math.min(100, b?.expected_return ?? 0))}%`} />
                <Bar label="|Z| 20% · anomaly" value={b?.anomaly_z ?? 0} w={`${Math.max(4, Math.min(100, b?.anomaly_z ?? 0))}%`} />
                <Bar label="QV 30% · quality value" value={b?.quality_value ?? 0} w={`${Math.max(4, Math.min(100, b?.quality_value ?? 0))}%`} />
                <Bar label="SM 20% · sector momentum" value={b?.sector_mom ?? 0} w={`${Math.max(4, Math.min(100, b?.sector_mom ?? 0))}%`} />
              </div>
              <div className="mt-3 text-xs leading-relaxed text-zinc-500">Sum tertimbang = mispricing score. Close {data.close ? `Rp ${data.close.toLocaleString("id-ID")}` : "-"} · |Z| {(data.anomaly?.z ?? 0).toFixed(2)} · sumber idx.co.id ↗</div>
            </div>
            <div className="rounded-xl border border-[#24242e] bg-[#11151F] p-4 shadow-card">
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-200">Synthesizer memo · Top-10 nemutron</div>
              <p className="mt-2 text-sm leading-6 text-zinc-200">{data.research?.synthesizerMemo ?? "-"}</p>
              <div className="mt-4 border-t border-zinc-800 pt-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Fundamental</div>
                <p className="mt-1 text-sm leading-6 text-zinc-400">{data.research?.fundamentalMemo ?? "-"}</p>
              </div>
              <div className="mt-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Technical</div>
                <p className="mt-1 text-sm leading-6 text-zinc-400">{data.research?.technicalMemo ?? "-"}</p>
              </div>
              <p className="mt-4 text-xs text-zinc-500">template fallback jika degraded · dossier 9 section PDF vector</p>
            </div>
            {prof ? <div className="rounded-xl border border-zinc-800 bg-[#0B0E14]/60 p-4"><div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Emiten — sumber resmi IDX</div><div className="mt-2 font-mono text-sm font-bold text-zinc-200">{prof.name}</div><div className="mt-1 text-xs leading-relaxed text-zinc-400">{prof.desc}</div><a href={prof.idxUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex text-xs font-medium text-amber-300 hover:text-amber-200 hover:underline underline-offset-4">idx.co.id/{ticker} ↗</a></div> : null}
          </div>
        </div>
      ) : null}
      <p className="text-xs leading-relaxed text-zinc-500">Bukan rekomendasi investasi — informasi & analisis saja · {data?.disclaimer ?? "Sectors CORE · Kronos 400→20"} · profil emiten idx.co.id ↗</p>
    </div>
  );
}
