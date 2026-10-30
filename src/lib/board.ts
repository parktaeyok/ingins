import { z } from "zod";

export const boardPostSchema = z.object({
  title: z.string().trim().min(2, "제목을 2자 이상 입력해주세요.").max(120, "제목은 120자까지 입력할 수 있습니다."),
  body: z.string().trim().min(2, "내용을 2자 이상 입력해주세요.").max(10000, "내용은 10,000자까지 입력할 수 있습니다."),
});
export const boardIdSchema = z.uuid();
export const boardPasswordSchema = z.string().min(8, "열람 비밀번호는 8자 이상 입력해주세요.").max(128);
const enteredPassword = z.string().min(1, "열람 비밀번호를 입력해주세요.").max(128);
export const boardOperationSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("read"), id: boardIdSchema, password: enteredPassword }),
  boardPostSchema.extend({ action: z.literal("create"), password: boardPasswordSchema }),
  boardPostSchema.extend({ action: z.literal("update"), id: boardIdSchema, current_password: enteredPassword, password: boardPasswordSchema.optional() }),
  z.object({ action: z.literal("delete"), id: boardIdSchema, password: enteredPassword }),
  z.object({ action: z.literal("set-password"), id: boardIdSchema, password: boardPasswordSchema }),
]);
export const BOARD_PAGE_SIZE = 10;
export const BOARD_PUBLIC_FIELDS = "id,title,author_username,created_at,updated_at,is_protected";
export type BoardPost = { id: string; title: string; body?: string; author_username: string; created_at: string; updated_at: string; author_id?: string; is_protected: boolean };

export function escapeBoardSearch(value: string) {
  return value.trim().slice(0,80).replace(/[\\%_]/g, "\\$&");
}
export function boardError(code?: string) {
  return code === "PGRST205" || code === "42P01" ? "게시판 연결을 준비 중입니다. 운영자에게 문의해주세요." : "게시판 요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.";
}
export function boardDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium" }).format(new Date(value));
}
