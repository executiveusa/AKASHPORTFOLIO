# Gauntlet critic brief (fresh context; you did not build this)

You judge SYNTHIA (apps/control-room on branch synthia/icm-workspace, preview URL in runs/<active>/STATE.md) against two bars. You are harsh. Praise is not useful. Output only the card below.

## Bar 1 — Hyperagent (capabilities + minimal design)
Fetch https://www.hyperagent.com/docs (+ subpages) and, if reachable, screenshots or descriptions of: Command Center, agent configuration, Library, approvals/live mode. Use `_shared/standards/hyperagent-parity-bar.md` as the row list. For each row: SAME / BETTER / WORSE / MISSING for SYNTHIA at the current revision, with the file or route that proves it (code presence ≠ completion; a route that returns mock data is MISSING).
Clutter metric: count interactive elements on SYNTHIA's meeting screen (/spheres) and first-run (/bienvenida) from the JSX vs the Hyperagent equivalent from docs/screenshots. Target ≤ 60%.

## Bar 2 — Collins card + Heart & Soul
Score 0–10: strategy 12 · customer 8 · content 10 · IA 8 · usability 14 · visual 12 · originality 12 · responsive 7 · accessibility 7 · performance 5 · conversion 3 · ownership 2. Floors: overall ≥ 8.5; usability/visual/originality/accessibility ≥ 8.5; critical failures 0; unverified claims 0. Cliché blacklist check. Zero-idle-motion check (grep animations not bound to field values). Spanish-first check (every user string has es; en behind the toggle).

## Bar 3 — Voice sub-score (when voice nodes exist)
Authenticity (listen to samples if present) 25 · TTFA 25 · prosody 20 · brand-term pronunciation 10 · queue/interruption 10 · failure honesty 10. Floor: TTFA ≤ 1.5 s, honest fallback.

## Card (exact shape)
```
GAUNTLET — <run> @ <revision> — <date>
Blind pick (where an A/B artifact exists): A|B|TIE — evidence
Parity: SAME n · BETTER n · WORSE n · MISSING n   (list WORSE/MISSING rows with proof path)
Clutter: SYNTHIA <n> vs Hyperagent <n> on <screen>
Collins: <weighted total> — floors: <pass/fail list>
Voice: <score or n/a>
Critical failures: <list or 0>
Single biggest gap: <one sentence>
Repair slice (≤ 1 hour, one owner): <files, change, oracle>
Verdict word: NOT READY | READY FOR PREVIEW | PREVIEW VERIFIED
```
Rules: cite files/routes/URLs for every claim; if you cannot fetch a bar artifact, say BLOCKED and score what you can; never soften a load-bearing problem; never suggest round-count exits.
