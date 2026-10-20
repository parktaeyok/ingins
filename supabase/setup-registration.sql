-- One-time additive setup. Existing member/community tables are left intact.
create schema if not exists private;
create table public.registration_handles (
  username text primary key check(username ~ '^[a-z][a-z0-9_]{3,23}$'),
  user_id uuid not null unique references auth.users(id) on delete cascade
);
create table public.registration_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique references public.registration_handles(username),
  full_name text not null check(char_length(trim(full_name)) between 2 and 80),
  phone text not null check(phone ~ '^(0[0-9]{8,10}|\+[0-9]{8,15})$'),
  postal_code text not null check(postal_code ~ '^[0-9]{5}$'),
  address text not null check(char_length(trim(address)) between 5 and 200),
  address_detail text not null default '' check(char_length(address_detail)<=150),
  company_name text not null default '' check(char_length(company_name)<=100),
  privacy_agreed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.registration_handles enable row level security;
alter table public.registration_profiles enable row level security;
revoke all on public.registration_handles,public.registration_profiles from public,anon,authenticated;
-- Only usernames are public for availability checks; the owner UUID is not exposed.
grant select(username) on public.registration_handles to anon,authenticated;
-- Server-only ID login resolves the owner without exposing it to browsers.
grant select on public.registration_handles to service_role;
grant select on public.registration_profiles to authenticated;
create policy registration_username_check on public.registration_handles for select to anon,authenticated using(true);
create policy registration_own_profile on public.registration_profiles for select to authenticated using(id=(select auth.uid()));

-- A trigger is required to atomically reserve an ID and save registration fields
-- in the same transaction as the Auth account creation.
create function private.capture_registration() returns trigger
language plpgsql security definer set search_path='' as $$
declare fields jsonb := new.raw_user_meta_data; login_name text;
begin
  if coalesce(fields->>'registration_version','') <> '1' then return new; end if;
  if coalesce(fields->>'privacy_agreed','false') <> 'true' then raise exception 'REGISTRATION_CONSENT_REQUIRED'; end if;
  login_name := lower(trim(fields->>'username'));
  if login_name is null or login_name !~ '^[a-z][a-z0-9_]{3,23}$' then raise exception 'REGISTRATION_USERNAME_INVALID'; end if;
  insert into public.registration_handles(username,user_id) values(login_name,new.id);
  insert into public.registration_profiles(id,username,full_name,phone,postal_code,address,address_detail,company_name)
  values(new.id,login_name,trim(fields->>'full_name'),fields->>'phone',trim(fields->>'postal_code'),trim(fields->>'address'),coalesce(trim(fields->>'address_detail'),''),coalesce(trim(fields->>'company_name'),''));
  return new;
end; $$;
revoke all on function private.capture_registration() from public,anon,authenticated;
create trigger registration_capture_after_signup after insert on auth.users for each row execute function private.capture_registration();
