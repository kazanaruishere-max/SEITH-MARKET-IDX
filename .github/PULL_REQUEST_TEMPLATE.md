# PR — SEITH

## Ritual 3 Pertanyaan (WAJIB dari `docs/notes/00-readme.md`)
- [ ] 1) Lolos gate MI mana? (scores/rankings/anomaly/comparative/research — bukan display)
- [ ] 2) Jebakan apa yang relevan? (Kronos 512 / cleansing / cache market key / 9router degraded)
- [ ] 3) Test apa yang akan FAIL jika salah? (cleansing exclude / degraded flag / breakdown / envelope)

## Handoff & Branch
- Handoff: `handoff/NN-topic` — Branch: `handoff/NN-topic` via `git worktree add ../seith-wt/handoff-NN -b handoff/NN-topic`
- [ ] No direct commit ke `main`

## Gate (paste output nyata, no fabrikasi)
```
cargo fmt --check → 
cargo clippy -- -D warnings → 
cargo test -- --nocapture → 
uv run pytest -q (jika sidecar) → 
pnpm lint/typecheck (jika FE) → 
```

## Accountability Block
```
✅ Terverifikasi: <apa> + <command> → <output>
⚠️ Belum: <asumsi>
🔻 Risiko: <1-2> — deteksi: <cara>
```

## Checklist
- [ ] `disclaimer` tiap insight (`Bukan rekomendasi investasi`)
- [ ] `excluded:[{ticker,reason}]` jika cleansing
- [ ] `market` enum `Id|Sg` benar
- [ ] `docs/*` sinkron (no drift)
- [ ] PM `seith-pm` gate PASS
- [ ] Anti-slop: `no-ai-slop` detect pass untuk `README`/`docs/*.md` prose + `dossier` (banned: delve/leverage/robust/It's not X it's Y/colon reveal/em-dash) — Tier-1 warn H1-H4, hard fail H5
- [ ] Design taste: `apps/web` tidak template generik (`design-taste-frontend` atau `high-end-visual-design` checked)
