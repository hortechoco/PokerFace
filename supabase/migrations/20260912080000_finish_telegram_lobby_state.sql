alter table public.poker_tables add column if not exists telegram_message_id bigint;

create index if not exists poker_tables_telegram_lobby_idx
  on public.poker_tables (telegram_group_id, telegram_message_id);

drop function if exists public.join_quick_table(uuid,bigint,text);

create or replace function public.join_quick_table(
  p_table_id uuid,
  p_telegram_id bigint,
  p_username text
)
returns table(seat_number integer, player_count integer, table_status text)
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_player_id uuid;
  v_seat integer;
  v_count integer;
  v_status text;
  v_expires_at timestamptz;
  v_max_players integer;
begin
  insert into public.players (telegram_id, username)
  values (p_telegram_id, p_username)
  on conflict (telegram_id) do update set username = excluded.username
  returning id into v_player_id;

  if exists (
    select 1
    from public.table_players tp
    join public.poker_tables pt on pt.id = tp.table_id
    where tp.player_id = v_player_id
      and pt.status in ('waiting','running')
  ) then
    raise exception 'PLAYER_ALREADY_IN_ACTIVE_TABLE';
  end if;

  select status, expires_at, max_players
    into v_status, v_expires_at, v_max_players
  from public.poker_tables
  where id = p_table_id
  for update;

  if not found then raise exception 'TABLE_NOT_FOUND'; end if;
  if v_status <> 'waiting' then raise exception 'TABLE_NOT_AVAILABLE'; end if;

  if v_expires_at is not null and v_expires_at <= now() then
    update public.poker_tables set status = 'expired' where id = p_table_id;
    raise exception 'TABLE_EXPIRED';
  end if;

  select count(*)::integer into v_count
  from public.table_players
  where table_id = p_table_id;

  if v_count >= v_max_players then raise exception 'TABLE_FULL'; end if;

  select s into v_seat
  from generate_series(1, v_max_players) s
  where not exists (
    select 1 from public.table_players
    where table_id = p_table_id and seat_number = s
  )
  order by s
  limit 1;

  insert into public.table_players(table_id, player_id, seat_number, starting_chips, current_chips)
  values(p_table_id, v_player_id, v_seat, 1000, 1000);

  select count(*)::integer into v_count
  from public.table_players
  where table_id = p_table_id;

  if v_count >= v_max_players then
    update public.poker_tables
      set status = 'running', started_at = coalesce(started_at, now())
    where id = p_table_id;
    v_status := 'running';
  else
    v_status := 'waiting';
  end if;

  return query select v_seat, v_count, v_status;
end;
$function$;

create or replace function public.create_quick_table(
  p_telegram_group_id bigint,
  p_creator_telegram_id bigint,
  p_username text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_player_id uuid;
  v_table_id uuid;
begin
  insert into public.players (telegram_id, username)
  values (p_creator_telegram_id, p_username)
  on conflict (telegram_id) do update set username = excluded.username
  returning id into v_player_id;

  if exists (
    select 1
    from public.table_players tp
    join public.poker_tables pt on pt.id = tp.table_id
    where tp.player_id = v_player_id
      and pt.status in ('waiting','running')
  ) then
    raise exception 'PLAYER_ALREADY_IN_ACTIVE_TABLE';
  end if;

  insert into public.poker_tables (
    telegram_group_id,
    creator_player_id,
    status,
    max_players,
    expires_at
  )
  values (
    p_telegram_group_id,
    v_player_id,
    'waiting',
    8,
    now() + interval '10 minutes'
  )
  returning id into v_table_id;

  insert into public.table_players (
    table_id,
    player_id,
    seat_number,
    starting_chips,
    current_chips
  )
  values (v_table_id, v_player_id, 1, 1000, 1000);

  return v_table_id;
end;
$function$;
