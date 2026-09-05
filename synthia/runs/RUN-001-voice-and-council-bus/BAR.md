# Bar — RUN-001
status: candidates-proposed

## Voice track (pick one)
1. **ElevenLabs Conversational AI demo (Spanish)** — same job (agent speaks Spanish to an operator); fetchable on elevenlabs.io; measure: blind authenticity (3 native CDMX listeners), TTFA, prosody. Tradeoff: strongest commercial reference, not Mexico-specific.
2. **Rime LiveKit demo agent** — same vendor ceiling, fetchable via `generate_integration`; measure: TTFA parity, word-timestamp fidelity. Tradeoff: proves integration quality more than voice quality.
3. **A recorded human es-MX briefing** (owner records 40 s reading the same script) — the honest ceiling; measure: blind preference. Tradeoff: we will lose on first rounds; useful as a north star, harsh as a release bar.
Recommendation: 1 for release bar, 3 kept as north star.

## Visual track (pick one)
1. **Apple Intelligence Siri glow (iOS 18 demo video)** — voice-reactive visual that never decorates; fetchable video; measure: reaction latency to speech, restraint, legibility of state. Recommended.
2. **Linear.app product motion** — restraint and system coherence; fetchable live site; measure: motion-with-meaning, 60 fps.
3. **Refik Anadol "Unsupervised" footage** — data-driven, expressive; fetchable video; measure: emotional distinctiveness. Tradeoff: risks decoration.

## Measurable half (applies regardless)
TTFA live ≤ 1.5 s P50 (REST fallback) / ≤ 0.6 s (WS); sphere reaction ≤ 300 ms after event; 60 fps desktop, ≥ 30 fps iPhone 13; zero 500s with token removed.
