#!/usr/bin/env python3
"""Apply auth guards to the 45 unguarded API routes in AKASHPORTFOLIO.
For each route, add the guards import (if missing) and a guard call at the
top of each exported handler function (GET/POST/PUT/PATCH/DELETE).

Public routes get a documenting comment instead of a guard.
Stripe webhook gets a comment noting it self-verifies."""
import os, re

ROOT = "/agent/workspace/AKASHPORTFOLIO/apps/control-room/src/app/api"

# classification from the triage
CLASSIFY = {
    "/api/agent-mail": "operator",
    "/api/agents/budgets": "operator",
    "/api/alex": "operator",
    "/api/alex/voice": "operator",
    "/api/arbitrage": "operator",
    "/api/assets/generate": "operator",
    "/api/auth/[...nextauth]": "public",
    "/api/auth/validate-invite": "public",
    "/api/beta": "operator",
    "/api/clients/[clientId]/pause": "operator",
    "/api/clients/[clientId]/resume": "operator",
    "/api/coach": "operator",
    "/api/council/cron": "cron",
    "/api/council/heartbeat": "cron",
    "/api/council": "admin",
    "/api/creem": "operator",
    "/api/daily-brief": "operator",
    "/api/design/dispatch": "operator",
    "/api/health": "public",
    "/api/meeting/live": "operator",
    "/api/meeting": "operator",
    "/api/meetings": "operator",
    "/api/newsletter/subscribe": "public",
    "/api/onboarding/event": "public",
    "/api/onboarding/save": "user",
    "/api/onboarding/stats": "user",
    "/api/openfang": "operator",
    "/api/panorama/expenses/ocr": "operator",
    "/api/panorama/expenses": "operator",
    "/api/panorama/projects": "operator",
    "/api/pomelli/analyze": "user",
    "/api/repos": "operator",
    "/api/revenue": "operator",
    "/api/spheres/voice": "operator",
    "/api/stream": "operator",
    "/api/telemetry": "operator",
    "/api/telemetry/stream": "operator",
    "/api/theater/stream": "operator",
    "/api/video/watch": "operator",
    "/api/voice": "operator",
    "/api/watcher": "operator",
    "/api/webhooks/stripe": "stripe",
    "/api/workers/jobs": "operator",
    "/api/workers": "operator",
    "/api/workers/verify": "operator",
}

GUARD_CALL = {
    "user":     "await requireUser();",
    "operator": "await requireOperatorOrAdmin();",
    "admin":    "await requireAdmin();",
    "cron":     "requireCron(req);",
    "webhook":  "requireWebhookSignature(req);",
}

IMPORT_LINE = "import { requireUser, requireOperatorOrAdmin, requireAdmin, requireCron, requireWebhookSignature, toErrorResponse } from '@/lib/auth/guards';"

def patch_file(path, guard_type):
    rel = path.replace(ROOT, "").replace("/route.ts", "") or "/"
    route = "/api" + rel.replace("\\", "/")
    if guard_type == "public":
        # just add a doc comment; no guard
        return ("public", 0, 0)
    if guard_type == "stripe":
        # Stripe webhooks self-verify via the Stripe signature header; add a
        # documenting comment so the audit's "none" is intentional & explained.
        with open(path, encoding="utf-8") as f:
            src = f.read()
        if "STRIPE_WEBHOOK_SELF_VERIFIED" not in src:
            marker = "// Security: guard=none is intentional — this route verifies the Stripe webhook signature via stripe.webhooks.constructEventAsync. Do not add a generic guard.\n"
            # insert after first import or at top
            lines = src.split("\n")
            last_imp = -1
            for i,l in enumerate(lines):
                if l.startswith("import "): last_imp = i
            if last_imp >= 0: lines.insert(last_imp+1, marker)
            else: lines.insert(0, marker)
            with open(path,"w",encoding="utf-8") as f:
                f.write("\n".join(lines))
        return ("stripe-documented", 0, 0)
    with open(path, encoding="utf-8") as f:
        src = f.read()
    orig = src
    added_import = 0
    added_guards = 0
    # 1. add import if not present (and if any guard symbol needed)
    needed_syms = []
    if guard_type in ("user","operator","admin","cron","webhook"):
        needed_syms.append(GUARD_CALL[guard_type].split("(")[0].replace("await ","").strip().rstrip(";"))
    if "from '@/lib/auth/guards'" not in src and "from \"@/lib/auth/guards\"" not in src:
        # insert after the last import line
        lines = src.split("\n")
        last_imp = -1
        for i,l in enumerate(lines):
            if l.startswith("import "): last_imp = i
        # build a minimal import with only the needed symbol
        sym = GUARD_CALL[guard_type].replace("await ","").split("(")[0].rstrip(";")
        imp = f"import {{ {sym}, toErrorResponse }} from '@/lib/auth/guards';"
        if last_imp >= 0:
            lines.insert(last_imp+1, imp)
        else:
            lines.insert(0, imp)
        src = "\n".join(lines)
        added_import = 1
    # 2. insert guard call + try/catch at the top of each exported handler
    call = GUARD_CALL[guard_type]
    # match: export async function NAME(req: NextRequest ...): ... {
    handler_re = re.compile(r'(export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(([^)]*)\)\s*(?::[^{]+)?\{)')
    def inject(m):
        nonlocal added_guards
        full = m.group(1)
        params = m.group(3)
        is_async = "async" in full
        reqvar = "req"
        mm = re.search(r'(\w+)\s*:', params)
        if mm: reqvar = mm.group(1)
        call2 = call.replace("req", reqvar) if guard_type in ("cron","webhook") else call
        if is_async and guard_type in ("user","operator","admin"):
            # wrap in try/catch via toErrorResponse
            body = f"  try {{ {call2} }} catch (e) {{ return toErrorResponse(e); }}\n"
        elif guard_type in ("cron","webhook"):
            body = f"  try {{ {call2} }} catch (e) {{ return toErrorResponse(e); }}\n"
        else:
            body = f"  {call2}\n"
        added_guards += 1
        return full + "\n" + body
    src = handler_re.sub(inject, src)
    if src != orig:
        with open(path, "w", encoding="utf-8") as f:
            f.write(src)
    return (guard_type, added_import, added_guards)

# walk and patch
results = []
for dp, dn, fn in os.walk(ROOT):
    for f in fn:
        if f == "route.ts":
            full = os.path.join(dp, f).replace("\\", "/")
            rel = full.replace(ROOT, "").replace("/route.ts", "") or "/"
            route = "/api" + rel
            if route in CLASSIFY:
                g = CLASSIFY[route]
                r = patch_file(full, g)
                results.append((route, r))

from collections import Counter
c = Counter(r[1][0] for r in results)
total_imports = sum(r[1][1] for r in results)
total_guards = sum(r[1][2] for r in results)
print(f"Patched {len(results)} route files")
print(f"Guard distribution: {dict(c)}")
print(f"Imports added: {total_imports}, Guard calls inserted: {total_guards}")
print("\nPer-file:")
for route,(g,ai,ag) in results:
    print(f"  {g:9} {route:42} +{ai} import, +{ag} guards")
