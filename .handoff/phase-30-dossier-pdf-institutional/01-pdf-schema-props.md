# Task 01 — PDF Schema & Props Enrichment

## Objective
Memperluas interface `PdfDossier` di frontend agar tidak hanya membawa angka ringkas, tetapi juga membawa metadata profil perusahaan resmi IDX (`name`, `desc`, `close`, `rank`, `sector`, `anomaly`).

## Changes
1. `apps/web/components/DossierPDF.tsx`:
   - Perbarui tipe `PdfDossier`:
     ```ts
     export type PdfDossier = {
       ticker: string;
       name?: string;
       desc?: string;
       sector?: string;
       rank?: number | null;
       close?: number;
       market: string;
       lang?: string;
       score?: number;
       breakdown?: {
         expected_return: number;
         anomaly_z: number;
         quality_value: number;
         sector_mom: number;
       };
       peerComparison?: { ticker: string; score: number; market: string; qvDistance?: number }[];
       kronos?: {
         forecastReturn?: number;
         volatility?: number;
         chartPoints?: { date: string; value: number; upper: number; lower: number }[];
       };
       research?: { fundamentalMemo?: string; technicalMemo?: string; synthesizerMemo?: string };
       anomaly?: { z?: number; flag?: boolean; reason?: string };
       degraded?: boolean;
       disclaimer: string;
     };
     ```
2. `apps/web/app/dossier/[ticker]/page.tsx`:
   - Teruskan `name: prof?.name`, `desc: prof?.desc`, `sector: data.sector ?? prof?.sector`, `rank: data.rank`, `close: data.close`, `anomaly: data.anomaly` ke prop `dossier` pada `<DossierClient />`.
3. `apps/web/app/dossier/[ticker]/DossierClient.tsx`:
   - Sinkronisasi tipe `PdfDossier` yang di-import dari `@/components/DossierPDF`.
