import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/dbClient/prisma";

export const getSessionUser = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, currency: true, paymentMethod: true },
  });
  if (!user) {
    return null;
  }
  return {
    session,
    id: user.id,
    role: user.role ?? "buyer",
    currency: user.currency ?? "USD",
    paymentMethod: user.paymentMethod ?? "whatsapp",
  };
};

export const canSell = (role: string) => role === "seller" || role === "admin";

export const ownProduct = async (sellerId: string, productId: string) =>
  prisma.product.findFirst({ where: { id: productId, sellerId } });
