# 00 — Wajib Baca Sebelum Implement (SEITH)

> **Aturan:** Setiap T1/T2 **WAJIB** baca file ini + 4 file `01`–`05` **sebelum** `Understand → Implement`. Skill `seith-market-intelligence` auto-load file ini. PM `seith-pm` veto PR jika tidak ada jejak baca.

## Kenapa Harus Berpikir, Bukan Sekedar Implement
SEITH menang bukan karena dashboard cantik, tapi karena **derived insight explainable yang bisa dipakai hari ini**. Tanpa catatan ini AI akan bikin `display mentah + skor tempel` = **FAIL Track 3 Reveal**.

## 5 Catatan — Baca Urut

1. [`01-tujuan-seith.md`](01-tujuan-seith.md) — Tujuan win, 40/30/30, hybrid CLI+Web
2. [`02-kronos-kritis.md`](02-kronos-kritis.md) — Kronos 102.3M: tokenizer, 512 ctx, jebakan
3. [`03-market-intelligence-gate.md`](03-market-intelligence-gate.md) — Gate mati-hidup MI
4. [`04-arsitektur-kritis.md`](04-arsitektur-kritis.md) — Keputusan sulit: cache, 9router, market
5. [`05-anti-patterns.md`](05-anti-patterns.md) — 12 kesalahan yang harus dikoreksi

## Ritual Pre-Implement (WAJIB jawab 3 pertanyaan sebelum code)

```text
1) Fitur ini lolos gate MI mana? (scores/rankings/anomaly/comparative/research — bukan display)
2) Jebakan apa yang relevan? (Kronos 512 / cleansing / cache market key / 9router degraded)
3) Test apa yang akan FAIL jika salah? (cleansing exclude / degraded flag / breakdown / envelope)
```

Jawab di PR description atau komentar handoff. Tanpa 3 jawaban → `seith-pm` veto.

## Branch = Wajib (AGENTS §8b)

Setiap implement/test **harus** di branch `handoff/NN-topic` (+ `t1`/`t2` jika paralel 2 terminal) via `git worktree add ../seith-wt/handoff-NN -b handoff/NN-topic`. No direct commit ke `main`. PM enforce gate `cargo fmt --check && cargo clippy -- -D warnings && cargo test`.

## Cara Pakai

- T1/T2: baca `00` → loncat ke file relevan per task (mis. sentuh Kronos → `02`, sentuh cache → `04` + `05`).
- Reviewer (`rust-reviewer`, `security-reviewer`): cek apakah implementasi melanggar anti-pattern `05`.

## Referensi

- `AGENTS.md §1a, §4, §8b` — mandat, Tier-0, branch/worktree
- `docs/prd.md §5`, `docs/spec.md §2`, `docs/tdd-plan.md §2`
- `.opencode/skills/seith-market-intelligence/SKILL.md` — SSOT
