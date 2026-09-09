-- Content editors have no access to customer inquiries or CRM permissions.
create table public.content_editors (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.content_editors enable row level security;
revoke all on public.content_editors from anon, authenticated;
grant select on public.content_editors to service_role;
