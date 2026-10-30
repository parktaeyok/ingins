import { z } from "zod";

export const boardPostSchema = z.object({
  title: z.string().trim().min(2, "제목을 2자 이상 입력해주세요.").max(120, "제목은 120자까지 입력할 수 있습니다."),
  body: z.string().trim().min(2, "내용을 2자 이상 입력해주세요.").max(10000, "내용은 10,000자까지 입력할 수 있습니다."),
});
export const boardIdSchema = z.uuid();
export const BOARD_PAGE_SIZE = 10;
export const BOARD_PUBLIC_FIELDS = "id,title,body,author_username,created_at,updated_at";
export type BoardPost = { id: string; title: string; body: string; author_username: string; created_at: string; updated_at: string; author_id?: string };

export function escapeBoardSearch(value: string) {
  return value.trim().slice(0,80).replace(/[\\%_]/g, "\\$&");
}
export function boardError(code?: string) {
  return code === "PGRST205" || code === "42P01" ? "게시판 연결을 준비 중입니다. 운영자에게 문의해주세요." : "게시판 요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.";
}
export function boardDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", dateStyle: "medium" }).format(new Date(value));
}
