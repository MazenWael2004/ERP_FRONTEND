import { z } from "zod";

export const createRoleSchema = z.object({
  roleNameEn: z
    .string()
    .min(1, "ROLE_NAME_EN_REQUIRED")
    .regex(
      /^[A-Za-z\s]+$/,
      "ROLE_NAME_ONLY_ENGLISH"
    ),

  roleNameAr: z
    .string()
    .min(1, "ROLE_NAME_AR_REQUIRED")
    .regex(
      /^[\u0600-\u06FF\s]+$/,
      "ROLE_NAME_ONLY_ARABIC"
    ),


  permissions: z.array(
    z.object({
      page_id: z.number(),
      action_id: z.number(),
    })
  ),
});