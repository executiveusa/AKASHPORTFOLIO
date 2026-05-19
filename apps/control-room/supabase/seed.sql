-- ============================================================
-- seed.sql — Safe baseline seed data. No secrets.
-- ============================================================

-- ── Seed workflow registry ────────────────────────────────────
insert into workflow_registry (id, name, description, provider, high_risk, active)
values
  ('wf_content_weekly',      'Contenido semanal',       'Genera plan editorial semanal para redes.',               'dify', false, true),
  ('wf_paid_campaign_publish','Publicar campaña pagada', 'Publica activos con impacto externo y gasto.',            'dify', true,  true),
  ('wf_research_latam',      'Investigación LATAM',     'Ciclo de investigación de mercado LATAM.',                'dify', false, true),
  ('wf_daily_brief',         'Resumen diario',          'Genera resumen diario de actividad.',                     'dify', false, true)
on conflict (id) do update
  set name = excluded.name,
      description = excluded.description,
      updated_at = now();

-- ── Seed agents ───────────────────────────────────────────────
insert into agents (id, name, role, capabilities, risk_level, status)
values
  ('synthia-prime',  'Synthia Prime',   'orchestrator',  '{"read","status","search"}', 'low',    'active'),
  ('fany-instagram', 'Fany Instagram',  'social',        '{"social","read"}',          'medium', 'active'),
  ('fany-linkedin',  'Fany LinkedIn',   'social',        '{"social","read"}',          'medium', 'active'),
  ('fany-tiktok',    'Fany TikTok',     'social',        '{"social","read"}',          'medium', 'active'),
  ('ivette-voice',   'Ivette Voice',    'voice',         '{"read","status"}',          'low',    'active'),
  ('merlina',        'Merlina',         'research',      '{"search","read"}',          'low',    'active'),
  ('morpho',         'Morpho',          'design',        '{"read","write"}',           'medium', 'active'),
  ('ralphy',         'Ralphy',          'analytics',     '{"read","status"}',          'low',    'active'),
  ('clandestino',    'Clandestino',     'intelligence',  '{"search","read"}',          'medium', 'active'),
  ('indigo',         'Indigo',          'strategy',      '{"read","search"}',          'low',    'active'),
  ('alex',           'Alex',            'assistant',     '{"read","status","search"}', 'low',    'active'),
  ('cazadora',       'Cazadora',        'scout',         '{"search","read"}',          'low',    'active'),
  ('forjadora',      'Forjadora',       'builder',       '{"write","deploy"}',         'high',   'active'),
  ('seductora',      'Seductora',       'engagement',    '{"social","read"}',          'medium', 'active'),
  ('consejo',        'Consejo',         'council',       '{"read","status"}',          'low',    'active'),
  ('dr-economia',    'Dr Economia',     'economics',     '{"search","read"}',          'low',    'active'),
  ('dra-cultura',    'Dra Cultura',     'culture',       '{"search","read"}',          'low',    'active'),
  ('ing-teknos',     'Ing Teknos',      'engineering',   '{"read","write","deploy"}',  'high',   'active')
on conflict (id) do update
  set name = excluded.name,
      role = excluded.role,
      updated_at = now();

-- ── Seed A2A agent cards ──────────────────────────────────────
insert into a2a_agent_cards (id, name, role, capabilities, risk_level, active)
values
  ('synthia-prime',  'Synthia Prime',   'orchestrator',  '{"read","status","search"}', 'low',    true),
  ('alex',           'Alex',            'assistant',     '{"read","status","search"}', 'low',    true)
on conflict (id) do update
  set name = excluded.name,
      updated_at = now();
