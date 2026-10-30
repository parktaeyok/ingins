import test from 'node:test';
import assert from 'node:assert/strict';
import { accessBoard, BoardAccessError } from '../src/lib/board-access.ts';
import { hashBoardPassword, verifyBoardPassword } from '../src/lib/board-password.ts';
const fixture={id:'post-id',author_id:'owner',title:'보호된 제목',body:'PRIVATE_BODY_SENTINEL',password_hash:'hashed',author_username:'writer',created_at:'2026-10-30T00:00:00Z',updated_at:'2026-10-30T00:00:00Z'};
const crypto={async hash(){return 'new-hash';},async verify(value){return value==='known-password';}};
function storage(patch={}){return {async load(){return {...fixture};},async create(){return 'created';},async update(){return true;},async remove(){return true;},async setInitialPassword(){return true;},async attempt(){return true;},...patch};}
const denied=status=>error=>error instanceof BoardAccessError&&error.status===status;
test('salted scrypt hashes verify correctly and do not store the password',async()=>{
  const password='Test-only-password';const first=await hashBoardPassword(password);const second=await hashBoardPassword(password);
  assert.notEqual(first,second);assert.ok(!first.includes(password));assert.equal(await verifyBoardPassword(password,first),true);assert.equal(await verifyBoardPassword('wrong',first),false);assert.equal(await verifyBoardPassword(password,'invalid'),false);
});
test('wrong password returns neither body nor hash, including for the owner',async()=>{
  for(const user of [null,'owner'])await assert.rejects(accessBoard({action:'read',id:'post-id',password:'wrong'},user,storage(),crypto,'key'),error=>{assert.ok(!error.message.includes(fixture.body));return denied(403)(error);});
});
test('correct password returns only the allowed post fields',async()=>{
  const result=await accessBoard({action:'read',id:'post-id',password:'known-password'},null,storage(),crypto,'key');
  assert.equal(result.post.body,fixture.body);assert.ok(!('password_hash' in result.post));assert.ok(!('author_id' in result.post));
});
test('read attempts fail closed when durable limiter denies or fails',async()=>{
  await assert.rejects(accessBoard({action:'read',id:'post-id',password:'known-password'},null,storage({async attempt(){return false;}}),crypto,'key'),denied(429));
  await assert.rejects(accessBoard({action:'read',id:'post-id',password:'known-password'},null,storage({async attempt(){throw new Error('limiter offline');}}),crypto,'key'),/limiter offline/);
});
test('legacy bodies stay locked; only the owner can initialize their password',async()=>{
  const store=storage({async load(){return {...fixture,password_hash:null};}});
  await assert.rejects(accessBoard({action:'read',id:'post-id',password:'anything'},'owner',store,crypto,'key'),denied(423));
  await assert.rejects(accessBoard({action:'set-password',id:'post-id',password:'new-password'},'other',store,crypto,'key'),denied(403));
  assert.deepEqual(await accessBoard({action:'set-password',id:'post-id',password:'new-password'},'owner',store,crypto,'key'),{id:'post-id'});
  await assert.rejects(accessBoard({action:'set-password',id:'post-id',password:'new-password'},'owner',storage(),crypto,'key'),denied(409));
});
test('knowing the password does not grant another user edit or delete rights',async()=>{
  for(const action of ['update','delete'])await assert.rejects(accessBoard({action,id:'post-id',title:'수정',body:'본문',password:'known-password',current_password:'known-password'},'other',storage(),crypto,'key'),denied(403));
});
test('owner updates still require the current password and retain a hash when unchanged',async()=>{
  await assert.rejects(accessBoard({action:'update',id:'post-id',title:'수정',body:'본문',current_password:'wrong'},'owner',storage(),crypto,'key'),denied(403));
  let fields;const store=storage({async update(id,owner,value){assert.equal(owner,'owner');fields=value;return true;}});
  await accessBoard({action:'update',id:'post-id',title:'수정',body:'본문',current_password:'known-password'},'owner',store,crypto,'key');
  assert.deepEqual(fields,{title:'수정',body:'본문'});
});
test('create requires login and persists only a hash',async()=>{
  const input={action:'create',title:'새 제목',body:'새 본문',password:'known-password'};
  await assert.rejects(accessBoard(input,null,storage(),crypto,'key'),denied(401));
  let saved;await accessBoard(input,'owner',storage({async create(value){saved=value;return 'created';}}),crypto,'key');
  assert.deepEqual(saved,{author_id:'owner',title:'새 제목',body:'새 본문',password_hash:'new-hash'});
});
