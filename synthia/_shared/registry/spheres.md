# Sphere registry — identity, locale, voice (single home of these facts)

| id | display | role | locale | freq | color | Rime es speaker (live) | Rime es alt (produced) | Rime en speaker | gender |
|---|---|---|---|---|---|---|---|---|---|
| synthia | SYNTHIA™ | Coordinadora General | es-MX (spa-mx) | 0.85 | #8b5cf6 | `isa` mistv3 | `rosalie` coda | `astra` mistv3 / `celeste` coda | F |
| alex | ALEX™ | Estratega Ejecutivo | es-MX (spa-mx) | 0.80 | #d4af37 | `thea` coda* | `thea` coda | `lyra` coda | F |
| cazadora | CAZADORA™ | Prospect Hunter | es-CO | 0.95 | #ef4444 | `seraphina` mistv3 | `nova` coda | `clementine` coda | F |
| forjadora | FORJADORA™ | Systems Builder | es-AR | 0.45 | #22c55e | `abril` coda | `cielo` coda | `lintel` coda | F |
| seductora | SEDUCTORA™ | Sales & Persuasion | es-CU | 0.65 | #eab308 | `frieda` coda | `mari` mistv3 (DO) | `luna` mistv3 | F |
| consejo | CONSEJO™ | Council Facilitator | es-CL | 0.25 | #1d4ed8 | `azulado` coda | `resplandor` coda | `bancroft` coda | M |
| dr-economia | DR. ECONOMÍA | Arbitrage & Finance | es-VE | 0.75 | #f97316 | `alba` coda (elder) | `cristhian` coda | `masonry` coda | M |
| dra-cultura | DRA. CULTURA | Content & CDMX Community | es-PE | 0.55 | #f43f5e | `claridad` coda | `luciana` coda | `eyre` coda | F |
| ing-teknos | ING. TEKNOS | Tech Architecture | es-PR | 0.35 | #06b6d4 | `xavier` coda | `renato` coda | `albion` coda | M |
| la-vigilante | LA VIGILANTE™ | Guardian / approval gate | es-MX (spa-mx) | 0.00 | #64748b | `rosalie` coda | — | `eyre` coda | F |

\* Mist v3 has only one Mexican speaker (`isa`); for a second live MX voice use `thea`/`rosalie` on coda (≈4 s clip latency) or stream via WS. Confirm `mari` gender/dialect via MCP before locking.

Env override pattern (unchanged): `SPHERE_<ID>_VOICE_ID` now holds a Rime speaker name; `SPHERE_<ID>_VOICE_MODEL` optional.
Language codes: MX spheres `spa-mx`; other Spanish `spa`; English `eng`.
Persona prompts: `apps/control-room/src/lib/sphere-personas.ts` (already locale-aware). Physics/visual config: `src/shared/sphere-state.ts`.
