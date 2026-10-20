-- Existing member_profiles data and the legacy username/full_name columns are retained.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table if not exists public.member_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  full_name text not null default '',
  company_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.member_profiles
  add column if not exists display_name text not null default '회원',
  add column if not exists role text not null default 'member' check (role in ('member','admin')),
  add column if not exists active boolean not null default true;
alter table public.member_profiles alter column username set default ('u_' || substr(replace(gen_random_uuid()::text,'-',''),1,20));
update public.member_profiles set display_name=left(full_name,40) where full_name<>'' and display_name='회원';
alter table public.member_profiles add constraint community_display_name_length check (char_length(display_name) between 2 and 40);
create index if not exists member_profiles_created_idx on public.member_profiles(created_at desc,id);

create table private.community_admin_emails (email text primary key);
revoke all on private.community_admin_emails from public, anon, authenticated;
insert into private.community_admin_emails(email) values ('taeyok@naver.com');

-- Email ownership must be confirmed before bootstrap administrator assignment.
create or replace function private.create_member_profile() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  insert into public.member_profiles(id,username,display_name,full_name,company_name,role,created_at)
  values(new.id,'u_' || substr(replace(new.id::text,'-',''),1,20),
    left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''),'회원'),40),
    left(coalesce(new.raw_user_meta_data->>'display_name',''),80),
    left(coalesce(new.raw_user_meta_data->>'company_name',''),100),
    case when new.email_confirmed_at is not null and exists(select 1 from private.community_admin_emails where email=lower(new.email)) then 'admin' else 'member' end,
    coalesce(new.created_at,now()));
  return new;
end; $$;
revoke all on function private.create_member_profile() from public,anon,authenticated;
drop trigger if exists on_auth_user_created_member_profile on auth.users;
create trigger on_auth_user_created_member_profile after insert on auth.users for each row execute function private.create_member_profile();

create function private.confirm_community_administrator() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if new.email_confirmed_at is not null and exists(select 1 from private.community_admin_emails where email=lower(new.email)) then
    update public.member_profiles set role='admin' where id=new.id;
  end if;
  return new;
end; $$;
revoke all on function private.confirm_community_administrator() from public,anon,authenticated;
create trigger on_auth_email_verified_community_admin after update of email,email_confirmed_at on auth.users for each row execute function private.confirm_community_administrator();

-- Backfill existing Auth users without altering existing identities.
insert into public.member_profiles(id,username,display_name,full_name,company_name,created_at)
select id,'u_' || substr(replace(id::text,'-',''),1,20),
  left(coalesce(nullif(trim(raw_user_meta_data->>'display_name'),''),'회원'),40),
  left(coalesce(raw_user_meta_data->>'display_name',''),80),
  left(coalesce(raw_user_meta_data->>'company_name',''),100),created_at
from auth.users on conflict(id) do nothing;
update public.member_profiles p set role='admin' from auth.users u
where p.id=u.id and u.email_confirmed_at is not null and exists(select 1 from private.community_admin_emails a where a.email=lower(u.email));

-- Helpers are in a non-exposed schema, have no caller-supplied identity,
-- and check the current, confirmed Auth user and database role/status.
create function private.community_is_admin() returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.member_profiles p join auth.users u on u.id=p.id
    where p.id=auth.uid() and p.role='admin' and p.active and u.email_confirmed_at is not null
    and coalesce(auth.jwt()->>'is_anonymous','false')='false');
$$;
create function private.community_is_member() returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.member_profiles p join auth.users u on u.id=p.id
    where p.id=auth.uid() and p.active and u.email_confirmed_at is not null
    and coalesce(auth.jwt()->>'is_anonymous','false')='false');
$$;
revoke all on function private.community_is_admin() from public,anon;
revoke all on function private.community_is_member() from public,anon;
grant execute on function private.community_is_admin(),private.community_is_member() to authenticated;

create table public.community_boards (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check(slug ~ '^[a-z][a-z0-9-]{1,39}$'),
  name text not null check(char_length(name) between 2 and 40),
  description text not null default '' check(char_length(description)<=200),
  write_role text not null default 'member' check(write_role in ('member','admin')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.community_boards(id),
  author_id uuid not null references public.member_profiles(id),
  author_name text not null check(char_length(author_name) between 2 and 40),
  title text not null check(char_length(trim(title)) between 2 and 150),
  content text not null check(char_length(trim(content)) between 5 and 20000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index community_posts_board_created_idx on public.community_posts(board_id,created_at desc,id);
create index community_posts_created_idx on public.community_posts(created_at desc,id);
create index community_posts_author_idx on public.community_posts(author_id);
create function private.community_touch_updated() returns trigger
language plpgsql set search_path='' as $$ begin new.updated_at=now(); return new; end; $$;
revoke all on function private.community_touch_updated() from public,anon,authenticated;
create trigger community_posts_updated before update on public.community_posts for each row execute function private.community_touch_updated();
create trigger community_members_updated before update on public.member_profiles for each row execute function private.community_touch_updated();

alter table public.member_profiles enable row level security;
alter table public.community_boards enable row level security;
alter table public.community_posts enable row level security;
do $$ declare item record; begin
  for item in select policyname from pg_policies where schemaname='public' and tablename='member_profiles' loop
    execute format('drop policy %I on public.member_profiles',item.policyname);
  end loop;
end; $$;
revoke all on public.member_profiles,public.community_boards,public.community_posts from public,anon,authenticated;
grant select on public.member_profiles to authenticated;
grant insert(id,display_name,full_name,company_name) on public.member_profiles to authenticated;
grant update(display_name,full_name,company_name,active) on public.member_profiles to authenticated;
grant select on public.community_boards,public.community_posts to anon,authenticated;
grant insert(slug,name,description,write_role) on public.community_boards to authenticated;
grant insert(board_id,author_id,author_name,title,content) on public.community_posts to authenticated;
grant update(title,content) on public.community_posts to authenticated;
grant delete on public.community_posts to authenticated;

create policy community_profile_read on public.member_profiles for select to authenticated using(id=(select auth.uid()) or (select private.community_is_admin()));
create policy community_profile_insert on public.member_profiles for insert to authenticated with check(id=(select auth.uid()) and role='member' and active and coalesce(auth.jwt()->>'is_anonymous','false')='false');
create policy community_profile_update on public.member_profiles for update to authenticated
  using((id=(select auth.uid()) and active) or (select private.community_is_admin()))
  with check((id=(select auth.uid()) and active) or (select private.community_is_admin()));

create policy community_board_read on public.community_boards for select to anon,authenticated using(active);
create policy community_board_admin_read on public.community_boards for select to authenticated using((select private.community_is_admin()));
create policy community_board_create on public.community_boards for insert to authenticated with check((select private.community_is_admin()));
create policy community_post_read on public.community_posts for select to anon,authenticated using(exists(select 1 from public.community_boards b where b.id=board_id and b.active));
create policy community_post_admin_read on public.community_posts for select to authenticated using((select private.community_is_admin()));
create policy community_post_create on public.community_posts for insert to authenticated
  with check(author_id=(select auth.uid()) and (select private.community_is_member()) and exists(select 1 from public.community_boards b where b.id=board_id and b.active and (b.write_role='member' or (select private.community_is_admin()))));
create policy community_post_update on public.community_posts for update to authenticated
  using((select private.community_is_member()) and (author_id=(select auth.uid()) or (select private.community_is_admin())))
  with check((select private.community_is_member()) and (author_id=(select auth.uid()) or (select private.community_is_admin())));
create policy community_post_delete on public.community_posts for delete to authenticated
  using((select private.community_is_member()) and (author_id=(select auth.uid()) or (select private.community_is_admin())));

insert into public.community_boards(slug,name,description,write_role) values
('notice','공지사항','사이트와 서비스의 새 소식을 전합니다.','admin'),
('questions','질문과 답변','제조 AX 도입과 데이터 활용에 관한 질문을 나눕니다.','member'),
('field-stories','현장 이야기','생산·품질·공급망 업무의 경험과 아이디어를 나눕니다.','member');
