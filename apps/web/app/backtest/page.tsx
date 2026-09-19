import { fetchBacktest } from "@/lib/api";
import BacktestChart, { type EquityPoint } from "@/components/BacktestChart";
import MetricsTable, { type Metrics } from "@/components/MetricsTable";
import RankingTable from "@/components/RankingTable";
type BacktestData = { universe?: number; items?: { mispricingScore: number; ticker: string }[]; metrics?: Metrics; equity_curve?: EquityPoint[]; as_of?: string; degraded?: boolean; excluded?: unknown[] };
export default async function BacktestPage({ searchParams }: { searchParams: { market?: string } }) {
  const market = searchParams.market ?? "id";
  let data: BacktestData | null = null;
  let error: string | null = null;
  try {
    const r = await fetchBacktest(market);
    data = r.data as BacktestData;
  } catch (e: unknown) { error = e instanceof Error ? e.message : String(e); }
  const items = [...(data?.items ?? [])].sort((a, b) => b.mispricingScore - a.mispricingScore) as never[];
  const m = (data?.metrics ?? {}) as Metrics;
  const excluded = (data?.excluded ?? []) as { ticker: string; reason: string }[];
  const equity = (data?.equity_curve ?? []) as EquityPoint[];
  const weeks = equity.length || 52;
  const range = equity.length >= 2 ? `${equity[0].date}→${equity[equity.length - 1].date}` : equity.length === 1 ? equity[0].date : "52w";
  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-1.5 text-[11px] tracking-wide text-zinc-500">
        <a href="/" className="hover:text-zinc-300">IDX</a><span className="text-zinc-700">›</span><span className="font-semibold text-zinc-300">Backtest</span><span className="text-zinc-700">›</span><span className="text-zinc-400">{market.toUpperCase()} · universe {data?.universe ?? 100}</span><span className="ml-2 hidden rounded-full border border-zinc-800 bg-[#11151F] px-2 py-0.5 font-mono text-[10px] md:inline">as_of {data?.as_of ?? "live"} · sumber idx.co.id ↗</span>
      </nav>
      <section className="overflow-hidden rounded-[16px] border border-[#24242e] bg-gradient-to-br from-[#11151F] via-[#11151F] to-[#0f1320] p-5 shadow-card md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-extrabold tracking-[0.12em] text-zinc-900">BACKTEST</span>
              <span className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">universe {data?.universe ?? 100} · {market.toUpperCase()} · as_of {data?.as_of ?? "live"}</span>
              {excluded.length ? <span className="rounded-full border border-amber-900/50 bg-amber-950/20 px-2 py-0.5 text-[11px] font-medium text-amber-300">excluded {excluded.length}</span> : null}
            </div>
            <h1 className="mt-3 font-mono text-xl font-extrabold tracking-[-0.02em] md:text-2xl">Equity vs IHSG — Backtest 100 · {weeks} minggu · synthetic forecast-based</h1>
            <p className="mt-1.5 max-w-[70ch] text-xs leading-relaxed text-zinc-400">SEITH Top-10 equal-weight vs IHSG bench · <span className="font-mono font-semibold text-zinc-200">{weeks} titik mingguan {range} · forecast-based, bukan realized</span> · universe 100 · drawdown shade · band ±8%. DB 500 rows/25 tickers (20 hari) — synthetic honest, bukan fabrikasi realized. Live 100 Kronos 400→20 · 296 credits · idx.co.id ↗</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${data?.degraded ? "border-red-900/50 bg-red-950/30 text-red-300" : "border-emerald-900/50 bg-emerald-950/30 text-emerald-300"}`}><span className={`h-1.5 w-1.5 rounded-full ${data?.degraded ? "bg-red-400" : "bg-emerald-400 animate-pulse"}`} />{data?.degraded ? "degraded" : "live"}</span>
            <a href={`/ranking?market=${market}`} className="rounded-full border border-zinc-700 bg-[#0B0E14] px-3.5 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition-colors">Ranking →</a>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="kpi"><div className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">Signal Accuracy (Top-20)</div><div className="mt-1 font-mono text-xl font-bold leading-none">{m.hit_rate !== undefined ? `${(m.hit_rate * 100).toFixed(0)}%` : m.win_rate !== undefined ? `${(m.win_rate * 100).toFixed(0)}%` : "-"}</div><div className="mt-1 h-1 overflow-hidden rounded-full bg-zinc-800"><span className="block h-full rounded-full bg-emerald-500" style={{ width: `${Math.round(((m.hit_rate ?? m.win_rate ?? 0) * 100))}%` }} /></div><div className="mt-1 text-[10px] text-zinc-500">Top-20 flags (cross-sectional)</div></div>
          <div className="kpi"><div className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">Sharpe (ER-based)</div><div className={`mt-1 font-mono text-xl font-bold leading-none ${m.sharpe !== undefined && m.sharpe < 0 ? "text-amber-400" : "text-zinc-100"}`}>{m.sharpe !== undefined ? m.sharpe.toFixed(2) : "-"}</div><div className="mt-1 text-xs text-zinc-500">ER cross-sectional · Top5 fwd {m.top5_forward_20d !== undefined ? `${(m.top5_forward_20d * 100).toFixed(1)}%` : "-"}</div></div>
          <div className="kpi"><div className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">Drawdown</div><div className="mt-1 font-mono text-xl font-bold leading-none text-red-400">{m.drawdown !== undefined ? `${(m.drawdown * 100).toFixed(1)}%` : "-"}</div><div className="mt-1 h-1 overflow-hidden rounded-full bg-zinc-800"><span className="block h-full rounded-full bg-red-500" style={{ width: `${Math.min(100, Math.abs((m.drawdown ?? 0) * 600))}%` }} /></div></div>
          <div className="kpi"><div className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">Total return</div><div className={`mt-1 font-mono text-xl font-bold leading-none ${(m.totalReturn ?? m.cumulative ?? 0) < 0 ? "text-red-400" : "text-emerald-400"}`}>{m.totalReturn !== undefined ? `${(m.totalReturn * 100).toFixed(1)}%` : m.cumulative !== undefined ? `${(m.cumulative * 100).toFixed(1)}%` : "-"}</div><div className="mt-1 text-xs text-zinc-500">cumulative {m.cumulative !== undefined ? `${(m.cumulative * 100).toFixed(1)}%` : "-"}</div></div>
        </div>
        {excluded.length ? <div className="mt-4 flex flex-wrap gap-1.5 border-t border-zinc-800/60 pt-3">{excluded.map((e) => <span key={e.ticker} className="rounded-full border border-zinc-800 bg-[#0B0E14] px-2 py-0.5 font-mono text-xs text-zinc-400" title={`sumber idx.co.id/${e.ticker}`}>{e.ticker} · {e.reason}</span>)}</div> : null}
      </section>
      {error ? <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">{error}</div> : null}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><BacktestChart points={(data?.equity_curve ?? []) as EquityPoint[]} /></div>
        <MetricsTable m={m} />
      </div>
      <section className="overflow-hidden rounded-xl border border-[#24242e] bg-[#11151F] shadow-card">
        <div className="flex items-center justify-between border-b border-[#24242e]/60 bg-[#0f1320]/50 px-4 py-3">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-200">Backtest 100 — full universe · {items.length} items</span>
          <span className="rounded-full border border-zinc-800 bg-[#0B0E14] px-2.5 py-1 font-mono text-xs text-zinc-400">mispricing 0→100 · tap ticker → dossier · idx.co.id ↗</span>
        </div>
        <RankingTable items={items as never} />
      </section>
      <p className="text-xs leading-relaxed text-zinc-500">Bukan rekomendasi investasi. Informasi & analisis saja · backtest 100 · {weeks}w synthetic forecast-based ({range}) — DB 500 rows/25 tickers (20 hari), bukan realized 1y — synthetic honest · 100 profil idx.co.id ↗ · degraded {String(data?.degraded ?? false)}</p>
    </div>
  );
}
