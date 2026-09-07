import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchRanking, fetchDossier } from "./api";

function mockFetch(json: unknown) {
  globalThis.fetch = vi.fn(async () => ({ ok: true, json: async () => json, blob: async () => new Blob(["%PDF"], { type: "application/pdf" }) } as never));
}

describe("lib/api", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("ranking sg returns sg", async () => {
    mockFetch({ success: true, data: { market: "sg", items: [{ ticker: "DBS", market: "sg", mispricingScore: 80 }], disclaimer: "Bukan rekomendasi investasi. Informasi & analisis saja." }, pagination: { page: 1, pageSize: 20, total: 1 } });
    const r = await fetchRanking({ market: "sg" });
    expect(r.data.market).toBe("sg");
  });

  it("dossier BBCA normalized fetch", async () => {
    mockFetch({ success: true, data: { ticker: "BBCA", market: "id", score: 72.5, peerComparison: [], kronos: {}, research: {}, disclaimer: "Bukan rekomendasi investasi. Informasi & analisis saja." } });
    const r = await fetchDossier("BBCA", "id", "json") as never as { data: { ticker: string } };
    expect(r.data.ticker).toBe("BBCA");
  });

  it("disclaimer present in ranking", async () => {
    mockFetch({ success: true, data: { market: "id", items: [], disclaimer: "Bukan rekomendasi investasi. Informasi & analisis saja." }, pagination: { page: 1, pageSize: 20, total: 0 } });
    const r = await fetchRanking({ market: "id" });
    expect(r.data.disclaimer).toContain("Bukan rekomendasi");
  });
});
