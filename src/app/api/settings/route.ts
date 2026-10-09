import { NextResponse } from "next/server";
import prisma from "@/lib/dbClient/prisma";
import { settingsSchema } from "@/lib/zodSchema";
import { getSessionUser } from "@/server/marketplace";

export const PATCH = async (request: Request) => {
  const me = await getSessionUser();
  if (!me) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const parsed = settingsSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
  }
  await prisma.user.update({
    where: { id: me.id },
    data: {
      currency: parsed.data.currency,
      paymentMethod: parsed.data.paymentMethod,
    },
  });
  return NextResponse.json({ saved: true });
};

export const POST = async () => {
  const me = await getSessionUser();
  if (!me) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  if (me.role !== "buyer") {
    return NextResponse.json({ error: "Already upgraded" }, { status: 400 });
  }
  await prisma.user.update({ where: { id: me.id }, data: { role: "seller" } });
  return NextResponse.json({ role: "seller" });
};
