import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchDossier } from "@/lib/api";
import DossierKronosChart from "@/components/DossierKronosChart";
import { profileOf } from "@/data/companyProfiles";

const DossierClient = dynamic(() => import("./DossierClient"), { ssr: false });

type Peer = {
  ticker: string;
  score: number;
  market: string;
  sector?: string;
  qvDistance?: number;
};

type DossierData = {
  ticker: string;
  market: string;
  lang?: string;
  score?: number;
  breakdown?: {
    expected_return: number;
    anomaly_z: number;
    quality_value: number;
    sector_mom: number;
  };
  peerComparison?: Peer[];
  kronos?: {
    forecastReturn?: number;
    volatility?: number;
    chartPoints?: { date: string; value: number; upper: number; lower: number }[];
  };
  research?: { fundamentalMemo?: string; technicalMemo?: string; synthesizerMemo?: string };
  anomaly?: { z?: number; flag?: boolean; reason?: string };
  sector?: string;
  rank?: number;
  close?: number;
  disclaimer: string;
};

function PillarBar({ label, value, pct }: { label: string; value: number; pct: number }) {
  return (
    <div className="space-y-1 font-mono">
      <div className="flex justify-between text-[10px]">
        <span className="text-zinc-400 uppercase tracking-wider">{label}</span>
        <span className="font-bold text-zinc-200">{value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 rounded-[1px] bg-[#1E2638] overflow-hidden">
        <div
          className="h-full bg-amber-400 transition-all duration-300"
          style={{ width: `${Math.max(4, Math.min(100, pct))}%` }}
        />
      </div>
    </div>
  );
}

export default async function DossierPage({
  params,
  searchParams,
}: {
  params: { ticker: string };
  searchParams: { market?: string; lang?: string };
}) {
  const cleanTicker = params.ticker.toUpperCase().split(".")[0].replace(/[^A-Z0-9]/g, "");
  if (!/^[A-Z0-9]{3,6}$/.test(cleanTicker)) {
    notFound();
  }
  const ticker = cleanTicker;
  const market = searchParams.market ?? "id";
  const lang = searchParams.lang ?? "id";
  const prof = profileOf(ticker);

  let data: DossierData | null = null;
  let error: string | null = null;

  try {
    const r = (await fetchDossier(ticker, market, "json", lang)) as { data: DossierData };
    data = r.data;
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : String(e);
  }

  const peers = data?.peerComparison ?? [];
  const b = data?.breakdown;

  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2638] pb-2 font-mono text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            SEITH // TERMINAL
          </Link>
          <span className="text-zinc-600">&gt;</span>
          <Link href="/ranking" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            SCREENER
          </Link>
          <span className="text-zinc-600">&gt;</span>
          <span className="font-bold text-amber-400">DOSSIER</span>
          <span className="text-zinc-600">&gt;</span>
          <span className="text-zinc-200">
            {ticker} ({prof?.name ?? ticker})
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="rounded-[2px] border border-[#1E2638] bg-[#0A0D15] px-1.5 py-0.5">
            SECURITY DES SHEET // BLOOMBERG GRADE
          </span>
        </div>
      </div>

      {/* Bloomberg "DES" Header Banner */}
      <section className="terminal-card p-4 md:p-5 font-mono">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-[2px] bg-amber-400 px-2 py-0.5 text-xs font-black tracking-wider text-zinc-950">
                {ticker}
              </span>
              <span className="rounded-[2px] border border-[#1E2638] bg-[#07090E] px-2 py-0.5 text-[11px] font-bold text-zinc-300">
                {market.toUpperCase()} PRIMARY
              </span>
              <span className="rounded-[2px] border border-[#1E2638] bg-[#07090E] px-2 py-0.5 text-[11px] text-zinc-400">
                {prof?.sector ?? data?.sector ?? "EQUITY"}
              </span>
              {data?.rank ? (
                <span className="rounded-[2px] bg-zinc-200 px-2 py-0.5 text-xs font-bold text-zinc-950">
                  RANK #{data.rank}
                </span>
              ) : null}
              {data?.anomaly?.flag ? (
                <span className="rounded-[2px] border border-red-800/80 bg-red-950/60 px-2 py-0.5 text-xs font-bold text-red-300">
                  FLAG |Z| {(data.anomaly.z ?? 0).toFixed(2)}
                </span>
              ) : null}
            </div>

            <h1 className="mt-2 text-xl sm:text-2xl font-black tracking-tight text-zinc-100">
              {prof?.name ?? ticker}
            </h1>

            {prof ? (
              <p className="mt-1 text-xs leading-relaxed text-zinc-400 max-w-3xl font-sans">
                {prof.desc}
              </p>
            ) : null}

            {prof ? (
              <div className="mt-2 flex items-center gap-2">
                <a
                  href={prof.idxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:underline"
                >
                  PROFIL RESMI BURSA EFEK INDONESIA (IDX.CO.ID) ↗
                </a>
              </div>
            ) : null}
          </div>

          {/* Right Metrics Panel */}
          <div className="flex flex-row lg:flex-col items-start lg:items-end justify-between gap-3 border-t lg:border-t-0 border-[#1E2638] pt-3 lg:pt-0">
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
                MISPRICING SCORE
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
                {data?.score !== undefined ? data.score.toFixed(1) : "-"}
                <span className="text-xs text-zinc-500 font-normal ml-1">/ 100</span>
              </div>
            </div>

            {data?.close ? (
              <div className="lg:text-right">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">CLOSE HARGA</div>
                <div className="text-base font-bold text-zinc-200">
                  Rp {data.close.toLocaleString("id-ID")}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#1E2638] pt-3">
          {data ? (
            <DossierClient
              ticker={ticker}
              market={market}
              lang={lang}
              dossier={
                {
                  ticker,
                  market,
                  lang,
                  score: data.score,
                  breakdown: data.breakdown,
                  peerComparison: peers,
                  kronos: data.kronos,
                  research: data.research,
                  disclaimer: data.disclaimer,
                } as never
              }
            />
          ) : null}
          <Link
            href={`/ranking?market=${market}`}
            className="terminal-btn border-[#1E2638] bg-[#07090E] text-zinc-300 hover:border-zinc-500 hover:text-white"
          >
            ← KEMBALI KE SCREENER
          </Link>
          <Link
            href={`/backtest?market=${market}`}
            className="terminal-btn border-[#1E2638] bg-[#07090E] text-zinc-300 hover:border-zinc-500 hover:text-white"
          >
            STRATEGY TESTER →
          </Link>
        </div>
      </section>

      {error ? (
        <div className="rounded-[4px] border border-red-800/80 bg-red-950/40 p-3 font-mono text-xs text-red-300">
          Gagal memuat berkas dossier: {error}
        </div>
      ) : null}

      {data ? (
        <div className="grid gap-3 lg:grid-cols-3">
          {/* Left Column: Kronos Quant Chart + Peer Benchmark Matrix */}
          <div className="lg:col-span-2 space-y-3">
            <DossierKronosChart kronos={data.kronos as never} close={data.close} />

            {/* Peer Benchmark Matrix */}
            <section className="terminal-card overflow-hidden font-mono">
              <div className="flex items-center justify-between border-b border-[#1E2638] bg-[#0A0D15] px-3 py-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  PEER BENCHMARK MATRIX // SAME SECTOR · QV DISTANCE ±50%
                </span>
                <span className="text-[10px] text-zinc-500">5 PEERS VERIFIED</span>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="border-b border-[#1E2638] bg-[#07090E] text-[10px] uppercase text-zinc-400">
                    <tr>
                      <th className="px-3 py-2 font-bold">EMITEN / PEER</th>
                      <th className="px-3 py-2 font-bold text-right">MISPRICING SCORE</th>
                      <th className="px-3 py-2 font-bold text-right">QV DISTANCE</th>
                      <th className="px-3 py-2 font-bold text-center">TINDAKAN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2638]/50 bg-[#07090E]">
                    {peers.map((p) => {
                      const pp = profileOf(p.ticker);
                      return (
                        <tr key={p.ticker} className="hover:bg-[#10141E] transition-colors">
                          <td className="px-3 py-2">
                            <div className="font-bold text-zinc-100">{p.ticker}</div>
                            {pp ? (
                              <div className="text-[10px] text-zinc-400 truncate max-w-[28ch]">
                                {pp.name}
                              </div>
                            ) : null}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-amber-400">
                            {p.score.toFixed(1)}
                          </td>
                          <td className="px-3 py-2 text-right text-zinc-400">
                            {p.qvDistance !== undefined ? p.qvDistance.toFixed(2) : "-"}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <Link
                              href={`/dossier/${p.ticker}?market=${p.market}`}
                              className="rounded-[2px] border border-[#1E2638] bg-[#131824] px-2 py-0.5 text-[10px] text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
                            >
                              DOSSIER ↗
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                    {peers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-6 text-center text-zinc-500">
                          Tidak ada data peer pada kriteria QV distance ±50%
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Right Column: 4-Pillar Breakdown + AI Analyst Research Synthesis */}
          <div className="space-y-3">
            {/* 4 Pillars Breakdown Card */}
            <div className="terminal-card p-3 font-mono">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400 border-b border-[#1E2638] pb-1.5">
                FAKTOR MISPRICING // 30/20/30/20
              </div>
              <div className="mt-2.5 space-y-2.5">
                <PillarBar
                  label="30% ER · Kronos Expected Return"
                  value={b?.expected_return ?? 0}
                  pct={b?.expected_return ?? 0}
                />
                <PillarBar
                  label="20% |Z| · Anomaly Inversion"
                  value={b?.anomaly_z ?? 0}
                  pct={b?.anomaly_z ?? 0}
                />
                <PillarBar
                  label="30% QV · Quality & Value"
                  value={b?.quality_value ?? 0}
                  pct={b?.quality_value ?? 0}
                />
                <PillarBar
                  label="20% SM · Sector Momentum"
                  value={b?.sector_mom ?? 0}
                  pct={b?.sector_mom ?? 0}
                />
              </div>
              <div className="mt-3 text-[10px] text-zinc-500 border-t border-[#1E2638] pt-2">
                Total tertimbang menghasilkan skor mispricing komposit 0→100.
              </div>
            </div>

            {/* AI Research Synthesis Memos */}
            <div className="terminal-card p-3 font-mono">
              <div className="flex items-center justify-between border-b border-[#1E2638] pb-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  RESEARCH SYNTHESIS // MEMO
                </div>
                <span className="rounded-[2px] border border-amber-400/40 bg-amber-400/10 px-1 py-0.2 text-[9px] font-bold text-amber-300">
                  NEMOTRON-3.5
                </span>
              </div>

              {/* Synthesizer Verdict */}
              <div className="mt-2">
                <div className="text-[10px] font-bold uppercase text-amber-400">
                  SYNTHESIZER VERDICT
                </div>
                <p className="mt-1 text-xs leading-relaxed text-zinc-200 font-sans">
                  {data.research?.synthesizerMemo ?? "-"}
                </p>
              </div>

              {/* Fundamental Memo */}
              <div className="mt-3 border-t border-[#1E2638] pt-2">
                <div className="text-[10px] font-bold uppercase text-zinc-400">FUNDAMENTAL AGENT</div>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-300 font-sans">
                  {data.research?.fundamentalMemo ?? "-"}
                </p>
              </div>

              {/* Technical Memo */}
              <div className="mt-2.5 border-t border-[#1E2638] pt-2">
                <div className="text-[10px] font-bold uppercase text-zinc-400">TECHNICAL AGENT</div>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-300 font-sans">
                  {data.research?.technicalMemo ?? "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Disclaimer */}
      <div className="font-mono text-[10px] text-zinc-500 leading-relaxed border-t border-[#1E2638] pt-2">
        Bukan rekomendasi investasi. Informasi &amp; analisis saja · {data?.disclaimer ?? "Sectors CORE · Kronos 400→20"} · Profil resmi emiten idx.co.id ↗
      </div>
    </div>
  );
}
