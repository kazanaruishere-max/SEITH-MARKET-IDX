import { fetchBacktest } from "@/lib/api";
import BacktestChart, { type EquityPoint } from "@/components/BacktestChart";
import MetricsTable, { type Metrics } from "@/components/MetricsTable";
import RankingTable from "@/components/RankingTable";

type BacktestData = {
  universe?: number;
  items?: { mispricingScore: number; ticker: string }[];
  metrics?: Metrics;
  equity_curve?: EquityPoint[];
  as_of?: string;
  degraded?: boolean;
  excluded?: unknown[];
};

export default async function BacktestPage({
  searchParams,
}: {
  searchParams: { market?: string };
}) {
  const market = searchParams.market ?? "id";
  let data: BacktestData | null = null;
  let error: string | null = null;

  try {
    const r = await fetchBacktest(market);
    data = r.data as BacktestData;
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : String(e);
  }

  const items = [...(data?.items ?? [])].sort(
    (a, b) => b.mispricingScore - a.mispricingScore
  ) as never[];
  const m = (data?.metrics ?? {}) as Metrics;
  const excluded = (data?.excluded ?? []) as { ticker: string; reason: string }[];
  const equity = (data?.equity_curve ?? []) as EquityPoint[];
  const weeks = equity.length || 52;
  const range =
    equity.length >= 2
      ? `${equity[0].date} → ${equity[equity.length - 1].date}`
      : equity.length === 1
      ? equity[0].date
      : "52 PEKAN";

  return (
    <div className="space-y-4">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2638] pb-2 font-mono text-[11px] text-zinc-400">
        <div className="flex items-center gap-1.5">
          <a href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            SEITH // TERMINAL
          </a>
          <span className="text-zinc-600">&gt;</span>
          <span className="font-bold text-amber-400">STRATEGY TESTER</span>
          <span className="text-zinc-600">&gt;</span>
          <span className="text-zinc-200">
            {market.toUpperCase()} · UNIVERSE {data?.universe ?? 100}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="rounded-[2px] border border-[#1E2638] bg-[#0A0D15] px-1.5 py-0.5">
            52-WEEK SYNTHETIC PROJECTION
          </span>
        </div>
      </div>

      {/* Strategy Header Banner */}
      <section className="terminal-card p-4 md:p-5 font-mono">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-[2px] bg-amber-400 px-2 py-0.5 text-xs font-black text-zinc-950">
                STRATEGY TESTER
              </span>
              <span className="text-[11px] uppercase tracking-wider text-zinc-400">
                TOP-10 EQUAL-WEIGHT VS IHSG BENCHMARK
              </span>
            </div>
            <h1 className="mt-2 text-xl font-black tracking-tight text-zinc-100 sm:text-2xl">
              Simulasi Ekuitas Portofolio // {weeks} Minggu
            </h1>
            <p className="mt-1 text-xs text-zinc-400 max-w-3xl leading-relaxed">
              Model komparasi historis mingguan periode{" "}
              <span className="text-zinc-200 font-semibold">{range}</span>. Simulasi
              menggunakan model forecast derivatif. Transparansi: data mentah DB saat ini memuat 500
              baris (20 hari bursa).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/ranking?market=${market}`}
              className="terminal-btn border-[#1E2638] bg-[#07090E] text-zinc-300 hover:border-zinc-500 hover:text-white"
            >
              SCREENER RANKING →
            </a>
          </div>
        </div>

        {/* Telemetry KPI Deck */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 border-t border-[#1E2638] pt-3">
          <div className="terminal-kpi">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
              SIGNAL ACCURACY
            </div>
            <div className="mt-1 text-xl font-black text-emerald-400">
              {m.hit_rate !== undefined
                ? `${(m.hit_rate * 100).toFixed(0)}%`
                : m.win_rate !== undefined
                ? `${(m.win_rate * 100).toFixed(0)}%`
                : "-"}
            </div>
            <div className="mt-0.5 text-[9px] text-zinc-500">Top-20 Cross-Sectional Flags</div>
          </div>

          <div className="terminal-kpi">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
              SHARPE RATIO (ER)
            </div>
            <div
              className={`mt-1 text-xl font-black ${
                m.sharpe !== undefined && m.sharpe < 0 ? "text-amber-400" : "text-zinc-100"
              }`}
            >
              {m.sharpe !== undefined ? m.sharpe.toFixed(2) : "-"}
            </div>
            <div className="mt-0.5 text-[9px] text-zinc-500">ER Cross-Sectional Normal</div>
          </div>

          <div className="terminal-kpi">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">MAX DRAWDOWN</div>
            <div className="mt-1 text-xl font-black text-red-400">
              {m.drawdown !== undefined ? `${(m.drawdown * 100).toFixed(1)}%` : "-"}
            </div>
            <div className="mt-0.5 text-[9px] text-zinc-500">Peak-to-Trough Simulation</div>
          </div>

          <div className="terminal-kpi">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">TOTAL RETURN</div>
            <div
              className={`mt-1 text-xl font-black ${
                (m.totalReturn ?? m.cumulative ?? 0) < 0 ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {m.totalReturn !== undefined ? `${(m.totalReturn * 100).toFixed(1)}%` : "-"}
            </div>
            <div className="mt-0.5 text-[9px] text-zinc-500">Cumulative vs IHSG</div>
          </div>
        </div>

        {/* Excluded Tickers Pill */}
        {excluded.length ? (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-[#1E2638] pt-2 text-xs">
            <span className="text-[10px] text-zinc-500 uppercase">CLEANSING EXCLUDED:</span>
            {excluded.map((e) => (
              <span
                key={e.ticker}
                className="rounded-[2px] border border-amber-900/50 bg-amber-950/30 px-1.5 py-0.2 text-[10px] font-bold text-amber-300"
              >
                {e.ticker} ({e.reason})
              </span>
            ))}
          </div>
        ) : null}
      </section>

      {error ? (
        <div className="rounded-[4px] border border-red-800/80 bg-red-950/40 p-3 font-mono text-xs text-red-300">
          Gagal mengambil data backtest: {error}
        </div>
      ) : null}

      {/* Main Dual Charts */}
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BacktestChart points={equity} />
        </div>
        <MetricsTable m={m} />
      </div>

      {/* Full 100 Audit Log */}
      <section className="terminal-card overflow-hidden font-mono">
        <div className="flex items-center justify-between border-b border-[#1E2638] bg-[#0A0D15] px-3 py-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
            SIMULASI BACKTEST // SELURUH 100 EMITEN UNIVERSE
          </span>
          <span className="text-[10px] text-zinc-500">KLIK ROW → BUKA DOSSIER</span>
        </div>
        <RankingTable items={items as never} />
      </section>

      {/* Disclaimer */}
      <div className="font-mono text-[10px] text-zinc-500 leading-relaxed border-t border-[#1E2638] pt-2">
        Bukan rekomendasi investasi. Informasi &amp; analisis saja · Backtest 52 pekan synthetic forecast-based · 100 emiten terverifikasi profil idx.co.id ↗
      </div>
    </div>
  );
}
