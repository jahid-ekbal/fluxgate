import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const getSession = async () =>
  auth.api.getSession({ headers: await headers() });

export type AuthSession = typeof auth.$Infer.Session;

export const getRole = async () => {
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role ?? "user";
};
