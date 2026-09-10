create table if not exists public.leaderboard_entries (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  best_combo integer not null default 0,
  best_combo_at timestamptz not null default now(),
  display_name_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leaderboard_display_name_length check (char_length(btrim(display_name)) between 2 and 30),
  constraint leaderboard_best_combo_positive check (best_combo >= 0)
);

create index if not exists leaderboard_score_idx
  on public.leaderboard_entries (best_combo desc, best_combo_at asc);

alter table public.leaderboard_entries enable row level security;
revoke all on table public.leaderboard_entries from anon, authenticated;
grant select, insert, update on table public.leaderboard_entries to authenticated;

drop policy if exists "Authenticated users can read leaderboard" on public.leaderboard_entries;
create policy "Authenticated users can read leaderboard"
  on public.leaderboard_entries for select
  to authenticated
  using (true);

drop policy if exists "Users can insert their leaderboard entry" on public.leaderboard_entries;
create policy "Users can insert their leaderboard entry"
  on public.leaderboard_entries for insert
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "Users can update their leaderboard entry" on public.leaderboard_entries;
create policy "Users can update their leaderboard entry"
  on public.leaderboard_entries for update
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create or replace function public.protect_leaderboard_record()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id <> old.user_id then
    raise exception 'leaderboard user_id is immutable';
  end if;
  if new.best_combo < old.best_combo then
    new.best_combo := old.best_combo;
  end if;
  if new.best_combo > old.best_combo then
    new.best_combo_at := now();
  else
    new.best_combo_at := old.best_combo_at;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists protect_leaderboard_record_trigger on public.leaderboard_entries;
create trigger protect_leaderboard_record_trigger
before update on public.leaderboard_entries
for each row execute function public.protect_leaderboard_record();

create or replace function public.sync_leaderboard_entry(
  p_display_name text,
  p_best_combo integer,
  p_display_name_updated_at timestamptz
)
returns public.leaderboard_entries
language plpgsql
security invoker
set search_path = ''
as $$
declare
  synced public.leaderboard_entries;
  clean_name text := btrim(p_display_name);
begin
  if (select auth.uid()) is null then raise exception 'authentication required'; end if;
  if char_length(clean_name) not between 2 and 30 then raise exception 'invalid display name'; end if;
  if p_best_combo < 0 then raise exception 'invalid best combo'; end if;

  insert into public.leaderboard_entries as current_entry
    (user_id, display_name, best_combo, best_combo_at, display_name_updated_at)
  values
    ((select auth.uid()), clean_name, p_best_combo, now(), coalesce(p_display_name_updated_at, now()))
  on conflict (user_id) do update set
    display_name = case
      when excluded.display_name_updated_at >= current_entry.display_name_updated_at then excluded.display_name
      else current_entry.display_name
    end,
    display_name_updated_at = greatest(current_entry.display_name_updated_at, excluded.display_name_updated_at),
    best_combo = greatest(current_entry.best_combo, excluded.best_combo)
  returning * into synced;

  return synced;
end;
$$;

create or replace function public.get_my_leaderboard_position()
returns bigint
language sql
stable
security invoker
set search_path = ''
as $$
  select 1 + count(other.user_id)
  from public.leaderboard_entries mine
  left join public.leaderboard_entries other on
    other.best_combo > mine.best_combo
    or (other.best_combo = mine.best_combo and other.best_combo_at < mine.best_combo_at)
    or (other.best_combo = mine.best_combo and other.best_combo_at = mine.best_combo_at and other.user_id < mine.user_id)
  where mine.user_id = (select auth.uid())
  group by mine.user_id;
$$;

revoke execute on function public.sync_leaderboard_entry(text,integer,timestamptz) from public, anon;
revoke execute on function public.get_my_leaderboard_position() from public, anon;
grant execute on function public.sync_leaderboard_entry(text,integer,timestamptz) to authenticated;
grant execute on function public.get_my_leaderboard_position() to authenticated;
