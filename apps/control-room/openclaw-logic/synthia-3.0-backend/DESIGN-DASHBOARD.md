# Synthia 3.0 Backend Dashboard Design

This document outlines the planned backend features and data flows for the Synthia 3.0 user dashboard. Note that the front‑end (Kupui media) is separate and will consume the following services; backend changes should not touch any front‑end code.

## Goals

- Provide a secure authenticated interface for users to interact with Synthia 3.0 features.
- Support both English and Spanish locales; translations are stored in `translations.ts` and must be served appropriately by the front end.
- Keep all backend logic inside this folder (`apps/control-room/openclaw-logic/synthia-3.0-backend/src`).

## Core API Endpoints

1. **`GET /api/profile`**
   - Returns the authenticated user's profile and settings.
   - Includes `locale` field (`en` or `es`).

2. **`POST /api/generate-hero`**
   - Calls existing `generateHeroImage()` service.
   - Accepts optional prompt overrides.
   - Responds with base64 image data.

3. **`GET /api/usage`**
   - Returns usage statistics (tokens, images generated, etc.) for the current month.

4. **`POST /api/translate`**
   - Utility endpoint for ad-hoc translation using `translations.ts` map.
   - Accepts `{ key: string, locale: 'en'|'es' }` and returns translated string.

5. **`POST /api/settings`**
   - Update user preferences (e.g. default locale, api keys, etc.).

## Authentication and Security

- Use JWT tokens issued at login (front end handles login flow).
- Protect all endpoints with middleware that validates the token.
- Environment variables such as `GEMINI_API_KEY` stored in `.env.local`.

## Directory Structure Changes

- Add new `src/api/` directory with route handlers.
- Keep service implementations in `src/services/` (existing `imageGenerator.ts` is an example).
- Add tests for each endpoint in `tests/` (can follow pattern of `test_synthia_api.py`).

## Localization

- `translations.ts` already contains key/value pairs; ensure backend exposes the translations endpoint above.
- Front end will switch language based on user preference; backend need only store locale in profile.

## Staging & Commit Plan

1. Run `git add apps/control-room/openclaw-logic/` to stage the entire untracked folder.
2. Inspect for any stubbed work; add TODO comments where further development is required.
3. Commit with message: "feat(synthia-backend): add initial backend scaffolding and API design".
4. Push to remote branch (e.g. `git push origin main` or create new feature branch).

## Notes

- Do **not** modify any front-end code here; only ensure translations exist and that backend can serve locale information if needed.
- Future backend work (AI model integration, database, etc.) will build upon this skeleton.

---
*This document is read-only plan; implementers should follow these guidelines when converting to actual code.*