-- PMBOK phase approval gates
do $$ begin
  create type pmbok_phase as enum ('iniciacion', 'planificacion', 'ejecucion', 'cierre');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type gate_status as enum ('pending', 'approved', 'blocked');
exception when duplicate_object then null;
end $$;

create table if not exists phase_gates (
  id          uuid primary key default gen_random_uuid(),
  board_id    uuid not null references boards(id) on delete cascade,
  phase       pmbok_phase not null,
  status      gate_status not null default 'pending',
  approver_id uuid references auth.users(id),
  approved_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (board_id, phase)
);

-- Scope to tenant via boards table (already tenant-scoped)
alter table phase_gates enable row level security;

create policy "tenant members can read phase gates"
  on phase_gates for select
  using (
    exists (
      select 1 from boards b
      join user_profiles up on up.tenant_id = b.tenant_id
      where b.id = phase_gates.board_id
        and up.user_id = auth.uid()
    )
  );

create policy "tenant members can upsert phase gates"
  on phase_gates for insert
  with check (
    exists (
      select 1 from boards b
      join user_profiles up on up.tenant_id = b.tenant_id
      where b.id = phase_gates.board_id
        and up.user_id = auth.uid()
    )
  );

create policy "tenant members can update phase gates"
  on phase_gates for update
  using (
    exists (
      select 1 from boards b
      join user_profiles up on up.tenant_id = b.tenant_id
      where b.id = phase_gates.board_id
        and up.user_id = auth.uid()
    )
  );

-- Auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists phase_gates_updated_at on phase_gates;
create trigger phase_gates_updated_at
  before update on phase_gates
  for each row execute function set_updated_at();
