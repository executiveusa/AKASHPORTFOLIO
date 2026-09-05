# Evidence
Hierarchy (strongest first): production runtime at exact revision · browser/device proof · deterministic e2e · focused tests · build/type/lint · code inspection · human report · model assertion (not proof).
Gate record: CLAIM · ORACLE · EXPECTED · EVIDENCE (timestamp, revision, output/screenshot/log path) · STATUS pending/pass/fail/blocked/stale.
Changed inputs → dependent evidence stale until rerun. Deployment existence is never proof. Failing failure-paths fail the gate.
End-state words only: NOT READY · READY FOR PREVIEW · PREVIEW VERIFIED · PRODUCTION VERIFIED.
