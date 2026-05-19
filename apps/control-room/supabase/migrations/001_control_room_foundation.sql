-- ============================================================
-- 001_control_room_foundation.sql
-- Synthia Control Room — Production Foundation Schema
-- PATCH_002_SYNTHIA_CONTROL_ROOM_PRODUCTION
-- Idempotent: safe to run multiple times.
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────
do $$ begin
  create type user_role as enum ('admin', 'operator', 'viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type agent_status as enum ('active', 'inactive', 'error');
exception when duplicate_object then null; end $$;

do $$ begin
  create type run_status as enum ('pending', 'running', 'completed', 'failed', 'cancelled', 'blocked_by_policy');
exception when duplicate_object then null; end $$;

do $$ begin
  create type approval_status as enum ('pending', 'approved', 'rejected', 'expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type risk_level as enum ('low', 'medium', 'high', 'critical');
exception when duplicate_object then null; end $$;

do $$ begin
  create type registry_status as enum ('registered', 'active', 'inactive', 'deregistered');
exception when duplicate_object then null; end $$;

-- ── profiles ─────────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  role        user_role not null default 'viewer',
  display_name text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_profiles_email on profiles(email);

-- ── agents ───────────────────────────────────────────────────
create table if not exists agents (
  id            text primary key,
  name          text not null,
  role          text,
  capabilities  text[] default '{}',
  risk_level    risk_level not null default 'low',
  status        agent_status not null default 'active',
  metadata      jsonb default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_agents_status on agents(status);

-- ── agent_runs ───────────────────────────────────────────────
create table if not exists agent_runs (
  id              uuid primary key default gen_random_uuid(),
  agent_id        text not null references agents(id) on delete cascade,
  status          run_status not null default 'pending',
  task_type       text,
  summary         text,
  result          jsonb,
  error           text,
  requested_by    text,
  correlation_id  text,
  started_at      timestamptz not null default now(),
  completed_at    timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists idx_agent_runs_agent_id on agent_runs(agent_id);
create index if not exists idx_agent_runs_status on agent_runs(status);
create index if not exists idx_agent_runs_started_at on agent_runs(started_at desc);

-- ── approvals ────────────────────────────────────────────────
create table if not exists approvals (
  id              uuid primary key default gen_random_uuid(),
  workflow_id     text not null,
  risk_level      risk_level not null default 'low',
  status          approval_status not null default 'pending',
  requested_by    text not null,
  requested_at    timestamptz not null default now(),
  decided_by      text,
  decided_at      timestamptz,
  decision_note   text,
  expires_at      timestamptz,
  metadata        jsonb default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_approvals_status on approvals(status);
create index if not exists idx_approvals_workflow_id on approvals(workflow_id);
create index if not exists idx_approvals_requested_by on approvals(requested_by);
create index if not exists idx_approvals_requested_at on approvals(requested_at desc);

-- ── workflow_registry ────────────────────────────────────────
create table if not exists workflow_registry (
  id              text primary key,
  name            text not null,
  description     text,
  provider        text not null default 'dify',
  high_risk       boolean not null default false,
  active          boolean not null default true,
  metadata        jsonb default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_workflow_registry_provider on workflow_registry(provider);
create index if not exists idx_workflow_registry_active on workflow_registry(active);

-- ── control_room_events ──────────────────────────────────────
create table if not exists control_room_events (
  id              uuid primary key default gen_random_uuid(),
  event           text not null,
  payload         jsonb not null default '{}',
  correlation_id  text,
  created_at      timestamptz not null default now()
);

create index if not exists idx_control_room_events_event on control_room_events(event);
create index if not exists idx_control_room_events_created_at on control_room_events(created_at desc);
create index if not exists idx_control_room_events_correlation_id on control_room_events(correlation_id)
  where correlation_id is not null;

-- ── a2a_agent_cards ──────────────────────────────────────────
-- A2A-inspired internal contract — NOT full A2A compliance.
create table if not exists a2a_agent_cards (
  id              text primary key,
  name            text not null,
  role            text,
  capabilities    text[] default '{}',
  risk_level      risk_level not null default 'low',
  active          boolean not null default true,
  metadata        jsonb default '{}',
  registered_at   timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_a2a_agent_cards_active on a2a_agent_cards(active);

-- ── a2a_task_reports ─────────────────────────────────────────
-- A2A-inspired internal contract — NOT full A2A compliance.
create table if not exists a2a_task_reports (
  id              text primary key,
  agent_id        text not null,
  task_type       text not null,
  status          run_status not null default 'pending',
  summary         text not null,
  result          jsonb,
  error           text,
  correlation_id  text,
  requested_by    text,
  started_at      timestamptz not null default now(),
  completed_at    timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists idx_a2a_task_reports_agent_id on a2a_task_reports(agent_id);
create index if not exists idx_a2a_task_reports_status on a2a_task_reports(status);
create index if not exists idx_a2a_task_reports_started_at on a2a_task_reports(started_at desc);

-- ── integration_status ───────────────────────────────────────
create table if not exists integration_status (
  id              text primary key,
  configured      boolean not null default false,
  reachable       boolean,
  last_error      text,
  checked_at      timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

-- ── RLS Notes ────────────────────────────────────────────────
-- PATCH_002 decision: RLS disabled; all access via service-role key on server side.
-- All API routes authenticate via NextAuth before touching the DB.
-- Future patch (PATCH_003) should implement RLS policies per table.
alter table profiles disable row level security;
alter table agents disable row level security;
alter table agent_runs disable row level security;
alter table approvals disable row level security;
alter table workflow_registry disable row level security;
alter table control_room_events disable row level security;
alter table a2a_agent_cards disable row level security;
alter table a2a_task_reports disable row level security;
alter table integration_status disable row level security;
