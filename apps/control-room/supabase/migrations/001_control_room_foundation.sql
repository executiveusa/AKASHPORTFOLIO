create table if not exists profiles(id uuid primary key, email text unique, role text default 'viewer');
create table if not exists agents(id text primary key, name text not null, active boolean default true);
create table if not exists agent_runs(id uuid primary key, agent_id text, status text, created_at timestamptz default now());
create table if not exists approvals(id uuid primary key, risk_level text, status text, requested_by text, decided_by text);
create table if not exists workflow_registry(id text primary key, provider text, high_risk boolean default false);
create table if not exists control_room_events(id uuid primary key, event text, payload jsonb, created_at timestamptz default now());
create table if not exists a2a_agent_cards(id text primary key, card jsonb not null);
create table if not exists integration_status(id text primary key, configured boolean default false, checked_at timestamptz default now());
