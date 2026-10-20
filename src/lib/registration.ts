import { z } from "zod";

export const usernameSchema = z.string().trim().toLowerCase().regex(/^[a-z][a-z0-9_]{3,23}$/, "아이디는 영문 소문자로 시작하는 4~24자의 영문·숫자·밑줄로 입력해주세요.");
export const registrationSchema = z.object({
  username: usernameSchema,
  full_name: z.string().trim().min(2, "이름은 2자 이상 입력해주세요.").max(80),
  email: z.string().trim().email("이메일 주소를 확인해주세요.").max(190),
  phone: z.string().trim().transform(value => value.replace(/[\s()-]/g, "")).refine(value => /^(0\d{8,10}|\+\d{8,15})$/.test(value), "전화번호 형식을 확인해주세요."),
  postal_code: z.string().trim().regex(/^\d{5}$/, "우편번호는 숫자 5자리로 입력해주세요."),
  address: z.string().trim().min(5, "기본 주소를 입력해주세요.").max(200),
  address_detail: z.string().trim().max(150).default(""),
  company_name: z.string().trim().max(100).default(""),
  password: z.string().min(12, "비밀번호는 12자 이상 입력해주세요.").max(128),
  password_confirm: z.string(),
  privacy_agreed: z.literal("yes", { error: "개인정보 수집 및 이용에 동의해주세요." }),
}).refine(value => value.password === value.password_confirm, { path: ["password_confirm"], message: "비밀번호가 일치하지 않습니다." });
