# Architecture — RUN-001 (draft; finalize in 02)
## Essential path
Enter (/spheres) → Act (Iniciar consejo; pick topic) → Review (hear + read turns; spheres show who/what) → Complete (memo card; approve if La Vigilante asks) → Recover/Reuse (replay meeting; toggle EN; share memo).

## ADRs (draft)
| # | decision | alternative rejected | why |
|---|---|---|---|
| 1 | Rime primary TTS; provider chain Rime → ElevenLabs(legacy) → text | Keep ElevenLabs, buy LATAM voices | Rime has native MX/regional voices, word timestamps, MCP, sub-second mistv3 |
| 2 | Voice synthesized server-side inside the orchestrator turn and re-emitted as `voice.*` SSE events | Client fetches /api/spheres/voice per turn | one stream, no token on client, timestamps ride along, replay buffer covers late joiners |
| 3 | Client CouncilBus (zustand) owns live state; renderers are views | Fix `kind`→`type` in each component | one boss per truth; physics engine finally used; HUD/fleet/status derive from same field |
| 4 | Language is a per-user preference + header toggle; identity-preserving speaker map | Auto-detect from browser | operator intent beats heuristics; Spanish default is a product stance |
| 5 | Delete `/api/voice`, `/api/alex/voice`, `/api/theater/stream`, `avatar-voice-sync.ts` | Keep for compatibility | zero callers; islands lie about capability (subtraction test) |
| 6 | Visual territory: recommend A Observatorio; Theater3D scenes retained as meeting room | B/C | restraint + meaning; owner decides (Gate Four) |
| 7 | Voice spend enters budget ledger (RUN-005 table); until then in-memory cap in orchestrator | none | never spend uncapped |

## Data ownership
| truth | owner | mirrors |
|---|---|---|
| live meeting events | orchestrator in-memory buffer (→ council_events table RUN-002) | client bus |
| sphere identity/voice | registry/spheres.md → SPHERE_FREQUENCY_MAP + rime-voice map | env overrides |
| user voice_lang | profiles/synthia_memory preference | bus state |
| meeting memo | sphere_meetings (verify) | transcript in bus |
