import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);
const phone = text(30).refine((value) => value === "" || /^[0-9+().\-\s]{7,30}$/.test(value), "연락처 형식을 확인해주세요.");
const common = { website: text(200).default(""), name: text(100).min(1), companyName: text(200).default(""), email: z.string().trim().email().max(190), phone, privacyAgreed: z.literal("true") };

export const submissionSchemas = {
  inquiry: z.object({ ...common, inquiryType: z.enum(["general", "estimate", "maintenance"]), subject: text(200).min(1), message: text(5000).min(1) }),
  diagnosis: z.object({ ...common, diagnosisType: z.enum(["simple", "detailed"]), websiteUrl: z.string().trim().pipe(z.union([z.literal(""), z.string().url().max(500).refine((value) => /^https?:\/\//i.test(value))])).default(""), message: text(5000).default("") }),
  education: z.object({ ...common, phone: phone.refine((value) => value !== "", "연락처를 입력해주세요."), experienceLevel: z.enum(["", "none", "basic", "experienced"]), message: text(5000).default("") }),
} as const;

export type SubmissionKind = keyof typeof submissionSchemas;
export function isSubmissionKind(value: string): value is SubmissionKind { return value in submissionSchemas; }
