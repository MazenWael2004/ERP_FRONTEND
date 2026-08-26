import { z } from "zod";

export const createProgramSchema = z.object({
  nameEn: z
    .string()
    .min(1, "PROGRAM_NAME_EN_REQUIRED")
    .regex(/^[A-Za-z\s]+$/, "PROGRAM_NAME_ONLY_ENGLISH"),

  nameAr: z
    .string()
    .min(1, "PROGRAM_NAME_AR_REQUIRED")
    .regex(/^[\u0600-\u06FF\s]+$/, "PROGRAM_NAME_ONLY_ARABIC"),

  code: z
    .string()
    .min(1, "PROGRAM_CODE_REQUIRED"),

});