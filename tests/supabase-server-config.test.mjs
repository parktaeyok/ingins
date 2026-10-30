import test from 'node:test';
import assert from 'node:assert/strict';
import {supabaseServerConfig} from '../src/lib/supabase-server-config.ts';
const url='https://ejwutsrpugxuexdquchu.supabase.co';const key='sb_secret_test_fixture';
test('uses configured public project URL when the optional server URL is missing',()=>{
  assert.deepEqual(supabaseServerConfig({publicUrl:url,key},url),{url,key});
  assert.deepEqual(supabaseServerConfig({url:'  ',publicUrl:` ${url}/ `,key:` ${key} `},url),{url,key});
});
test('never silently uses a different project',()=>{
  assert.throws(()=>supabaseServerConfig({url:'https://wrong.supabase.co',publicUrl:url,key},url),error=>error.code==='BOARD_URL_MISMATCH');
});
test('distinguishes missing or public keys without exposing credential values',()=>{
  for(const [value,code] of [[undefined,'BOARD_SECRET_MISSING'],['sb_publishable_public_fixture','BOARD_SECRET_FORMAT'],['sb_secret_REPLACE_ME','BOARD_SECRET_FORMAT']])assert.throws(()=>supabaseServerConfig({url,key:value},url),error=>error.code===code&&!error.message.includes(String(value)));
});
test('accepts legacy service role keys and rejects anon JWTs',()=>{
  const token=role=>`header.${Buffer.from(JSON.stringify({role})).toString('base64url')}.signature`;
  assert.equal(supabaseServerConfig({url,key:token('service_role')},url).key,token('service_role'));
  assert.throws(()=>supabaseServerConfig({url,key:token('anon')},url));
});
