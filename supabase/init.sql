-- =============================================================
-- 받아줘 — simple_letters 초기 셋업
-- 사용법: Supabase Dashboard → SQL Editor → New query → 이 파일 전체 붙여넣고 Run.
-- 멱등(idempotent) 하게 작성되어 여러 번 실행해도 안전합니다.
-- =============================================================

-- 1. 테이블 ----------------------------------------------------
create table if not exists public.simple_letters (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  type text not null default 'simple_shared_letter',
  recipient_name text default '',
  sender_name text default '',
  title text default '',
  content text not null,
  template_id text not null,
  photos jsonb not null default '[]'::jsonb,
  music jsonb,
  created_by_user_id text,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  view_count integer not null default 0,
  is_deleted boolean not null default false
);

create index if not exists simple_letters_code_idx
  on public.simple_letters (code);
create index if not exists simple_letters_creator_idx
  on public.simple_letters (created_by_user_id);

-- 2. 24시간 만료 trigger ----------------------------------------
-- 일회성 편지는 생성 후 24시간만 유효하다. 만료 시각은 서버 시계 기준으로
-- 강제(클라이언트가 보낸 expires_at/created_at 은 무시)하므로 프론트엔드를
-- 조작해도 더 긴 수명을 가질 수 없다.
-- (이 trigger 도입 전에 만들어진 row 는 expires_at null = 만료 없는 legacy 링크.)
create or replace function public.simple_letters_force_expiry()
returns trigger
language plpgsql
as $$
begin
  new.created_at := now();
  new.expires_at := now() + interval '24 hours';
  return new;
end;
$$;

drop trigger if exists simple_letters_force_expiry_trg on public.simple_letters;
create trigger simple_letters_force_expiry_trg
  before insert on public.simple_letters
  for each row
  execute function public.simple_letters_force_expiry();

-- 3. RLS -------------------------------------------------------
alter table public.simple_letters enable row level security;

-- anon insert — 사용자는 백엔드 인증 없이 편지를 만들 수 있어야 한다.
drop policy if exists simple_letters_insert_anon on public.simple_letters;
create policy simple_letters_insert_anon
  on public.simple_letters
  for insert
  to anon, authenticated
  with check (true);

-- 누구나 select — 공유 링크의 본질. code 가 곧 토큰(8자 base36 ≈ 2.8조 조합).
-- 삭제되었거나 만료된 row 는 API 를 직접 호출해도 content 가 내려가지 않는다.
drop policy if exists simple_letters_select_public on public.simple_letters;
create policy simple_letters_select_public
  on public.simple_letters
  for select
  to anon, authenticated
  using (
    is_deleted = false
    and (expires_at is null or expires_at > now())
  );

-- UPDATE/DELETE 는 정책을 만들지 않아 anon 차단.
-- view_count 증가는 아래 RPC 로만 가능.

-- 4. 편지 상태 조회 RPC ----------------------------------------
-- 만료/삭제된 편지는 select 가 막히므로, 열람 화면이 "만료" 와 "없음" 을
-- 구분할 수 있도록 내용 없이 상태 문자열만 돌려준다.
create or replace function public.get_simple_letter_status(p_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  select is_deleted, expires_at into r
    from public.simple_letters
    where code = lower(p_code)
    limit 1;
  if not found then
    return 'not_found';
  end if;
  if r.is_deleted then
    return 'deleted';
  end if;
  if r.expires_at is not null and r.expires_at <= now() then
    return 'expired';
  end if;
  return 'ok';
end;
$$;

revoke all on function public.get_simple_letter_status(text) from public;
grant execute on function public.get_simple_letter_status(text) to anon, authenticated;

-- 5. view_count 증가 RPC ---------------------------------------
create or replace function public.increment_letter_view(p_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.simple_letters
    set view_count = view_count + 1
    where code = p_code
      and is_deleted = false
      and (expires_at is null or expires_at > now());
end;
$$;

revoke all on function public.increment_letter_view(text) from public;
grant execute on function public.increment_letter_view(text) to anon, authenticated;

-- 6. Storage bucket: letter-photos -----------------------------
insert into storage.buckets (id, name, public)
  values ('letter-photos', 'letter-photos', true)
  on conflict (id) do update set public = true;

drop policy if exists "letter-photos public read" on storage.objects;
create policy "letter-photos public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'letter-photos');

drop policy if exists "letter-photos anon insert" on storage.objects;
create policy "letter-photos anon insert"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'letter-photos');

-- 끝. ---------------------------------------------------------
-- Tables → simple_letters / Storage → letter-photos / Database → Functions → increment_letter_view 가 보이면 성공.
