import test from 'node:test';
import assert from 'node:assert/strict';
import { boardPostSchema, boardIdSchema, escapeBoardSearch, boardError } from '../src/lib/board.ts';
test('board input trims text and rejects empty or oversized content',()=>{
  assert.deepEqual(boardPostSchema.parse({title:' 제목 ',body:' 본문 내용 '}),{title:'제목',body:'본문 내용'});
  for(const value of [{title:' ',body:'본문'},{title:'제목',body:' '},{title:'x'.repeat(121),body:'본문'},{title:'제목',body:'x'.repeat(10001)}])assert.equal(boardPostSchema.safeParse(value).success,false);
});
test('board text remains plain text and cannot introduce extra ownership fields',()=>{
  assert.deepEqual(boardPostSchema.parse({title:'<script>alert(1)</script>',body:'<b>내용</b>',author_id:'forged'}),{title:'<script>alert(1)</script>',body:'<b>내용</b>'});
});
test('search treats SQL wildcard characters literally and bounds input',()=>{
  assert.equal(escapeBoardSearch('  50%_\\  '),'50\\%\\_\\\\');
  assert.equal(escapeBoardSearch('a'.repeat(100)).length,80);
});
test('IDs and unavailable storage are handled explicitly',()=>{
  assert.equal(boardIdSchema.safeParse('not-a-post').success,false);
  assert.equal(boardIdSchema.safeParse('9b10ba0d-71b9-45fb-aa01-b4bfc21d4c31').success,true);
  assert.match(boardError('PGRST205'),/준비/);
});
