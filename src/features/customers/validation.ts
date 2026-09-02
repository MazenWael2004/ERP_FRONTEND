import { z } from "zod";

export const createCustomerSchema = z.object({
  nameEn: z
    .string()
    .min(1, "CUSTOMER_NAME_EN_REQUIRED")
    .regex(/^[A-Za-z\s]+$/, "CUSTOMER_NAME_ONLY_ENGLISH"),

  nameAr: z
    .string()
    .min(1, "CUSTOMER_NAME_AR_REQUIRED")
    .regex(/^[\u0600-\u06FF\s]+$/, "CUSTOMER_NAME_ONLY_ARABIC"),

  code: z
    .string()
    .min(1, "CUSTOMER_CODE_REQUIRED"),
  taxNumber: z
  .string()
  .min(1,"CUSTOMER_TAX_NUMBER_REQUIRED"),

  registrationNumber: z
  .string()
  .min(1,"CUSTOMER_REGISTRATION_NUMBER_REQUIRED"),

  street: z
  .string()
  .min(1,"STREET_REQUIRED"),

  cityId: z.number('CITY_ID_REQUIRED').int().positive(),


  governorateId: z.number('GOVERNORATE_ID_REQUIRED').int().positive(),

  telephoneNumber: z.string().regex(/^(01[0125]\d{8}|0[2-9]\d{7,8})$/, 'INVALID_PHONE_NUMBER'),

  zoneId: z.number('ZONE_ID_REQUIRED').int().positive(),

  programId: z.number('PROGRAM_ID_REQUIRED').int().positive(),

 documents: z
  .instanceof(FileList)
  .optional()
  .refine(
    (files) =>
      !files ||
      Array.from(files).every((file) =>
        [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/webp',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ].includes(file.type)
      ),
    {
      message: 'INVALID_DOCUMENT_TYPE',
    }
  )
  .refine(
    (files) =>
      !files ||
      Array.from(files).every(
        (file) => file.size <= 5 * 1024 * 1024
      ),
    {
      message: 'DOCUMENT_TOO_LARGE',
    }
  ),
});