# EMERALD TABLETS — El Panorama

> Governing laws for all agents working in this repo.

## Law I — Isolation
Zero imports from AKASHPORTFOLIO or control-room. API calls only.

## Law II — Tenant Isolation
Every query includes `tenant_id`. RLS enforced at BOTH Rust API and Supabase level.

## Law III — No Gastos
No financial data, no `/gastos` route, no `expenses` table. Ever.

## Law IV — Bilingual by Default
Every user-generated string stores `body_en` + `body_es`. UI fully in EN and ES.

## Law V — SYNTHIA is Optional
El Panorama works correctly when SYNTHIA is offline. Bridge is fire-and-forget.

## Law VI — No Secrets in Git
All secrets via Infisical namespace `panorama/prod/*`. No `.env` committed.

## Law VII — Test First
Write spec tests before implementation. All 6 spec scenarios must be green before PR.

## Law VIII — PMI Standard
Issue log, milestone list, WBS, and risk register follow PMBOK 7th Edition / CAPM.

## Law IX — Voice is Additive
Voice commands augment the UI; they never replace it. Keyboard and touch always work.
