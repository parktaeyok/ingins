-- One-time additive setup for ejwutsrpugxuexdquchu.
-- Requires registration_profiles from setup-registration.sql. Does not alter member tables.
begin;
create schema if not exists private;
create table public.site_board_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  author_username text not null,
  title text not null check (char_length(trim(title)) between 2 and 120),
  body text not null check (char_length(trim(body)) between 2 and 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index site_board_posts_created_idx on public.site_board_posts (created_at desc,id desc);
create index site_board_posts_author_idx on public.site_board_posts (author_id);
alter table public.site_board_posts enable row level security;
revoke all on public.site_board_posts from public,anon,authenticated;
grant select(id,title,body,author_username,created_at,updated_at) on public.site_board_posts to anon,authenticated;
grant select(author_id) on public.site_board_posts to authenticated;
grant insert(author_id,title,body),update(title,body),delete on public.site_board_posts to authenticated;
create policy site_board_read on public.site_board_posts for select to anon,authenticated using(true);
create policy site_board_insert_own on public.site_board_posts for insert to authenticated with check(author_id=(select auth.uid()));
create policy site_board_update_own on public.site_board_posts for update to authenticated using(author_id=(select auth.uid())) with check(author_id=(select auth.uid()));
create policy site_board_delete_own on public.site_board_posts for delete to authenticated using(author_id=(select auth.uid()));

-- Invoker rights: the caller can read only their own registration profile.
-- Clients cannot supply a different author label or edit ownership/timestamps.
create function private.stamp_site_board_post() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
  if tg_op='INSERT' then
    if new.author_id is distinct from auth.uid() then
      raise exception 'BOARD_AUTH_REQUIRED' using errcode='42501';
    end if;
    select username into new.author_username from public.registration_profiles where id=auth.uid();
    if new.author_username is null then raise exception 'BOARD_PROFILE_REQUIRED'; end if;
    new.created_at:=now();
  end if;
  new.updated_at:=now();
  return new;
end; $$;
revoke all on function private.stamp_site_board_post() from public,anon,authenticated;
create trigger site_board_stamp before insert or update on public.site_board_posts for each row execute function private.stamp_site_board_post();
commit;
