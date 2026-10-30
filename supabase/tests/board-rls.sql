-- Historical test for the public-body board BEFORE setup-board-password.sql.
-- For the current protected board use board-password-rls.sql instead.
-- Synthetic users have no passwords or login identities; ALL changes roll back.
begin;
create temporary table board_test_users(label text,id uuid,username text);
insert into board_test_users values
  ('a',gen_random_uuid(),'boardtest_'||substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  ('b',gen_random_uuid(),'boardtest_'||substr(replace(gen_random_uuid()::text,'-',''),1,8));
grant select on board_test_users to anon,authenticated;
insert into auth.users(id,email,aud,role,raw_app_meta_data,raw_user_meta_data)
select id,id::text||'@example.invalid','authenticated','authenticated','{}'::jsonb,
  jsonb_build_object('registration_version',1,'username',username,'full_name','검증 회원','phone','01012345678','postal_code','12345','address','권한 검증용 주소','privacy_agreed',true)
from board_test_users;

select set_config('request.jwt.claim.sub',(select id::text from board_test_users where label='a'),true);
set local role authenticated;
insert into public.site_board_posts(author_id,title,body)
values(auth.uid(),'권한 검증용 게시글','이 트랜잭션은 반드시 롤백됩니다.');
do $$ begin
  if not exists(select 1 from public.site_board_posts where author_id=auth.uid() and author_username=(select username from board_test_users where label='a')) then
    raise exception 'FAIL: own insert or author stamping';
  end if;
  begin
    insert into public.site_board_posts(author_id,title,body) values((select id from board_test_users where label='b'),'위조 작성자','허용되면 안 됩니다.');
    raise exception 'FAIL: forged author accepted';
  exception when insufficient_privilege then null; end;
  begin
    update public.site_board_posts set author_id=(select id from board_test_users where label='b') where author_id=auth.uid();
    raise exception 'FAIL: ownership reassignment accepted';
  exception when insufficient_privilege then null; end;
  update public.site_board_posts set title='수정된 검증 게시글' where author_id=auth.uid();
  if not found then raise exception 'FAIL: own update'; end if;
end $$;
reset role;

select set_config('request.jwt.claim.sub',(select id::text from board_test_users where label='b'),true);
set local role authenticated;
do $$ begin
  if not exists(select 1 from public.site_board_posts where author_id=(select id from board_test_users where label='a')) then raise exception 'FAIL: member read'; end if;
  update public.site_board_posts set title='타인 수정 시도' where author_id=(select id from board_test_users where label='a');
  if found then raise exception 'FAIL: other member update'; end if;
  delete from public.site_board_posts where author_id=(select id from board_test_users where label='a');
  if found then raise exception 'FAIL: other member delete'; end if;
end $$;
reset role;

select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $$ begin
  if not exists(select id from public.site_board_posts where author_username=(select username from board_test_users where label='a')) then raise exception 'FAIL: anonymous read'; end if;
  begin
    perform author_id from public.site_board_posts limit 1;
    raise exception 'FAIL: anonymous owner UUID read';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.site_board_posts(author_id,title,body) values((select id from board_test_users where label='a'),'비회원 작성','허용되면 안 됩니다.');
    raise exception 'FAIL: anonymous insert';
  exception when insufficient_privilege then null; end;
  begin
    update public.site_board_posts set title='비회원 수정';
    raise exception 'FAIL: anonymous update';
  exception when insufficient_privilege then null; end;
  begin
    delete from public.site_board_posts;
    raise exception 'FAIL: anonymous delete';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

select set_config('request.jwt.claim.sub',(select id::text from board_test_users where label='a'),true);
set local role authenticated;
do $$ begin
  delete from public.site_board_posts where author_id=auth.uid();
  if not found then raise exception 'FAIL: own delete'; end if;
end $$;
reset role;
rollback;
-- A successful execution leaves no test users, posts, or temporary table behind.
