-- Run after setup-registration.sql. All fixtures are rolled back; no mail is sent.
begin;
insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,aud,role) values
('a1011111-1111-4111-8111-111111111111','registration-rls-a@example.invalid',now(),'{"registration_version":1,"username":"rls_registration_a","full_name":"검증 회원","display_name":"검증 회원","phone":"01012345678","postal_code":"48231","address":"부산광역시 예시 주소","privacy_agreed":true}','{}',now(),now(),'authenticated','authenticated'),
('a1022222-2222-4222-8222-222222222222','registration-rls-b@example.invalid',now(),'{"registration_version":1,"username":"rls_registration_b","full_name":"다른 회원","display_name":"다른 회원","phone":"01012345679","postal_code":"48231","address":"부산광역시 다른 주소","privacy_agreed":true}','{}',now(),now(),'authenticated','authenticated');
do $$ begin
  assert (select phone='01012345678' and address='부산광역시 예시 주소' from public.registration_profiles where id='a1011111-1111-4111-8111-111111111111'), 'Profile capture failed';
  begin
    insert into auth.users(id,email,raw_user_meta_data) values('a1033333-3333-4333-8333-333333333333','registration-rls-c@example.invalid','{"registration_version":1,"username":"rls_registration_a","full_name":"중복 회원","phone":"01012345678","postal_code":"48231","address":"부산광역시 예시 주소","privacy_agreed":true}');
    raise exception 'Duplicate ID accepted';
  exception when unique_violation then null; end;
  assert not exists(select 1 from auth.users where id='a1033333-3333-4333-8333-333333333333'), 'Duplicate registration was not atomic';
end $$;
set local role anon;
do $$ begin
  assert (select count(*)=1 from public.registration_handles where username='rls_registration_a'), 'Public username check failed';
  begin perform user_id from public.registration_handles; raise exception 'Owner UUID exposed'; exception when insufficient_privilege then null; end;
  begin perform phone from public.registration_profiles; raise exception 'Anonymous PII access'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claims','{"sub":"a1011111-1111-4111-8111-111111111111","role":"authenticated"}',true);
set local role authenticated;
do $$ begin
  assert (select count(*)=1 from public.registration_profiles), 'Other member PII exposed';
  assert (select username='rls_registration_a' from public.registration_profiles), 'Own profile unavailable';
  begin update public.registration_profiles set phone='01000000000'; raise exception 'Direct profile writes allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'PASS: atomic ID uniqueness, field capture, username-only public access, private member contact/address' as result;
rollback;
