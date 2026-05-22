# PATCH_005 Architecture Review
Generated: 2026-05-22

## Route Coverage
- Total app routes (pages + layouts): 170
- Total API routes: 101
- New pages added this patch: 3 (docs, privacy, terms)

## Security Guard Status
### Guarded this patch (requireUser added):
- /api/dashboard
- /api/herald (GET + POST)
- /api/herald/dispatch
- /api/herald/init (requireAdmin)
- /api/income (requireOperatorOrAdmin)
- /api/analytics
- /api/spheres/chat
- /api/spheres/status
- /api/fleet
- /api/state (GET + POST + PUT)
- /api/vibe (GET + POST)

### Still unguarded (lower risk or webhook-pattern):
- /api/auth/[...nextauth] — intentional, NextAuth handler
- /api/webhooks/stripe — uses Stripe signature verification
- /api/council/cron — cron secret needed (add requireCron)
- /api/daily-brief — internal tool, low exposure
- /api/stream — SSE endpoint, revisit
- /api/meeting, /api/meetings, /api/meeting/live
- /api/panorama/expenses, /api/panorama/projects — add requireUser
- /api/spheres/voice — add requireUser
- /api/theater/stream — SSE, add requireUser
- /api/alex/route, /api/alex/voice — add requireUser
- /api/workers/* — add requireOperatorOrAdmin
- /api/clients/* — add requireOperatorOrAdmin

## Broken Links Fixed
| Link | Was | Now |
|------|-----|-----|
| Documentación | 404 | /docs — functional page |
| Privacidad | 404 | /privacy — full policy |
| Términos | 404 | /terms — full terms |

## Duplicate Footer Fixed
- Removed <Footer /> from layout.tsx (was rendering twice on 9 pages)
- Footer now lives only in individual public pages
- Synthia app pages (AppShell-based) correctly have no footer

## TypeScript
- Pre-patch errors: 200+ (no node_modules installed)
- Post-npm-install pre-patch: 2 errors
- Post-patch: 0 errors ✓

## Design Issues Noted
- /synthia/page.tsx — old purple gradient landing, conflicts with Synthia 3.0 branding
- AppShell has no mobile sidebar (responsive collapse missing)
- Several pages have "coming soon" placeholder content
- 147 stub/TODO markers remain in codebase
