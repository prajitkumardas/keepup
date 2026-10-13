create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'My profile' check (char_length(trim(display_name)) between 1 and 80),
  show_notification_details boolean not null default false,
  source_retention text not null default 'ask' check (source_retention in ('keep', 'delete', 'ask')),
  theme_mode text not null default 'light' check (theme_mode in ('light', 'dark')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.trackers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 160),
  category text not null check (category in ('document', 'purchase', 'expiry', 'warranty', 'subscription', 'bill', 'maintenance', 'custom')),
  source_label text check (source_label is null or char_length(source_label) <= 160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (id, user_id)
);

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tracker_id uuid not null,
  label text not null check (char_length(trim(label)) between 1 and 80),
  date_value date not null,
  provenance text not null default 'manual' check (provenance in ('manual', 'extracted', 'imported', 'generated', 'recurring')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (tracker_id, user_id) references public.trackers(id, user_id) on delete cascade,
  unique (tracker_id)
);

create table public.reminder_policies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tracker_id uuid not null,
  awareness_days integer not null check (awareness_days between 0 and 3650),
  attention_days integer not null check (attention_days between 0 and awareness_days),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (tracker_id, user_id) references public.trackers(id, user_id) on delete cascade,
  unique (tracker_id)
);

create table public.actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tracker_id uuid,
  title text not null check (char_length(trim(title)) between 1 and 160),
  status text not null default 'open' check (status in ('open', 'completed', 'archived')),
  due_date date,
  snoozed_until date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (tracker_id, user_id) references public.trackers(id, user_id) on delete cascade,
  unique (id, user_id)
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tracker_id uuid,
  action_id uuid,
  storage_path text not null check (char_length(storage_path) <= 512),
  file_name text not null check (char_length(file_name) <= 255),
  mime_type text not null check (char_length(mime_type) <= 127),
  size_bytes bigint not null check (size_bytes between 0 and 26214400),
  retention_mode text not null default 'ask' check (retention_mode in ('keep', 'delete', 'ask')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  foreign key (tracker_id, user_id) references public.trackers(id, user_id) on delete cascade,
  foreign key (action_id, user_id) references public.actions(id, user_id) on delete cascade,
  check (num_nonnulls(tracker_id, action_id) <= 1)
);

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('profile', 'tracker', 'milestone', 'action', 'source')),
  entity_id uuid not null,
  event_type text not null check (char_length(event_type) between 1 and 80),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  installation_id text not null check (char_length(installation_id) between 1 and 160),
  platform text not null check (platform in ('ios', 'android', 'web')),
  push_token text,
  timezone text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, installation_id)
);

create table public.sync_mutations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_mutation_id text not null check (char_length(client_mutation_id) between 1 and 160),
  entity_type text not null,
  entity_id text not null,
  operation text not null check (operation in ('insert', 'update', 'delete')),
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'applied', 'failed')),
  created_at timestamptz not null default now(),
  applied_at timestamptz,
  unique (user_id, client_mutation_id)
);

create index trackers_user_active_idx on public.trackers (user_id, archived_at, created_at desc);
create index milestones_user_date_idx on public.milestones (user_id, date_value);
create index actions_user_status_due_idx on public.actions (user_id, status, due_date);
create index sources_user_tracker_idx on public.sources (user_id, tracker_id);
create index sources_user_action_idx on public.sources (user_id, action_id);
create index activity_events_user_created_idx on public.activity_events (user_id, created_at desc);
create index sync_mutations_user_status_idx on public.sync_mutations (user_id, status, created_at);

create function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger trackers_set_updated_at before update on public.trackers for each row execute function public.set_updated_at();
create trigger milestones_set_updated_at before update on public.milestones for each row execute function public.set_updated_at();
create trigger reminder_policies_set_updated_at before update on public.reminder_policies for each row execute function public.set_updated_at();
create trigger actions_set_updated_at before update on public.actions for each row execute function public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), nullif(split_part(new.email, '@', 1), ''), 'My profile')
  );
  return new;
end;
$$;

insert into public.profiles (id, display_name)
select id, coalesce(nullif(trim(raw_user_meta_data ->> 'display_name'), ''), nullif(split_part(email, '@', 1), ''), 'My profile')
from auth.users
on conflict (id) do nothing;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create function public.create_tracker(p_id uuid, p_title text, p_category text, p_date_value date, p_source_label text default null)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  owner_id uuid := auth.uid();
  tracker_id uuid;
  awareness integer;
  attention integer;
  milestone_label text;
begin
  if owner_id is null then raise exception 'Authentication required'; end if;
  if p_category not in ('document', 'purchase', 'expiry', 'warranty', 'subscription', 'bill', 'maintenance', 'custom') then raise exception 'Invalid tracker category'; end if;

  awareness := case when p_category = 'document' then 90 else 30 end;
  attention := case when p_category = 'document' then 30 else 7 end;
  milestone_label := case when p_category = 'document' then 'Expires' else 'Date' end;

  insert into public.trackers (id, user_id, title, category, source_label)
  values (p_id, owner_id, trim(p_title), p_category, nullif(trim(p_source_label), ''))
  returning id into tracker_id;

  insert into public.milestones (user_id, tracker_id, label, date_value, provenance)
  values (owner_id, tracker_id, milestone_label, p_date_value, 'manual');

  insert into public.reminder_policies (user_id, tracker_id, awareness_days, attention_days)
  values (owner_id, tracker_id, awareness, attention);

  return tracker_id;
end;
$$;

revoke all on function public.create_tracker(uuid, text, text, date, text) from public, anon;
grant execute on function public.create_tracker(uuid, text, text, date, text) to authenticated;

alter table public.profiles enable row level security;
alter table public.trackers enable row level security;
alter table public.milestones enable row level security;
alter table public.reminder_policies enable row level security;
alter table public.actions enable row level security;
alter table public.sources enable row level security;
alter table public.activity_events enable row level security;
alter table public.devices enable row level security;
alter table public.sync_mutations enable row level security;

revoke all on table public.profiles, public.trackers, public.milestones, public.reminder_policies, public.actions, public.sources, public.activity_events, public.devices, public.sync_mutations from anon, authenticated;
grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.trackers, public.milestones, public.reminder_policies, public.actions, public.sources, public.devices, public.sync_mutations to authenticated;
grant select, insert on table public.activity_events to authenticated;

create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "trackers_select_own" on public.trackers for select to authenticated using ((select auth.uid()) = user_id);
create policy "trackers_insert_own" on public.trackers for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "trackers_update_own" on public.trackers for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "trackers_delete_own" on public.trackers for delete to authenticated using ((select auth.uid()) = user_id);

create policy "milestones_select_own" on public.milestones for select to authenticated using ((select auth.uid()) = user_id);
create policy "milestones_insert_own" on public.milestones for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "milestones_update_own" on public.milestones for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "milestones_delete_own" on public.milestones for delete to authenticated using ((select auth.uid()) = user_id);

create policy "reminders_select_own" on public.reminder_policies for select to authenticated using ((select auth.uid()) = user_id);
create policy "reminders_insert_own" on public.reminder_policies for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "reminders_update_own" on public.reminder_policies for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "reminders_delete_own" on public.reminder_policies for delete to authenticated using ((select auth.uid()) = user_id);

create policy "actions_select_own" on public.actions for select to authenticated using ((select auth.uid()) = user_id);
create policy "actions_insert_own" on public.actions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "actions_update_own" on public.actions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "actions_delete_own" on public.actions for delete to authenticated using ((select auth.uid()) = user_id);

create policy "sources_select_own" on public.sources for select to authenticated using ((select auth.uid()) = user_id);
create policy "sources_insert_own" on public.sources for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "sources_update_own" on public.sources for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "sources_delete_own" on public.sources for delete to authenticated using ((select auth.uid()) = user_id);

create policy "events_select_own" on public.activity_events for select to authenticated using ((select auth.uid()) = user_id);
create policy "events_insert_own" on public.activity_events for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "devices_select_own" on public.devices for select to authenticated using ((select auth.uid()) = user_id);
create policy "devices_insert_own" on public.devices for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "devices_update_own" on public.devices for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "devices_delete_own" on public.devices for delete to authenticated using ((select auth.uid()) = user_id);

create policy "mutations_select_own" on public.sync_mutations for select to authenticated using ((select auth.uid()) = user_id);
create policy "mutations_insert_own" on public.sync_mutations for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "mutations_update_own" on public.sync_mutations for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "mutations_delete_own" on public.sync_mutations for delete to authenticated using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sources', 'sources', false, 26214400, array['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp', 'image/gif', 'application/pdf'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "source_files_select_own" on storage.objects for select to authenticated using (bucket_id = 'sources' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "source_files_insert_own" on storage.objects for insert to authenticated with check (bucket_id = 'sources' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "source_files_update_own" on storage.objects for update to authenticated using (bucket_id = 'sources' and (storage.foldername(name))[1] = (select auth.uid())::text) with check (bucket_id = 'sources' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "source_files_delete_own" on storage.objects for delete to authenticated using (bucket_id = 'sources' and (storage.foldername(name))[1] = (select auth.uid())::text);
