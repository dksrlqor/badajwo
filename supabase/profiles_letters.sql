-- =============================================================
-- 받아줘 — profiles + letters (내 편지함 백엔드)
-- 목적: /u/:username (내 편지함) 을 기기 간에 동작하게 만든다.
--   · 지금까지 user/username/받은편지 는 localStorage 에만 있어서, 링크를 받은
--     친구의 다른 폰에서는 항상 "편지함을 찾을 수 없어요" 가 떴다.
--   · 이 마이그레이션으로 프로필(공개 필드)·받은 편지를 Supabase 로 올린다.
--
-- 보안 모델 (Supabase Auth 미사용, anon 키만 보임):
--   · profiles / letters 는 RLS 로 직접 접근 전면 차단. 모든 접근은 아래
--     SECURITY DEFINER RPC 로만 한다.
--   · 받은 편지 "열람"은 프로필마다 발급되는 비밀 토큰(inbox_token)으로 보호.
--     토큰을 가진 본인만 get_inbox / get_letter / update_letter 가능.
--   · email / google_sub / inbox_token 은 공개 조회(get_public_profile)에서 절대
--     내려가지 않는다.
--
-- 사용법: Supabase Dashboard → SQL Editor → New query → 이 파일 전체 붙여넣고 Run.
-- 멱등(idempotent) — 여러 번 실행해도 안전.
-- =============================================================

-- 1. profiles -------------------------------------------------
create table if not exists public.profiles (
  id            text primary key,
  google_sub    text unique,
  username      text unique,
  display_name  text not null default '',
  profile_image text not null default '',
  inbox_token   text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists profiles_username_idx on public.profiles (username);
create index if not exists profiles_google_idx   on public.profiles (google_sub);

-- 2. letters --------------------------------------------------
create table if not exists public.letters (
  id                uuid primary key default gen_random_uuid(),
  receiver_id       text not null,
  receiver_username text not null,
  sender_mode       text not null check (sender_mode in ('anonymous','name','user')),
  sender_user_id    text,
  sender_username   text,
  sender_name       text,
  content           text not null,
  reply             text,
  is_public         boolean not null default false,
  is_archived       boolean not null default false,
  is_deleted        boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists letters_receiver_idx on public.letters (receiver_id);

-- 3. RLS — 두 테이블 모두 직접 접근 차단 (정책 없음 = anon 전부 거부) ----
alter table public.profiles enable row level security;
alter table public.letters  enable row level security;

-- 4. 로그인: google_sub 기준 프로필 upsert. 토큰 포함 반환(본인만 호출). --
--    JWT 검증은 클라이언트의 Google 로그인이 이미 한 상태로 들어온다.
create or replace function public.upsert_google_profile(
  p_google_sub  text,
  p_display_name text,
  p_profile_image text
)
returns table (id text, username text, display_name text, profile_image text, inbox_token text)
language plpgsql security definer set search_path = public as $$
declare r public.profiles;
begin
  if coalesce(p_google_sub,'') = '' then
    raise exception 'google_sub required';
  end if;

  select * into r from public.profiles where google_sub = p_google_sub;

  if found then
    update public.profiles p set
      display_name  = coalesce(nullif(p_display_name,''), p.display_name),
      profile_image = coalesce(nullif(p_profile_image,''), p.profile_image),
      updated_at    = now()
    where p.id = r.id
    returning * into r;
  else
    insert into public.profiles (id, google_sub, username, display_name, profile_image, inbox_token)
    values (
      replace(gen_random_uuid()::text, '-', ''),
      p_google_sub,
      null,
      coalesce(p_display_name, ''),
      coalesce(p_profile_image, ''),
      replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
    )
    returning * into r;
  end if;

  return query select r.id, r.username, r.display_name, r.profile_image, r.inbox_token;
end; $$;

-- 5. username 설정/변경 (본인 id + google_sub 확인). 'ok'|'taken'|'invalid'|'forbidden'
create or replace function public.set_profile_username(
  p_id text, p_google_sub text, p_username text
)
returns text
language plpgsql security definer set search_path = public as $$
declare u text;
begin
  u := ltrim(lower(trim(coalesce(p_username,''))), '@');
  if u !~ '^[a-z0-9]{3,20}$' then return 'invalid'; end if;
  if not exists (select 1 from public.profiles where id = p_id and google_sub = p_google_sub) then
    return 'forbidden';
  end if;
  if exists (select 1 from public.profiles where username = u and id <> p_id) then
    return 'taken';
  end if;
  update public.profiles set username = u, updated_at = now() where id = p_id;
  return 'ok';
end; $$;

-- 6. username 사용 가능 여부 (onboarding 실시간 체크)
create or replace function public.username_available(p_username text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare u text;
begin
  u := ltrim(lower(trim(coalesce(p_username,''))), '@');
  if u !~ '^[a-z0-9]{3,20}$' then return false; end if;
  return not exists (select 1 from public.profiles where username = u);
end; $$;

-- 7. 공개 프로필 조회 (민감정보 제외). /u/:username, /write/id 용.
--    id 는 편지 전송에 필요해 내려주지만, 토큰 없이는 받은편지 열람 불가라 안전.
create or replace function public.get_public_profile(p_username text)
returns table (id text, username text, display_name text, profile_image text)
language plpgsql security definer set search_path = public as $$
declare u text;
begin
  u := ltrim(lower(trim(coalesce(p_username,''))), '@');
  if length(u) = 0 then return; end if;
  return query
    select p.id, p.username, p.display_name, p.profile_image
    from public.profiles p where p.username = u limit 1;
end; $$;

-- 8. 편지 보내기 (anon). receiver 는 username 으로만 조회. sender 필드는 서버에서 강제 정리.
--    반환: 편지 id(uuid text) | 'not_found' | 'invalid'
create or replace function public.send_letter(
  p_receiver_username text,
  p_sender_mode text,
  p_sender_name text,
  p_sender_user_id text,
  p_sender_username text,
  p_content text
)
returns text
language plpgsql security definer set search_path = public as $$
declare rcv public.profiles; new_id uuid;
        s_user text := null; s_uname text := null; s_name text := null;
begin
  if p_sender_mode not in ('anonymous','name','user') then return 'invalid'; end if;
  if length(coalesce(trim(p_content),'')) = 0 then return 'invalid'; end if;

  select * into rcv from public.profiles
    where username = ltrim(lower(trim(p_receiver_username)), '@') limit 1;
  if not found then return 'not_found'; end if;

  if p_sender_mode = 'user' then
    if coalesce(p_sender_user_id,'') = '' or coalesce(p_sender_username,'') = '' then
      return 'invalid';
    end if;
    s_user  := p_sender_user_id;
    s_uname := lower(p_sender_username);
  elsif p_sender_mode = 'name' then
    s_name := nullif(left(trim(p_sender_name), 30), '');
    if s_name is null then return 'invalid'; end if;
  end if;
  -- anonymous 는 셋 다 null

  insert into public.letters
    (receiver_id, receiver_username, sender_mode, sender_user_id, sender_username, sender_name, content)
  values
    (rcv.id, rcv.username, p_sender_mode, s_user, s_uname, s_name, left(p_content, 2000))
  returning id into new_id;

  return new_id::text;
end; $$;

-- 9. 받은편지함 조회 (토큰 게이트). p_scope: 'inbox' | 'public' | 'archive'
create or replace function public.get_inbox(p_receiver_id text, p_token text, p_scope text)
returns setof public.letters
language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from public.profiles where id = p_receiver_id and inbox_token = p_token
  ) then
    return;
  end if;

  if p_scope = 'archive' then
    return query select * from public.letters
      where receiver_id = p_receiver_id and is_deleted = false and is_archived = true
      order by updated_at desc;
  elsif p_scope = 'public' then
    return query select * from public.letters
      where receiver_id = p_receiver_id and is_deleted = false and is_archived = false and is_public = true
      order by created_at desc;
  else
    return query select * from public.letters
      where receiver_id = p_receiver_id and is_deleted = false and is_archived = false
      order by created_at desc;
  end if;
end; $$;

-- 10. 단일 편지 조회 (토큰 게이트) — /letter/:id 상세
create or replace function public.get_letter(p_id uuid, p_token text)
returns setof public.letters
language plpgsql security definer set search_path = public as $$
begin
  return query
    select l.* from public.letters l
    join public.profiles p on p.id = l.receiver_id
    where l.id = p_id and l.is_deleted = false and p.inbox_token = p_token;
end; $$;

-- 11. 편지 상태 변경 (토큰 게이트) — 답장 / 공개 / 보관 / 삭제
--     null 로 들어온 필드는 기존값 유지.
create or replace function public.update_letter(
  p_id uuid, p_token text,
  p_reply text, p_is_public boolean, p_is_archived boolean, p_is_deleted boolean
)
returns boolean
language plpgsql security definer set search_path = public as $$
declare rid text;
begin
  select receiver_id into rid from public.letters where id = p_id;
  if rid is null then return false; end if;
  if not exists (select 1 from public.profiles where id = rid and inbox_token = p_token) then
    return false;
  end if;
  update public.letters set
    reply       = coalesce(p_reply, reply),
    is_public   = coalesce(p_is_public, is_public),
    is_archived = coalesce(p_is_archived, is_archived),
    is_deleted  = coalesce(p_is_deleted, is_deleted),
    updated_at  = now()
  where id = p_id;
  return true;
end; $$;

-- 12. 계정 삭제 (본인 google_sub + token 확인)
--     받은 편지 삭제 + 내가 보낸 편지는 익명화(신원만 wipe).
create or replace function public.delete_account(p_id text, p_google_sub text, p_token text)
returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from public.profiles
    where id = p_id and google_sub = p_google_sub and inbox_token = p_token
  ) then
    return false;
  end if;
  delete from public.letters where receiver_id = p_id;
  update public.letters set
    sender_mode = 'anonymous', sender_user_id = null,
    sender_username = null, sender_name = null, updated_at = now()
  where sender_user_id = p_id;
  delete from public.profiles where id = p_id;
  return true;
end; $$;

-- 13. 권한 — 직접 테이블 접근은 막고, RPC 만 anon 에 노출 -------------
revoke all on function public.upsert_google_profile(text,text,text) from public;
revoke all on function public.set_profile_username(text,text,text)   from public;
revoke all on function public.username_available(text)               from public;
revoke all on function public.get_public_profile(text)               from public;
revoke all on function public.send_letter(text,text,text,text,text,text) from public;
revoke all on function public.get_inbox(text,text,text)              from public;
revoke all on function public.get_letter(uuid,text)                  from public;
revoke all on function public.update_letter(uuid,text,text,boolean,boolean,boolean) from public;
revoke all on function public.delete_account(text,text,text)         from public;

grant execute on function public.upsert_google_profile(text,text,text) to anon, authenticated;
grant execute on function public.set_profile_username(text,text,text)   to anon, authenticated;
grant execute on function public.username_available(text)               to anon, authenticated;
grant execute on function public.get_public_profile(text)               to anon, authenticated;
grant execute on function public.send_letter(text,text,text,text,text,text) to anon, authenticated;
grant execute on function public.get_inbox(text,text,text)              to anon, authenticated;
grant execute on function public.get_letter(uuid,text)                  to anon, authenticated;
grant execute on function public.update_letter(uuid,text,text,boolean,boolean,boolean) to anon, authenticated;
grant execute on function public.delete_account(text,text,text)         to anon, authenticated;

-- 끝. Tables → profiles / letters, Database → Functions 에 위 9개 RPC 가 보이면 성공.
