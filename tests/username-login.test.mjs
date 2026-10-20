import test from 'node:test';
import assert from 'node:assert/strict';
import { loginByUsername, createLoginLimiter } from '../src/lib/username-login.ts';

test('resolves username privately and returns only verified session tokens', async () => {
  const session=await loginByUsername('factory_user','test-password',{
    async findUserId(name){assert.equal(name,'factory_user');return 'user-uuid';},
    async findEmail(id){assert.equal(id,'user-uuid');return 'private@example.invalid';},
    async authenticate(email,password){assert.equal(email,'private@example.invalid');assert.equal(password,'test-password');return {access_token:'test-access',refresh_token:'test-refresh',email};},
  });
  assert.deepEqual(session,{access_token:'test-access',refresh_token:'test-refresh'});
});
test('wrong password never creates a session',async()=>{
  assert.equal(await loginByUsername('factory_user','wrong',{async findUserId(){return 'id';},async findEmail(){return 'private@example.invalid';},async authenticate(){return null;}}),null);
});
test('unknown ID still runs password verification without returning a session',async()=>{
  let verified=false;
  const result=await loginByUsername('unknown','wrong',{async findUserId(){return null;},async findEmail(){throw new Error('must not look up');},async authenticate(email){assert.equal(email,'unknown-account@invalid.invalid');verified=true;return {access_token:'unexpected',refresh_token:'unexpected'};}});
  assert.equal(result,null);assert.equal(verified,true);
});
test('database failure fails closed',async()=>{
  await assert.rejects(loginByUsername('factory_user','wrong',{async findUserId(){throw new Error('database offline');},async findEmail(){return null;},async authenticate(){throw new Error('must not authenticate');}}),/database offline/);
});
test('limits attempts per account and expires the window',()=>{
  let time=1000;const allow=createLoginLimiter(()=>time);
  for(let i=0;i<8;i++)assert.equal(allow('factory_user'),true);
  assert.equal(allow('factory_user'),false);assert.equal(allow('another_user'),true);
  time+=60000;assert.equal(allow('factory_user'),true);
});
