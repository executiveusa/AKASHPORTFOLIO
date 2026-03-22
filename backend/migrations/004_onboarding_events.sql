-- ============================================================
-- Migration 004: Onboarding Events
-- Viral-scale funnel tracking for the Kupuri onboarding flipbook.
--
-- Design choices:
--   • BRIN index on created_at — much smaller than B-tree for
--     append-only time-series; handles billions of rows.
--   • session_id is client-generated UUID (no auth required).
--   • ip_hash: SHA-256(ip + salt) — no PII stored (Tablet VII).
--   • event_type is an enum — prevents injection / typos.
--   • No foreign keys — insert speed matters more than integrity
--     for viral-scale analytics.
-- ============================================================

-- Event type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'onboarding_event_type') THEN
    CREATE TYPE onboarding_event_type AS ENUM (
      'view',
      'stage_change',
      'lang_toggle',
      'complete'
    );
  END IF;
END$$;

-- Main events table
CREATE TABLE IF NOT EXISTS onboarding_events (
  id          UUID        NOT NULL DEFAULT gen_random_uuid(),
  session_id  TEXT        NOT NULL CHECK (char_length(session_id) BETWEEN 1 AND 36),
  event_type  onboarding_event_type NOT NULL,
  stage       SMALLINT    CHECK (stage BETWEEN 0 AND 3),
  lang        CHAR(2)     NOT NULL DEFAULT 'es' CHECK (lang IN ('es','en')),
  ip_hash     CHAR(64),                          -- SHA-256 hex, nullable if unknown
  ts          TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

-- Index strategy for scale
CREATE INDEX IF NOT EXISTS idx_onboarding_events_created_brin
  ON onboarding_events USING BRIN (created_at) WITH (pages_per_range = 128);

CREATE INDEX IF NOT EXISTS idx_onboarding_events_session
  ON onboarding_events (session_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_events_event_type
  ON onboarding_events (event_type);

-- Rolling monthly partition (covers first 3 months of growth)
CREATE TABLE IF NOT EXISTS onboarding_events_2026_01
  PARTITION OF onboarding_events
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE IF NOT EXISTS onboarding_events_2026_02
  PARTITION OF onboarding_events
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE IF NOT EXISTS onboarding_events_2026_03
  PARTITION OF onboarding_events
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE TABLE IF NOT EXISTS onboarding_events_2026_04
  PARTITION OF onboarding_events
  FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

CREATE TABLE IF NOT EXISTS onboarding_events_2026_05
  PARTITION OF onboarding_events
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE TABLE IF NOT EXISTS onboarding_events_2026_06
  PARTITION OF onboarding_events
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE TABLE IF NOT EXISTS onboarding_events_future
  PARTITION OF onboarding_events
  FOR VALUES FROM ('2026-07-01') TO (MAXVALUE);

-- Convenience view: conversion funnel
CREATE OR REPLACE VIEW onboarding_funnel AS
SELECT
  date_trunc('day', created_at)                              AS day,
  COUNT(DISTINCT session_id)
    FILTER (WHERE event_type = 'view')                       AS views,
  COUNT(DISTINCT session_id)
    FILTER (WHERE event_type = 'stage_change' AND stage >= 1) AS reached_stage_1,
  COUNT(DISTINCT session_id)
    FILTER (WHERE event_type = 'stage_change' AND stage >= 2) AS reached_stage_2,
  COUNT(DISTINCT session_id)
    FILTER (WHERE event_type = 'stage_change' AND stage = 3)  AS reached_stage_3,
  COUNT(DISTINCT session_id)
    FILTER (WHERE event_type = 'complete')                    AS completed,
  COUNT(DISTINCT session_id)
    FILTER (WHERE event_type = 'lang_toggle' AND lang = 'en') AS toggled_to_en,
  ROUND(
    100.0 * COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'complete')
    / NULLIF(COUNT(DISTINCT session_id) FILTER (WHERE event_type = 'view'), 0),
    1
  )                                                          AS completion_pct
FROM onboarding_events
GROUP BY 1
ORDER BY 1 DESC;

COMMENT ON TABLE onboarding_events IS 'Viral-scale onboarding funnel events — no PII stored';
COMMENT ON COLUMN onboarding_events.ip_hash IS 'SHA-256(ip + salt): privacy-safe dedup signal';
COMMENT ON COLUMN onboarding_events.session_id IS 'Client-side crypto.randomUUID(), reused per page load';
