create extension if not exists pgcrypto;

create table public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text not null default '',
  role text not null check (role in ('OWNER', 'SALES')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique,
  status text not null default 'NEW' check (status in ('NEW','CONTACTED','QUALIFIED','QUOTING','WON','LOST','SPAM','ARCHIVED')),
  name text not null,
  company text not null default '',
  phone text not null default '',
  line_id text not null default '',
  email text not null default '',
  preferred_contact text not null default '',
  event_date date,
  date_flexible boolean not null default false,
  event_city text not null,
  venue text not null default '',
  event_type text not null,
  services text[] not null default '{}',
  budget_range text not null default '',
  guest_count integer,
  message text not null,
  source_page text not null default '',
  referrer text not null default '',
  utm_source text not null default '',
  utm_medium text not null default '',
  utm_campaign text not null default '',
  consent_at timestamptz not null,
  assigned_to uuid references public.admin_users(id) on delete set null,
  first_contacted_at timestamptz,
  next_follow_up_at timestamptz,
  won_at timestamptz,
  lost_reason text not null default '',
  dedupe_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (phone <> '' or line_id <> '' or email <> ''),
  check (event_date is not null or date_flexible),
  check (status <> 'LOST' or lost_reason <> '')
);

create table public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  type text not null check (type in ('CREATED','STATUS_CHANGED','PHONE','LINE','EMAIL','NOTE','FOLLOW_UP','EXPORTED')),
  note text not null default '',
  from_status text,
  to_status text,
  created_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.notification_queue (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  kind text not null check (kind in ('INTERNAL_NEW_LEAD','VISITOR_RECEIPT')),
  status text not null default 'PENDING' check (status in ('PENDING','SENT','FAILED')),
  attempts integer not null default 0,
  last_error text not null default '',
  available_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create table public.analytics_events (
  id bigint generated always as identity primary key,
  event_name text not null check (event_name in ('cta_click','form_start','form_error','form_submit')),
  page text not null,
  properties jsonb not null default '{}',
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.rate_limit_buckets (
  key text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.admin_users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  changes jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create sequence public.lead_public_id_seq;

create index leads_status_created_idx on public.leads(status, created_at desc);
create index leads_follow_up_idx on public.leads(next_follow_up_at) where status not in ('WON','LOST','SPAM','ARCHIVED');
create index leads_event_date_idx on public.leads(event_date);
create index lead_activities_lead_created_idx on public.lead_activities(lead_id, created_at desc);
create index analytics_events_name_date_idx on public.analytics_events(event_name, occurred_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger leads_set_updated_at before update on public.leads
for each row execute function public.set_updated_at();

create or replace function public.is_crm_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where id = auth.uid() and active = true
  );
$$;

create or replace function public.next_lead_public_id()
returns text
language sql security definer
set search_path = public
as $$
  select 'NS-' || to_char(now() at time zone 'Asia/Taipei', 'YYYYMMDD') || '-' ||
    lpad(nextval('public.lead_public_id_seq')::text, 4, '0');
$$;

create or replace function public.consume_rate_limit(
  bucket_key text,
  window_seconds integer,
  max_requests integer
) returns boolean
language plpgsql security definer
set search_path = public
as $$
declare
  allowed boolean;
begin
  insert into public.rate_limit_buckets(key, window_started_at, request_count)
  values (bucket_key, now(), 1)
  on conflict (key) do update set
    window_started_at = case
      when public.rate_limit_buckets.window_started_at < now() - make_interval(secs => window_seconds)
      then now() else public.rate_limit_buckets.window_started_at end,
    request_count = case
      when public.rate_limit_buckets.window_started_at < now() - make_interval(secs => window_seconds)
      then 1 else public.rate_limit_buckets.request_count + 1 end
  returning request_count <= max_requests into allowed;
  return allowed;
end;
$$;

create or replace function public.create_inquiry(payload jsonb, request_dedupe_key text)
returns table (id uuid, public_id text, duplicate boolean)
language plpgsql security definer
set search_path = public
as $$
declare
  new_lead public.leads%rowtype;
begin
  insert into public.leads (
    public_id, name, company, phone, line_id, email, preferred_contact,
    event_date, date_flexible, event_city, venue, event_type, services,
    budget_range, guest_count, message, source_page, referrer, utm_source,
    utm_medium, utm_campaign, consent_at, dedupe_key
  ) values (
    public.next_lead_public_id(),
    payload->>'name', coalesce(payload->>'company',''), coalesce(payload->>'phone',''),
    coalesce(payload->>'lineId',''), coalesce(payload->>'email',''),
    coalesce(payload->>'preferredContact',''),
    nullif(payload->>'eventDate','')::date, coalesce((payload->>'dateFlexible')::boolean,false),
    payload->>'eventCity', coalesce(payload->>'venue',''), payload->>'eventType',
    coalesce(array(select jsonb_array_elements_text(payload->'services')), '{}'),
    coalesce(payload->>'budgetRange',''), nullif(payload->>'guestCount','')::integer,
    payload->>'message', coalesce(payload->>'sourcePage',''), coalesce(payload->>'referrer',''),
    coalesce(payload#>>'{utm,source}',''), coalesce(payload#>>'{utm,medium}',''),
    coalesce(payload#>>'{utm,campaign}',''), now(), request_dedupe_key
  )
  on conflict (dedupe_key) do nothing
  returning * into new_lead;

  if new_lead.id is null then
    select * into new_lead from public.leads where dedupe_key = request_dedupe_key;
    return query select new_lead.id, new_lead.public_id, true;
    return;
  end if;

  insert into public.lead_activities(lead_id, type, note)
  values (new_lead.id, 'CREATED', '網站詢價建立');

  insert into public.notification_queue(lead_id, kind)
  values (new_lead.id, 'INTERNAL_NEW_LEAD'), (new_lead.id, 'VISITOR_RECEIPT');

  return query select new_lead.id, new_lead.public_id, false;
end;
$$;

alter table public.admin_users enable row level security;
alter table public.leads enable row level security;
alter table public.lead_activities enable row level security;
alter table public.notification_queue enable row level security;
alter table public.analytics_events enable row level security;
alter table public.rate_limit_buckets enable row level security;
alter table public.audit_logs enable row level security;

create policy "admins read admin directory" on public.admin_users for select to authenticated using (public.is_crm_admin());
create policy "admins read leads" on public.leads for select to authenticated using (public.is_crm_admin());
create policy "admins update leads" on public.leads for update to authenticated using (public.is_crm_admin()) with check (public.is_crm_admin());
create policy "admins read activities" on public.lead_activities for select to authenticated using (public.is_crm_admin());
create policy "admins add activities" on public.lead_activities for insert to authenticated with check (public.is_crm_admin());
create policy "owners read analytics" on public.analytics_events for select to authenticated using (
  exists (select 1 from public.admin_users where id = auth.uid() and active and role = 'OWNER')
);
create policy "owners read audit logs" on public.audit_logs for select to authenticated using (
  exists (select 1 from public.admin_users where id = auth.uid() and active and role = 'OWNER')
);

revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
revoke all on function public.create_inquiry(jsonb, text) from public, anon, authenticated;
revoke all on function public.next_lead_public_id() from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
grant execute on function public.create_inquiry(jsonb, text) to service_role;
