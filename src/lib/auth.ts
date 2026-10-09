import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import prisma from "@/lib/dbClient/prisma";
import { serverEnv } from "@/lib/env/serverEnv";

const trustedOrigins = [
  serverEnv.BETTER_AUTH_URL,
  ...(serverEnv.BETTER_AUTH_ALLOWED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? []),
].filter((value, index, list) => list.indexOf(value) === index);

const googleId = serverEnv.GOOGLE_CLIENT_ID;
const googleSecret = serverEnv.GOOGLE_CLIENT_SECRET;
const discordId = serverEnv.DISCORD_CLIENT_ID;
const discordSecret = serverEnv.DISCORD_CLIENT_SECRET;

export const auth = betterAuth({
  appName: "fluxgate",
  secret: serverEnv.BETTER_AUTH_SECRET,
  baseURL: serverEnv.BETTER_AUTH_URL,
  trustedOrigins,
  telemetry: { enabled: false },
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  account: {
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "discord"],
      allowDifferentEmails: false,
    },
  },
  socialProviders: {
    ...(googleId && googleSecret ?
      { google: { clientId: googleId, clientSecret: googleSecret } }
    : {}),
    ...(discordId && discordSecret ?
      { discord: { clientId: discordId, clientSecret: discordSecret } }
    : {}),
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "buyer",
        input: false,
      },
      currency: {
        type: "string",
        required: false,
        defaultValue: "USD",
        input: true,
      },
      paymentMethod: {
        type: "string",
        required: false,
        defaultValue: "whatsapp",
        input: true,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 300 },
  },
  rateLimit: { enabled: true, window: 60, max: 100 },
  plugins: [
    admin({ defaultRole: "buyer", adminRoles: ["admin"] }),
    nextCookies(),
  ],
});
