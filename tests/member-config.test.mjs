import test from 'node:test';
import assert from 'node:assert/strict';
import { MEMBER_PROJECT_URL, memberPublicConfig, normalizeMemberUrl } from '../src/lib/member-project.ts';

const publicKey='sb_publishable_test_public_fixture';
test('accepts configured project with whitespace and a trailing slash',()=>{
  assert.deepEqual(memberPublicConfig(` ${MEMBER_PROJECT_URL}/ `,` ${publicKey} `),{url:MEMBER_PROJECT_URL,key:publicKey});
  assert.equal(normalizeMemberUrl(undefined),'');
});
test('missing build variables keep registration disconnected',()=>{
  assert.equal(memberPublicConfig(undefined,undefined),null);
  assert.equal(memberPublicConfig(MEMBER_PROJECT_URL,''),null);
});
test('rejects another project, placeholders, secrets and malformed keys',()=>{
  assert.equal(memberPublicConfig('https://another-project.supabase.co',publicKey),null);
  for(const key of ['sb_publishable_REPLACE_ME','sb_secret_test_fixture','invalid','"'+publicKey+'"']) assert.equal(memberPublicConfig(MEMBER_PROJECT_URL,key),null);
});
test('supports the legacy anon key format without requiring it',()=>{
  const token=role=>`header.${btoa(JSON.stringify({role}))}.signature`;
  assert.ok(memberPublicConfig(MEMBER_PROJECT_URL,token('anon')));
  assert.equal(memberPublicConfig(MEMBER_PROJECT_URL,token('service_role')),null);
  assert.equal(memberPublicConfig(MEMBER_PROJECT_URL,'header.payload.signature'),null);
});
