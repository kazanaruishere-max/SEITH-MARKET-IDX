import { z } from "zod";

const envSchema = z.object({ success: z.boolean(), data: z.unknown().optional(), error: z.object({ code: z.string(), message: z.string() }).optional(), pagination: z.object({ page: z.number(), pageSize: z.number(), total: z.number() }).optional() });
const rankingItem = z.object({ ticker: z.string(), name: z.string().optional(), sector: z.string().optional(), market: z.string(), close: z.number().optional(), mispricingScore: z.number(), components: z.unknown().optional(), anomalyFlag: z.boolean().optional(), anomalyZ: z.number().optional(), rank: z.number().optional() });
export const rankingDataSchema = z.object({ market: z.string(), sector: z.string().nullable().optional(), sort: z.string().optional(), order: z.string().optional(), items: z.array(rankingItem), disclaimer: z.string() });
export const anomaliesDataSchema = z.object({ market: z.string(), sector: z.string().nullable().optional(), minZ: z.number().optional(), items: z.array(rankingItem), disclaimer: z.string() });
const backtestItem = z.object({ ticker: z.string(), market: z.string(), sector: z.string().optional(), close: z.number().optional(), mispricingScore: z.number(), components: z.unknown().optional(), anomaly: z.unknown().optional(), rank: z.number().optional() });
export const backtestDataSchema = z.object({ as_of: z.string().optional(), universe: z.number(), market: z.string(), items: z.array(backtestItem), metrics: z.unknown().optional(), equity_curve: z.array(z.unknown()).optional(), excluded: z.array(z.unknown()).optional(), degraded: z.boolean().optional(), disclaimer: z.string() });
export const scoreDataSchema = z.object({ ticker: z.string(), market: z.string(), mispricingScore: z.number(), components: z.unknown().optional(), anomaly: z.unknown().optional(), disclaimer: z.string() });
export const dossierDataSchema = z.object({ ticker: z.string(), market: z.string(), lang: z.string().optional(), score: z.number().optional(), breakdown: z.unknown().optional(), peerComparison: z.array(z.unknown()).optional(), kronos: z.unknown().optional(), research: z.unknown().optional(), anomaly: z.unknown().optional(), sector: z.string().optional(), rank: z.number().optional(), disclaimer: z.string() });

function baseUrl() {
  const env = process.env.NEXT_PUBLIC_API_BASE;
  if (env) return env;
  if (typeof window === "undefined") return "http://127.0.0.1:8181";
  return "";
}

async function fetchEnvelope<T>(path: string, schema: z.ZodType<T>): Promise<{ data: T; pagination?: { page: number; pageSize: number; total: number } }> {
  const r = await fetch(`${baseUrl()}${path}`, { cache: "no-store" });
  const j = await r.json();
  const e = envSchema.parse(j);
  if (!e.success) throw new Error((e.error?.message ?? "request failed") + ` [${e.error?.code ?? "UNKNOWN"}]`);
  return { data: schema.parse(e.data), pagination: e.pagination as never };
}

export async function fetchRanking(p: { market?: string; sector?: string; sort?: string; order?: string; page?: number; pageSize?: number } = {}) {
  const q = new URLSearchParams();
  if (p.market) q.set("market", p.market);
  if (p.sector) q.set("sector", p.sector);
  if (p.sort) q.set("sort", p.sort);
  if (p.order) q.set("order", p.order);
  if (p.page) q.set("page", String(p.page));
  if (p.pageSize) q.set("pageSize", String(p.pageSize));
  const qs = q.toString();
  return fetchEnvelope(`/api/v1/ranking${qs ? `?${qs}` : ""}`, rankingDataSchema);
}
export async function fetchAnomalies(p: { market?: string; sector?: string; minZ?: number; page?: number; pageSize?: number } = {}) {
  const q = new URLSearchParams();
  if (p.market) q.set("market", p.market);
  if (p.sector) q.set("sector", p.sector);
  if (p.minZ !== undefined) q.set("minZ", String(p.minZ));
  if (p.page) q.set("page", String(p.page));
  if (p.pageSize) q.set("pageSize", String(p.pageSize));
  const qs = q.toString();
  return fetchEnvelope(`/api/v1/anomalies${qs ? `?${qs}` : ""}`, anomaliesDataSchema);
}
export async function fetchBacktest(market?: string) {
  const qs = market ? `?market=${encodeURIComponent(market)}` : "";
  return fetchEnvelope(`/api/v1/backtest${qs}`, backtestDataSchema);
}
export async function fetchScore(ticker: string, market?: string) {
  const qs = market ? `?market=${encodeURIComponent(market)}` : "";
  return fetchEnvelope(`/api/v1/tickers/${encodeURIComponent(ticker)}/score${qs}`, scoreDataSchema);
}
export async function fetchDossier(ticker: string, market?: string, format: string = "json", lang: string = "id") {
  const q = new URLSearchParams();
  if (market) q.set("market", market);
  if (format) q.set("format", format);
  if (lang) q.set("lang", lang);
  if (format === "pdf") {
    const r = await fetch(`${baseUrl()}/api/v1/tickers/${encodeURIComponent(ticker)}/dossier?${q}`, { cache: "no-store" });
    if (!r.ok) throw new Error(`dossier pdf ${r.status}`);
    return r.blob();
  }
  return fetchEnvelope(`/api/v1/tickers/${encodeURIComponent(ticker)}/dossier?${q}`, dossierDataSchema);
}
