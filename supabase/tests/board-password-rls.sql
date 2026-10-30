-- After setup-board-password.sql. All synthetic rows are rolled back.
begin;
create temporary table password_test_user as select gen_random_uuid() as id,'boardpw_'||substr(replace(gen_random_uuid()::text,'-',''),1,8) as username;
grant select on password_test_user to service_role;
insert into auth.users(id,email,aud,role,raw_app_meta_data,raw_user_meta_data)
select id,id::text||'@example.invalid','authenticated','authenticated','{}'::jsonb,
jsonb_build_object('registration_version',1,'username',username,'full_name','권한 검증','phone','01012345678','postal_code','12345','address','검증 전용 임시 주소','privacy_agreed',true)
from password_test_user;
set local role anon;
do $$ begin
  perform id,title,is_protected from public.site_board_posts limit 1;
  begin perform body from public.site_board_posts limit 1; raise exception 'FAIL: anonymous body read'; exception when insufficient_privilege then null; end;
  begin perform password_hash from public.site_board_posts limit 1; raise exception 'FAIL: anonymous hash read'; exception when insufficient_privilege then null; end;
  begin perform public.board_password_attempt(repeat('a',64),false); raise exception 'FAIL: anonymous limiter call'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
do $$ begin
  perform id,title,author_id from public.site_board_posts limit 1;
  begin perform body from public.site_board_posts limit 1; raise exception 'FAIL: member body read'; exception when insufficient_privilege then null; end;
  begin perform password_hash from public.site_board_posts limit 1; raise exception 'FAIL: member hash read'; exception when insufficient_privilege then null; end;
  begin insert into public.site_board_posts(author_id,title,body) values(gen_random_uuid(),'직접 작성','허용되면 안 됩니다.'); raise exception 'FAIL: direct member insert'; exception when insufficient_privilege then null; end;
  begin update public.site_board_posts set title='직접 수정'; raise exception 'FAIL: direct member update'; exception when insufficient_privilege then null; end;
  begin delete from public.site_board_posts; raise exception 'FAIL: direct member delete'; exception when insufficient_privilege then null; end;
  begin perform public.board_password_attempt(repeat('a',64),true); raise exception 'FAIL: member limiter reset'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role service_role;
do $$ declare v_post uuid; v_key text:=md5(gen_random_uuid()::text)||md5(gen_random_uuid()::text); i integer; begin
  insert into public.site_board_posts(author_id,title,body,password_hash)
  select id,'서비스 권한 검증','임시 본문','scrypt$'||repeat('a',32)||'$'||repeat('b',128) from password_test_user returning id into v_post;
  if not exists(select 1 from public.site_board_posts where id=v_post and is_protected and body='임시 본문') then raise exception 'FAIL: server insert/read'; end if;
  update public.site_board_posts set body='수정된 임시 본문' where id=v_post;
  if not found then raise exception 'FAIL: server update'; end if;
  for i in 1..10 loop if not public.board_password_attempt(v_key,false) then raise exception 'FAIL: early limiter denial'; end if; end loop;
  if public.board_password_attempt(v_key,false) then raise exception 'FAIL: limiter allowed attempt 11'; end if;
  perform public.board_password_attempt(v_key,true);
  if not public.board_password_attempt(v_key,false) then raise exception 'FAIL: limiter reset'; end if;
  delete from public.site_board_posts where id=v_post;
  if not found then raise exception 'FAIL: server delete'; end if;
end $$;
reset role;
rollback;
