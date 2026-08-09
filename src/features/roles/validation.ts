import { z } from "zod";

export const createRoleSchema = z.object({
  roleNameEn: z
    .string()
    .min(1, "ROLE_NAME_EN_REQUIRED")
    .regex(/^[A-Za-z\s]+$/, "ROLE_NAME_ONLY_ENGLISH"),

  roleNameAr: z
    .string()
    .min(1, "ROLE_NAME_AR_REQUIRED")
    .regex(/^[\u0600-\u06FF\s]+$/, "ROLE_NAME_ONLY_ARABIC"),

    route: z
    .string()
    .min(1, "ROUTE_REQUIRED"),

      permissions: z.array(
    z.object({
      page: z.string(),
      actions: z.array(z.string()),
    })
  ),

});