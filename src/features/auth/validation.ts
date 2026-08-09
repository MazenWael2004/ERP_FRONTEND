import { z } from "zod";

export const loginSchema = z.object({
  userName: z.string().min(1, "USERNAME_REQUIRED"), // username should be string of at least a char.
  password: z.string().min(1, "PASSWORD_REQUIRED"),
});