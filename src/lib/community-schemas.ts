import { z } from "zod";

export const profileSchema = z.object({
  display_name: z.string().trim().min(2).max(40),
  company_name: z.string().trim().max(100).default(""),
});
export const boardSchema = z.object({
  slug: z.string().trim().regex(/^[a-z][a-z0-9-]{1,39}$/),
  name: z.string().trim().min(2).max(40),
  description: z.string().trim().max(200).default(""),
  write_role: z.enum(["member", "admin"]).default("member"),
});
export const postSchema = z.object({
  board_id: z.string().uuid(),
  title: z.string().trim().min(2).max(150),
  content: z.string().trim().min(5).max(20000),
});
export const postEditSchema = postSchema.pick({ title: true, content: true });
export const memberStateSchema = z.object({ id: z.string().uuid(), active: z.boolean() });
