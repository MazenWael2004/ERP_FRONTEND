import { z } from 'zod';

export const createEmployeeSchema = z.object({
  employeeNameEn: z
    .string()
    .min(1, 'EMPLOYEE_NAME_EN_REQUIRED')
    .regex(/^[A-Za-z\s]+$/, 'EMPLOYEE_NAME_EN_ONLY_ENGLISH'),

  employeeNameAr: z
    .string()
    .min(1, 'EMPLOYEE_NAME_AR_REQUIRED')
    .regex(/^[\u0600-\u06FF\s]+$/, 'EMPLOYEE_NAME_AR_ONLY_ARABIC'),

  employeeNum: z
    .string()
    .trim()
    .min(1, 'EMPLOYEE_NUMBER_REQUIRED')
    .regex(/^[A-Za-z0-9]+$/, 'INVALID_EMPLOYEE_NUMBER'),

  email: z.string().email('INVALID_EMAIL'),

  street: z.string().min(1, 'STREET_REQUIRED'),

  cityId: z.number('CITY_ID_REQUIRED').int().positive(),


  governorateId: z.number('GOVERNORATE_ID_REQUIRED').int().positive(),
  telephoneNum: z.string().regex(/^(01[0125]\d{8}|0[2-9]\d{7,8})$/, 'INVALID_PHONE_NUMBER'),
  birthDate: z.date({
    message: 'BIRTH_DATE_REQUIRED',
  }),
  jobId: z.number('JOB_ID_REQUIRED').int().positive(),

  zones: z.array(z.number().int()).optional(),
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

// Used only when editing an employee
export const editEmployeeSchema = createEmployeeSchema.extend({
    isTerminated: z.boolean(),
});