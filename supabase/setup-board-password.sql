-- One-time upgrade after setup-board.sql. Existing post bodies are preserved.
begin;
alter table public.site_board_posts add column password_hash text
  check(password_hash is null or password_hash ~ '^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$');
alter table public.site_board_posts add column is_protected boolean generated always as (password_hash is not null) stored;
-- Revoke BOTH table and existing column grants. Table REVOKE alone is insufficient.
revoke all on public.site_board_posts from public,anon,authenticated;
revoke all privileges(id,author_id,author_username,title,body,created_at,updated_at,password_hash,is_protected) on public.site_board_posts from public,anon,authenticated;
grant select(id,title,author_username,created_at,updated_at,is_protected) on public.site_board_posts to anon,authenticated;
grant select(author_id) on public.site_board_posts to authenticated;
grant all on public.site_board_posts to service_role;
grant select on public.registration_profiles to service_role;
drop policy if exists site_board_insert_own on public.site_board_posts;
drop policy if exists site_board_update_own on public.site_board_posts;
drop policy if exists site_board_delete_own on public.site_board_posts;
create or replace function private.stamp_site_board_post() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
  if tg_op='INSERT' then
    if current_user not in ('service_role','postgres') and new.author_id is distinct from auth.uid() then
      raise exception 'BOARD_AUTH_REQUIRED' using errcode='42501';
    end if;
    select username into new.author_username from public.registration_profiles where id=new.author_id;
    if new.author_username is null then raise exception 'BOARD_PROFILE_REQUIRED'; end if;
    new.created_at:=now();
  end if;
  new.updated_at:=now();
  return new;
end; $$;
revoke all on function private.stamp_site_board_post() from public,anon,authenticated;

create table private.board_password_attempts (
  key text primary key check(key ~ '^[a-f0-9]{64}$'),
  attempts integer not null,
  expires_at timestamptz not null
);
alter table private.board_password_attempts enable row level security;
revoke all on private.board_password_attempts from public,anon,authenticated;
grant usage on schema private to service_role;
grant all on private.board_password_attempts to service_role;
create index board_password_attempts_expiry_idx on private.board_password_attempts(expires_at);
create function public.board_password_attempt(p_key text,p_reset boolean default false) returns boolean
language plpgsql security invoker set search_path='' as $$
declare v_count integer;
begin
  if p_reset then delete from private.board_password_attempts where key=p_key; return true; end if;
  delete from private.board_password_attempts where expires_at < now()-interval '1 day';
  insert into private.board_password_attempts as existing(key,attempts,expires_at)
  values(p_key,1,now()+interval '10 minutes')
  on conflict(key) do update set
    attempts=case when existing.expires_at<=now() then 1 else existing.attempts+1 end,
    expires_at=case when existing.expires_at<=now() then now()+interval '10 minutes' else existing.expires_at end
  returning attempts into v_count;
  return v_count<=10;
end; $$;
revoke all on function public.board_password_attempt(text,boolean) from public,anon,authenticated;
grant execute on function public.board_password_attempt(text,boolean) to service_role;
commit;
