-- Run on a development connection; all fixtures and changes are rolled back.
begin;
insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data,raw_app_meta_data,created_at,updated_at,aud,role) values
('11111111-1111-4111-8111-111111111111','community-a@example.invalid',now(),'{"display_name":"검증회원A","role":"admin"}','{}',now(),now(),'authenticated','authenticated'),
('22222222-2222-4222-8222-222222222222','community-b@example.invalid',now(),'{"display_name":"검증회원B"}','{}',now(),now(),'authenticated','authenticated'),
('33333333-3333-4333-8333-333333333333','taeyok@naver.com',null,'{"display_name":"검증관리자"}','{}',now(),now(),'authenticated','authenticated');
do $$ begin
  assert (select role='member' from public.member_profiles where id='11111111-1111-4111-8111-111111111111'), 'User metadata must not grant admin';
  assert (select role='member' from public.member_profiles where id='33333333-3333-4333-8333-333333333333'), 'Unverified admin email must remain member';
end $$;
update auth.users set email_confirmed_at=now() where id='33333333-3333-4333-8333-333333333333';
do $$ begin
  assert (select role='admin' from public.member_profiles where id='33333333-3333-4333-8333-333333333333'), 'Verified admin email bootstrap failed';
end $$;
insert into public.community_posts(id,board_id,author_id,author_name,title,content)
select '44444444-4444-4444-8444-444444444444',id,'22222222-2222-4222-8222-222222222222','검증회원B','다른 회원의 글','다른 회원의 원래 내용' from public.community_boards where slug='questions';

set local role anon;
do $$ begin
  assert (select count(*)>=3 from public.community_boards), 'Public board read';
  assert (select count(*)>=1 from public.community_posts), 'Public post read';
  begin perform id from public.member_profiles; raise exception 'Anonymous profile read allowed'; exception when insufficient_privilege then null; end;
  begin insert into public.community_boards(slug,name) values('anon-test','익명 게시판'); raise exception 'Anonymous board insert allowed'; exception when insufficient_privilege then null; end;
end $$;

reset role;
select set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated","is_anonymous":false}',true);
set local role authenticated;
do $$ declare affected integer; begin
  assert (select count(*)=1 from public.member_profiles), 'Member must only see own profile';
  begin update public.member_profiles set role='admin' where id=auth.uid(); raise exception 'Role escalation allowed'; exception when insufficient_privilege then null; end;
  begin update public.member_profiles set active=false where id=auth.uid(); raise exception 'Self status change allowed'; exception when insufficient_privilege then null; end;
  update public.member_profiles set active=false where id='22222222-2222-4222-8222-222222222222'; get diagnostics affected=row_count; assert affected=0, 'Other member state update allowed';
  begin insert into public.community_boards(slug,name) values('member-test','일반 게시판'); raise exception 'Member created board'; exception when insufficient_privilege then null; end;
  begin insert into public.community_posts(board_id,author_id,author_name,title,content) select id,auth.uid(),'검증회원A','공지 위조','공지 작성 불가 검증' from public.community_boards where slug='notice'; raise exception 'Member wrote notice'; exception when insufficient_privilege then null; end;
  begin insert into public.community_posts(board_id,author_id,author_name,title,content) select id,'22222222-2222-4222-8222-222222222222','위조 회원','작성자 위조','다른 회원 사칭 검증' from public.community_boards where slug='questions'; raise exception 'Author spoof allowed'; exception when insufficient_privilege then null; end;
  insert into public.community_posts(board_id,author_id,author_name,title,content) select id,auth.uid(),'검증회원A','정상 작성','회원 본인 글 작성 검증' from public.community_boards where slug='questions';
  update public.community_posts set content='본인 글 수정 검증' where author_id=auth.uid(); get diagnostics affected=row_count; assert affected=1, 'Own update failed';
  update public.community_posts set content='다른 글 수정 시도' where id='44444444-4444-4444-8444-444444444444'; get diagnostics affected=row_count; assert affected=0, 'Other post update allowed';
  delete from public.community_posts where id='44444444-4444-4444-8444-444444444444'; get diagnostics affected=row_count; assert affected=0, 'Other post deletion allowed';
end $$;

reset role;
update public.member_profiles set active=false where id='11111111-1111-4111-8111-111111111111';
set local role authenticated;
do $$ declare affected integer; begin
  begin insert into public.community_posts(board_id,author_id,author_name,title,content) select id,auth.uid(),'검증회원A','중지 회원','중지 회원 작성 시도' from public.community_boards where slug='questions'; raise exception 'Blocked member posted'; exception when insufficient_privilege then null; end;
  update public.community_posts set content='중지 회원 수정 시도' where author_id=auth.uid(); get diagnostics affected=row_count; assert affected=0, 'Blocked member updated';
  update public.member_profiles set active=true where id=auth.uid(); get diagnostics affected=row_count; assert affected=0, 'Blocked member reactivated self';
end $$;

reset role;
select set_config('request.jwt.claims','{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated","is_anonymous":false}',true);
set local role authenticated;
do $$ declare affected integer; begin
  assert (select count(*)>=3 from public.member_profiles), 'Admin member list failed';
  insert into public.community_boards(slug,name) values('admin-test','관리자 게시판');
  update public.member_profiles set active=true where id='11111111-1111-4111-8111-111111111111'; get diagnostics affected=row_count; assert affected=1, 'Admin member activation failed';
  delete from public.community_posts where id='44444444-4444-4444-8444-444444444444'; get diagnostics affected=row_count; assert affected=1, 'Admin moderation failed';
end $$;
reset role;
select 'PASS: verified-email admin bootstrap, public reads, ownership, role escalation, member suspension, admin board creation and moderation' as result;
rollback;
