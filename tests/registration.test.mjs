import test from 'node:test';
import assert from 'node:assert/strict';
import { registrationSchema, usernameSchema } from '../src/lib/registration.ts';
const valid={username:'factory_user',full_name:'검증 회원',email:'member@example.invalid',phone:'010-1234-5678',postal_code:'48231',address:'부산광역시 수영구 예시로 1',address_detail:'',company_name:'',password:'ValidationOnlyPassword!',password_confirm:'ValidationOnlyPassword!',privacy_agreed:'yes'};
test('normalizes ID and phone and accepts optional fields',()=>{const result=registrationSchema.parse({...valid,username:' FACTORY_USER '});assert.equal(result.username,'factory_user');assert.equal(result.phone,'01012345678');assert.equal(result.company_name,'');});
test('rejects invalid usernames',()=>{for(const username of ['abc','1member','bad-id','아이디','a'.repeat(25)])assert.equal(usernameSchema.safeParse(username).success,false,username);});
test('rejects missing or malformed required information',()=>{for(const patch of [{full_name:'  '},{email:'invalid'},{phone:'abc'},{postal_code:'1234'},{address:'  '},{privacy_agreed:'no'}])assert.equal(registrationSchema.safeParse({...valid,...patch}).success,false,JSON.stringify(patch));});
test('rejects short passwords and mismatch',()=>{assert.equal(registrationSchema.safeParse({...valid,password:'short',password_confirm:'short'}).success,false);assert.equal(registrationSchema.safeParse({...valid,password_confirm:'DifferentPassword!'}).success,false);});
