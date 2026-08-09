import { z } from "zod";

export const createJobSchema = z.object({
  jobTitleEn: z
    .string()
    .min(1, "JOB_TITLE_EN_REQUIRED")
    .regex(/^[A-Za-z\s]+$/, "JOB_TITLE_EN_ONLY_ENGLISH"),

  jobTitleAr: z
    .string()
    .min(1, "JOB_TITLE_AR_REQUIRED")
    .regex(/^[\u0600-\u06FF\s]+$/, "JOB_TITLE_AR_ONLY_ARABIC"),

  jobCode: z
    .string()
    .min(1, "JOB_CODE_REQUIRED"),

  isZoneMandatory: z.boolean().optional(),
});