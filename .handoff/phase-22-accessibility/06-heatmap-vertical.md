# Task 06 — Heatmap Vertical Persegi Panjang

## Goal
Ubah `apps/web/components/Heatmap100.tsx` dari strip pills kecil horizontal menjadi heatmap vertikal persegi panjang seimbang — tinggi dominan, lebar proporsional, setiap sektor persegi panjang vertikal, cell stock persegi panjang vertikal juga, tinggi heatmap >=400px, tetap Bloomberg #0B0E14.

## Context
- SSOT: `apps/web/components/Heatmap100.tsx` treemap 5 sektors FINANCE/ENERGY/CONSUMER/INFRA/OTHER padded 100 + `apps/web/app/page.tsx` Hero + `research/backtest-100.json 296c` + `tailwind.config.js bloomberg tokens`
- Masalah [Image 1]: 5 kolom horizontal pills kekecilan, cell 8-10px tidak terbaca, tidak seperti heatmap vertikal beneran
- Branch: `handoff/22-accessibility` worktree `../seith-wt/handoff-22` — Z2 `apps/web` only
- Dependensi: 01-web-bloomberg-polish done

## Scope In / Out
In: `apps/web/components/Heatmap100.tsx` (vertikal layout) + `apps/web/app/page.tsx` if wrapper height + `apps/web/tailwind.config.js` if aspect util
Out: `company-profiles` (07), `kronos verify` (08), `README deep` (09), any Rust crate

## Todo
- [ ] `todowrite in_progress` before; `completed` only after Verify hijau + Block

## Bagian — Surgical
| Bag | File | Fn/Struct | Acceptance | Test FAIL |
|---|---|---|---|---|
| a | `Heatmap100.tsx` | treemap vertikal | `grid grid-cols-2 lg:grid-cols-5 gap-3` tidak `flex` horizontal only; per sektor `aspect-[3/4] min-h-[320px] flex-col` vertikal persegi panjang; header `sector + avg 68.6` sticky top | grid-cols-1 horizontal fail |
| b | `Heatmap100.tsx` | cell persegi panjang vertikal | cell `aspect-[2/3] min-h-[52px] min-w-[52px] rounded-[6px] text-[9px] JetBrains Mono tabular` persegi panjang vertikal, bukan kotak kecil; color `0->red 239,68,68 ->amber->emerald 0-100` clamped; tap -> dossier | cell 10px fail |
| c | `Heatmap100.tsx` | responsive + a11y | `overflow-y-auto + scrollbar-thin` per sektor; `aria-label ticker sector score`; `title ticker score`; height container `min-h-[420px]` desktop, stack 2-cols mobile | height <400px fail |
| d | `Heatmap100.tsx` | factual wiring | color mapping `mispricingScore 0-100` real, no fake; tooltip shows `ticker score close`; link `/dossier/{ticker}` | fake score fail |

## Deliverables
- `GET /` heatmap height >=420px vertikal 5 sektor persegi panjang + cell persegi panjang vertikal >=52px + score color red->emerald visible
- `pnpm lint 0 && typecheck 0 && build 4 routes` + no `bg-white` flash

## Verification
```
pnpm --dir apps/web build | grep -c Route
curl -s http://127.0.0.1:3000/ | grep -c "HEATMAP"
# visual: tinggi heatmap >=420px, 5 sektor vertikal persegi panjang, cell persegi panjang vertikal
```

## Peran + Skill
| Peran | Eksekutor | Skill | Sub-agent |
|---|---|---|---|
| T1 | sub-agent | `seith-market-intelligence` + `seith-design` + `design-taste-frontend` | `seith-design-reviewer` |
