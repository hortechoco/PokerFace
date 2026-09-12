create or replace function public.hand_score(p_cards jsonb)
returns jsonb
language plpgsql
immutable
as $$
declare
  vals int[];
  suits text[];
  counts int[];
  category int;
  tiebreak int[];
  high int;
  flush boolean;
  straight boolean;
  i int;
begin
  -- Clasificador base de Hold'em. Recibe 5 o 7 cartas como [{"rank":14,"suit":"S"},...]
  select array_agg((c->>'rank')::int order by (c->>'rank')::int desc),
         array_agg(c->>'suit')
    into vals, suits
    from jsonb_array_elements(p_cards) c;

  flush := (select count(distinct s)=1 from unnest(suits) s);

  high := vals[1];
  straight := false;
  if array_length(vals,1) >= 5 then
    straight := true;
    for i in 1..4 loop
      if vals[i]-vals[i+1] <> 1 then
        straight := false;
      end if;
    end loop;
    if vals[1]=14 and vals[2]=5 then
      high := 5;
      straight := true;
    end if;
  end if;

  select array_agg(cnt order by cnt desc),
         array_agg(r order by cnt desc, r desc)
    into counts, vals
    from (
      select (c->>'rank')::int r, count(*) cnt
      from jsonb_array_elements(p_cards)c
      group by r
    ) x;

  if flush and straight and high=14 then category:=10; tiebreak:=array[14];
  elsif flush and straight then category:=9; tiebreak:=array[high];
  elsif counts[1]=4 then category:=8; tiebreak:=vals[1:2];
  elsif counts[1]=3 and counts[2]=2 then category:=7; tiebreak:=vals[1:2];
  elsif flush then category:=6; tiebreak:=vals;
  elsif straight then category:=5; tiebreak:=array[high];
  elsif counts[1]=3 then category:=4; tiebreak:=vals;
  elsif counts[1]=2 and counts[2]=2 then category:=3; tiebreak:=vals;
  elsif counts[1]=2 then category:=2; tiebreak:=vals;
  else category:=1; tiebreak:=vals;
  end if;

  return jsonb_build_object('category_rank',category,'tie_breakers',to_jsonb(tiebreak));
end;
$$;
