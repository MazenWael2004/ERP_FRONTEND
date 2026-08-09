import { z } from "zod";

const baseUserSchema = z.object({
  userName: z
    .string()
    .trim()
    .min(1, "USER_NAME_REQUIRED"),

  employeeId: z
    .number("EMPLOYEE_ID_MUST_BE_NUMBER")
    .int("EMPLOYEE_ID_MUST_BE_INTEGER")
    .positive("EMPLOYEE_ID_MUST_BE_POSITIVE"),

  roles: z
    .array(z.number().int())
    .min(1, "ROLES_REQUIRED"),
});

export const createUserSchema = baseUserSchema
  .extend({
    password: z
      .string()
      .min(8, "PASSWORD_MIN_8_CHARACTERS")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
        "PASSWORD_MUST_CONTAIN_LETTER_AND_NUMBER"
      ),

    confirmPassword: z
      .string()
      .min(1, "CONFIRM_PASSWORD_REQUIRED"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "PASSWORDS_DO_NOT_MATCH",
    path: ["confirmPassword"],
  });

  export const editUserSchema = baseUserSchema;