export type SecretBoardPost = { id: string; author_id: string; title: string; body: string; author_username: string; created_at: string; updated_at: string; password_hash: string | null };
export type BoardOperation =
  | { action: "read"; id: string; password: string }
  | { action: "create"; title: string; body: string; password: string }
  | { action: "update"; id: string; title: string; body: string; current_password: string; password?: string }
  | { action: "delete"; id: string; password: string }
  | { action: "set-password"; id: string; password: string };
export type BoardAccessStore = {
  load: (id: string) => Promise<SecretBoardPost | null>;
  create: (value: { author_id: string; title: string; body: string; password_hash: string }) => Promise<string>;
  update: (id: string, owner: string, value: { title: string; body: string; password_hash?: string }) => Promise<boolean>;
  remove: (id: string, owner: string) => Promise<boolean>;
  setInitialPassword: (id: string, owner: string, hash: string) => Promise<boolean>;
  attempt: (key: string, reset: boolean) => Promise<boolean>;
};
export class BoardAccessError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status=status; }
}
export async function accessBoard(input: BoardOperation, userId: string | null, store: BoardAccessStore, crypto: { hash: (value: string) => Promise<string>; verify: (value: string, hash: string) => Promise<boolean> }, attemptKey: string) {
  if (input.action === "create") {
    if (!userId) throw new BoardAccessError(401, "로그인 후 작성해주세요.");
    const id = await store.create({ author_id: userId, title: input.title, body: input.body, password_hash: await crypto.hash(input.password) });
    return { id };
  }
  if (input.action !== "read" && !userId) throw new BoardAccessError(401, "로그인이 필요합니다.");
  const row = await store.load(input.id);
  if (!row) throw new BoardAccessError(404, "삭제되었거나 존재하지 않는 게시글입니다.");
  if (input.action !== "read" && row.author_id !== userId) throw new BoardAccessError(403, "본인이 작성한 게시글만 변경할 수 있습니다.");
  if (input.action === "set-password") {
    if (row.password_hash) throw new BoardAccessError(409, "이미 비밀번호가 설정되어 있습니다.");
    if (!await store.setInitialPassword(row.id, userId!, await crypto.hash(input.password))) throw new BoardAccessError(409, "비밀번호 설정 상태가 변경되었습니다. 새로고침해주세요.");
    return { id: row.id };
  }
  if (!row.password_hash) throw new BoardAccessError(423, "작성자가 열람 비밀번호를 설정하기 전까지 본문은 비공개입니다.");
  if (!await store.attempt(attemptKey, false)) throw new BoardAccessError(429, "비밀번호 확인 시도가 많습니다. 10분 후 다시 시도해주세요.");
  const password = input.action === "update" ? input.current_password : input.password;
  if (!await crypto.verify(password, row.password_hash)) throw new BoardAccessError(403, "열람 비밀번호가 일치하지 않습니다.");
  await store.attempt(attemptKey, true);
  if (input.action === "read") {
    return { post: { id: row.id, title: row.title, body: row.body, author_username: row.author_username, created_at: row.created_at, updated_at: row.updated_at, is_protected: true } };
  }
  if (input.action === "delete") {
    if (!await store.remove(row.id, userId!)) throw new BoardAccessError(409, "이미 삭제되었거나 삭제 권한이 없습니다.");
    return { id: row.id };
  }
  const changed = await store.update(row.id, userId!, { title: input.title, body: input.body, ...(input.password ? { password_hash: await crypto.hash(input.password) } : {}) });
  if (!changed) throw new BoardAccessError(409, "게시글 상태가 변경되었습니다. 새로고침해주세요.");
  return { id: row.id };
}
