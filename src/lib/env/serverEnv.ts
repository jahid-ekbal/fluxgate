import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const serverEnv = createEnv({
  server: {
    DATABASE_URL: z
      .string()
      .startsWith("file:./", {
        error: "DATABASE_URL must start with file:./",
      })
      .min(1, { error: "DATABASE_URL is required" }),
    NEXT_TELEMETRY_DISABLED: z.enum(["1", "0"]).optional(),
    CHECKPOINT_DISABLE: z.enum(["1", "0"]).optional(),
    BETTER_AUTH_SECRET: z
      .string()
      .min(32, { error: "BETTER_AUTH_SECRET must be at least 32 chars" }),
    BETTER_AUTH_URL: z
      .string()
      .min(1, { error: "BETTER_AUTH_URL is required" }),
    BETTER_AUTH_ALLOWED_ORIGINS: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    DISCORD_CLIENT_ID: z.string().optional(),
    DISCORD_CLIENT_SECRET: z.string().optional(),
    ADMIN_EMAIL: z.string().min(1, { error: "ADMIN_EMAIL is required" }),
    ADMIN_PASSWORD: z
      .string()
      .min(8, { error: "ADMIN_PASSWORD must be at least 8 chars" }),
    ADMIN_NAME: z.string().min(1, { error: "ADMIN_NAME is required" }),
    BUYER_EMAIL: z.string().min(1, { error: "BUYER_EMAIL is required" }),
    BUYER_PASSWORD: z
      .string()
      .min(8, { error: "BUYER_PASSWORD must be at least 8 chars" }),
    BUYER_NAME: z.string().min(1, { error: "BUYER_NAME is required" }),
    SELLER_EMAIL: z.string().min(1, { error: "SELLER_EMAIL is required" }),
    SELLER_PASSWORD: z
      .string()
      .min(8, { error: "SELLER_PASSWORD must be at least 8 chars" }),
    SELLER_NAME: z.string().min(1, { error: "SELLER_NAME is required" }),
  },
  experimental__runtimeEnv: process.env,
});
