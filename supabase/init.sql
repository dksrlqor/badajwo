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

-- 2. RLS -------------------------------------------------------
alter table public.simple_letters enable row level security;

-- anon insert — 사용자는 백엔드 인증 없이 편지를 만들 수 있어야 한다.
drop policy if exists simple_letters_insert_anon on public.simple_letters;
create policy simple_letters_insert_anon
  on public.simple_letters
  for insert
  to anon, authenticated
  with check (true);

-- 누구나 select — 공유 링크의 본질. code 가 곧 토큰(8자 base36 ≈ 2.8조 조합).
-- 삭제된 row 는 보이지 않음.
drop policy if exists simple_letters_select_public on public.simple_letters;
create policy simple_letters_select_public
  on public.simple_letters
  for select
  to anon, authenticated
  using (is_deleted = false);

-- UPDATE/DELETE 는 정책을 만들지 않아 anon 차단.
-- view_count 증가는 아래 RPC 로만 가능.

-- 3. view_count 증가 RPC ---------------------------------------
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
      and is_deleted = false;
end;
$$;

revoke all on function public.increment_letter_view(text) from public;
grant execute on function public.increment_letter_view(text) to anon, authenticated;

-- 4. Storage bucket: letter-photos -----------------------------
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
