create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  normalized_name text not null check (normalized_name = lower(regexp_replace(btrim(name), '\s+', ' ', 'g'))),
  icon_key text not null check (icon_key in ('check', 'file-text', 'pill', 'shopping-bag', 'calendar-clock', 'car', 'shield-check', 'wallet-cards', 'repeat', 'utensils', 'house', 'plane', 'sparkles', 'paw-print', 'tag')),
  color_key text check (color_key is null or color_key in ('purple', 'rose', 'blue', 'green', 'orange', 'teal', 'violet', 'amber', 'slate')),
  is_custom boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (user_id, normalized_name)
);

create trigger categories_set_updated_at before update on public.categories for each row execute function public.set_updated_at();
create index categories_user_name_idx on public.categories (user_id, normalized_name);

create function public.seed_default_categories(p_user_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.categories (user_id, name, normalized_name, icon_key, color_key, is_custom)
  values
    (p_user_id, 'Action', 'action', 'check', 'purple', false),
    (p_user_id, 'Documents', 'documents', 'file-text', 'purple', false),
    (p_user_id, 'Medicines', 'medicines', 'pill', 'rose', false),
    (p_user_id, 'Purchases', 'purchases', 'shopping-bag', 'orange', false),
    (p_user_id, 'Expiry', 'expiry', 'calendar-clock', 'amber', false),
    (p_user_id, 'Vehicle', 'vehicle', 'car', 'blue', false),
    (p_user_id, 'Insurance', 'insurance', 'shield-check', 'green', false),
    (p_user_id, 'Finance', 'finance', 'wallet-cards', 'teal', false),
    (p_user_id, 'Subscription', 'subscription', 'repeat', 'violet', false),
    (p_user_id, 'Food', 'food', 'utensils', 'amber', false),
    (p_user_id, 'Home', 'home', 'house', 'green', false),
    (p_user_id, 'Travel', 'travel', 'plane', 'blue', false),
    (p_user_id, 'Cosmetics', 'cosmetics', 'sparkles', 'rose', false),
    (p_user_id, 'Other', 'other', 'tag', 'slate', false)
  on conflict (user_id, normalized_name) do nothing;
$$;

revoke all on function public.seed_default_categories(uuid) from public, anon, authenticated;

select public.seed_default_categories(id) from auth.users;

alter table public.trackers add column category_id uuid;
alter table public.actions add column category_id uuid;

update public.trackers tracker
set category_id = category.id
from public.categories category
where category.user_id = tracker.user_id
  and category.normalized_name = case tracker.category
    when 'document' then 'documents'
    when 'purchase' then 'purchases'
    when 'subscription' then 'subscription'
    when 'expiry' then 'expiry'
    when 'warranty' then 'purchases'
    when 'bill' then 'finance'
    when 'maintenance' then 'vehicle'
    else 'other'
  end;

update public.actions action
set category_id = coalesce(
  (select tracker.category_id from public.trackers tracker where tracker.id = action.tracker_id and tracker.user_id = action.user_id),
  (select category.id from public.categories category where category.user_id = action.user_id and category.normalized_name = 'action')
);

alter table public.trackers alter column category_id set not null;
alter table public.actions alter column category_id set not null;
alter table public.trackers add constraint trackers_category_owner_fk foreign key (category_id, user_id) references public.categories(id, user_id);
alter table public.actions add constraint actions_category_owner_fk foreign key (category_id, user_id) references public.categories(id, user_id);
create index trackers_user_category_idx on public.trackers (user_id, category_id) where archived_at is null;
create index actions_user_category_idx on public.actions (user_id, category_id) where status <> 'archived';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), nullif(split_part(new.email, '@', 1), ''), 'My profile'));
  perform public.seed_default_categories(new.id);
  return new;
end;
$$;

drop function if exists public.create_tracker(uuid, text, text, date, text);
create function public.create_tracker(p_id uuid, p_title text, p_category text, p_category_id uuid, p_date_value date, p_source_label text default null)
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
  if p_category not in ('document', 'purchase', 'expiry', 'warranty', 'subscription', 'bill', 'maintenance', 'custom') then raise exception 'Invalid tracker type'; end if;
  if not exists (select 1 from public.categories where id = p_category_id and user_id = owner_id) then raise exception 'Invalid category'; end if;
  awareness := case when p_category = 'document' then 90 else 30 end;
  attention := case when p_category = 'document' then 30 else 7 end;
  milestone_label := case when p_category = 'document' then 'Expires' else 'Date' end;
  insert into public.trackers (id, user_id, title, category, category_id, source_label)
  values (p_id, owner_id, trim(p_title), p_category, p_category_id, nullif(trim(p_source_label), '')) returning id into tracker_id;
  insert into public.milestones (user_id, tracker_id, label, date_value, provenance) values (owner_id, tracker_id, milestone_label, p_date_value, 'manual');
  insert into public.reminder_policies (user_id, tracker_id, awareness_days, attention_days) values (owner_id, tracker_id, awareness, attention);
  return tracker_id;
end;
$$;

revoke all on function public.create_tracker(uuid, text, text, uuid, date, text) from public, anon;
grant execute on function public.create_tracker(uuid, text, text, uuid, date, text) to authenticated;

drop function if exists public.update_tracker_details(uuid, text, date);
create function public.update_tracker_details(p_tracker_id uuid, p_title text, p_category_id uuid, p_date_value date)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare owner_id uuid := auth.uid();
begin
  if nullif(btrim(p_title), '') is null or char_length(btrim(p_title)) > 160 then raise exception 'Tracker title must contain between 1 and 160 characters.' using errcode = '22023'; end if;
  if not exists (select 1 from public.categories where id = p_category_id and user_id = owner_id) then raise exception 'Invalid category.' using errcode = '22023'; end if;
  update public.trackers set title = btrim(p_title), category_id = p_category_id where id = p_tracker_id and user_id = owner_id;
  if not found then raise exception 'Tracker not found.' using errcode = 'P0002'; end if;
  update public.milestones set date_value = p_date_value where tracker_id = p_tracker_id and user_id = owner_id;
  if not found then raise exception 'Tracker milestone not found.' using errcode = 'P0002'; end if;
end;
$$;

revoke all on function public.update_tracker_details(uuid, text, uuid, date) from public, anon;
grant execute on function public.update_tracker_details(uuid, text, uuid, date) to authenticated;

create function public.delete_custom_category(p_category_id uuid, p_replacement_category_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare owner_id uuid := auth.uid();
begin
  if p_category_id = p_replacement_category_id then raise exception 'Choose a different replacement category.' using errcode = '22023'; end if;
  if not exists (select 1 from public.categories where id = p_category_id and user_id = owner_id and is_custom) then raise exception 'Custom category not found.' using errcode = 'P0002'; end if;
  if not exists (select 1 from public.categories where id = p_replacement_category_id and user_id = owner_id) then raise exception 'Replacement category not found.' using errcode = 'P0002'; end if;
  update public.trackers set category_id = p_replacement_category_id where category_id = p_category_id and user_id = owner_id;
  update public.actions set category_id = p_replacement_category_id where category_id = p_category_id and user_id = owner_id;
  delete from public.categories where id = p_category_id and user_id = owner_id and is_custom;
end;
$$;

revoke all on function public.delete_custom_category(uuid, uuid) from public, anon;
grant execute on function public.delete_custom_category(uuid, uuid) to authenticated;

alter table public.categories enable row level security;
revoke all on table public.categories from anon, authenticated;
grant select, insert, update, delete on table public.categories to authenticated;
create policy "categories_select_own" on public.categories for select to authenticated using ((select auth.uid()) = user_id);
create policy "categories_insert_custom" on public.categories for insert to authenticated with check ((select auth.uid()) = user_id and is_custom);
create policy "categories_update_custom" on public.categories for update to authenticated using ((select auth.uid()) = user_id and is_custom) with check ((select auth.uid()) = user_id and is_custom);
create policy "categories_delete_custom" on public.categories for delete to authenticated using ((select auth.uid()) = user_id and is_custom);
