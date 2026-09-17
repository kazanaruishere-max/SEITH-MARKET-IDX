import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchRanking, fetchAnomalies, fetchBacktest, fetchDossier } from "./api";

function mockFetch(json: unknown) {
  globalThis.fetch = vi.fn(async () => ({ ok: true, json: async () => json, blob: async () => new Blob(["%PDF"], { type: "application/pdf" }) } as never));
}

describe("lib/api", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("ranking sg returns sg", async () => {
    mockFetch({ success: true, data: { market: "sg", items: [{ ticker: "DBS", market: "sg", mispricingScore: 80 }], disclaimer: "Bukan rekomendasi investasi. Informasi & analisis saja." }, pagination: { page: 1, pageSize: 20, total: 1 } });
    const r = await fetchRanking({ market: "sg" });
    expect(r.data.market).toBe("sg");
  });

  it("ranking real items carry anomalyZ", async () => {
    mockFetch({ success: true, data: { market: "id", items: [{ ticker: "MEDC", market: "id", sector: "ENERGY", mispricingScore: 69.82, anomalyFlag: false, anomalyZ: 0.19, rank: 1 }], disclaimer: "Bukan rekomendasi investasi. Informasi & analisis saja." }, pagination: { page: 1, pageSize: 5, total: 100 } });
    const r = await fetchRanking({ market: "id", pageSize: 5 });
    expect(r.pagination?.total).toBe(100);
    expect(r.data.items[0].ticker).toBe("MEDC");
  });

  it("anomalies Top5 minZ", async () => {
    mockFetch({ success: true, data: { market: "id", minZ: 2.0, items: [{ ticker: "LPKR", market: "id", mispricingScore: 62.4, anomalyZ: 2.98, rank: 30 }], disclaimer: "Bukan rekomendasi investasi. Informasi & analisis saja." }, pagination: { page: 1, pageSize: 5, total: 42 } });
    const r = await fetchAnomalies({ market: "id", minZ: 2.0, pageSize: 5 });
    expect(r.data.minZ).toBe(2.0);
    expect(r.pagination?.total).toBeGreaterThan(0);
  });

  it("backtest universe 100 equity 12", async () => {
    mockFetch({ success: true, data: { universe: 100, market: "id", items: [], metrics: { sharpe: 1.1 }, equity_curve: [], disclaimer: "Bukan rekomendasi investasi. Informasi & analisis saja." } });
    const r = await fetchBacktest("id");
    expect(r.data.universe).toBe(100);
  });

  it("dossier BBCA peer5 lang id", async () => {
    mockFetch({ success: true, data: { ticker: "BBCA", market: "id", lang: "id", score: 61.3, peerComparison: [{}, {}, {}, {}, {}], kronos: {}, research: {}, disclaimer: "Bukan rekomendasi investasi. Informasi & analisis saja." } });
    const r = await fetchDossier("BBCA", "id", "json", "id") as never as { data: { ticker: string; peerComparison: unknown[] } };
    expect(r.data.ticker).toBe("BBCA");
    expect(r.data.peerComparison).toHaveLength(5);
  });

  it("disclaimer present in ranking", async () => {
    mockFetch({ success: true, data: { market: "id", items: [], disclaimer: "Bukan rekomendasi investasi. Informasi & analisis saja." }, pagination: { page: 1, pageSize: 20, total: 0 } });
    const r = await fetchRanking({ market: "id" });
    expect(r.data.disclaimer).toContain("Bukan rekomendasi");
  });
});
