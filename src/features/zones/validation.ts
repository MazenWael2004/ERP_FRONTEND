import { z } from "zod";

export const createZoneSchema = z.object({
  zoneNameEn: z
    .string()
    .min(1, "ZONE_NAME_EN_REQUIRED")
    .regex(/^[A-Za-z\s]+$/, "ZONE_NAME_EN_ONLY_ENGLISH"),

  zoneNameAr: z
    .string()
    .min(1, "ZONE_NAME_AR_REQUIRED")
    .regex(/^[\u0600-\u06FF\s]+$/, "ZONE_NAME_AR_ONLY_ARABIC"),
});