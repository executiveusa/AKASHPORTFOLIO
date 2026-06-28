CREATE TABLE tenants (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$'),
  name            text NOT NULL,
  locale_default  text NOT NULL DEFAULT 'es' CHECK (locale_default IN ('en','es')),
  branding_json   jsonb NOT NULL DEFAULT '{}',
  owner_email     text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Kupuri Media is tenant 1 — always seeded
INSERT INTO tenants (id, slug, name, locale_default, owner_email)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'kupuri',
  'Kupuri Media',
  'es',
  'ivette@kupuri.media'
);
