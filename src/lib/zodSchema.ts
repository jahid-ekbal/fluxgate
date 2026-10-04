import z from "zod";

const emailSchema = z.email({ error: "Invalid email address" });

const loginPasswordSchema = z
  .string({ error: "Password is required" })
  .min(12, { error: "Password must be at least 12 characters" })
  .max(128, { error: "Password must be at most 128 characters" });

const registerPasswordSchema = z
  .string({ error: "Password is required" })
  .min(12, { error: "Password must be at least 12 characters" })
  .max(128, { error: "Password must be at most 128 characters" })
  .regex(/[A-Z]/, { error: "Password must include an uppercase letter" })
  .regex(/[a-z]/, { error: "Password must include a lowercase letter" })
  .regex(/[0-9]/, { error: "Password must include a number" })
  .regex(/[^A-Za-z0-9]/, { error: "Password must include a symbol" });

export const loginFormSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

export type LoginFormType = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .trim()
    .min(2, { error: "Name must be at least 2 characters" })
    .max(50, { error: "Name must be at most 50 characters" }),
  email: emailSchema,
  password: registerPasswordSchema,
});

export type RegisterFormType = z.infer<typeof registerFormSchema>;
