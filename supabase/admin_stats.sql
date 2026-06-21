-- =============================================================
-- 받아줘 — 관리자 통계 (가입/편지 수)
-- /admin 페이지에서 호출. RLS 로 막힌 집계를 관리자만 보도록 SECURITY DEFINER RPC.
-- 관리자 식별 = profiles.is_admin = true 인 계정의 inbox_token.
-- 사용법: Supabase SQL Editor 에 붙여넣고 Run. 멱등.
-- =============================================================

-- 1. 관리자 플래그 컬럼
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- 2. 본인 계정(dksrlqor)을 관리자로 지정.
--    (다른 사람을 추가하려면 같은 형식으로 한 줄 더 실행)
update public.profiles set is_admin = true where username = 'dksrlqor';

-- 3. 통계 RPC — 관리자 토큰일 때만 집계 반환, 아니면 빈 결과(권한 없음)
create or replace function public.get_admin_stats(p_token text)
returns table (signups bigint, named bigint, inbox_letters bigint, simple_letters bigint)
language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from public.profiles where inbox_token = p_token and is_admin = true
  ) then
    return; -- 권한 없음 → 빈 결과
  end if;
  return query select
    (select count(*) from public.profiles),
    (select count(*) from public.profiles where username is not null),
    (select count(*) from public.letters where is_deleted = false),
    (select count(*) from public.simple_letters where is_deleted = false);
end; $$;

revoke all on function public.get_admin_stats(text) from public;
grant execute on function public.get_admin_stats(text) to anon, authenticated;

-- 끝. 관리자 추가는: update public.profiles set is_admin = true where username = '아이디';
