import { NextResponse } from "next/server";
import prisma from "@/lib/dbClient/prisma";
import { getSessionUser } from "@/server/marketplace";

export const POST = async (request: Request) => {
  const me = await getSessionUser();
  if (!me) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as {
    productId?: string;
    ratingId?: string;
    reason?: string;
  } | null;
  if (
    typeof body?.reason !== "string" ||
    body.reason.trim() === "" ||
    (!body.productId && !body.ratingId)
  ) {
    return NextResponse.json({ error: "Invalid report" }, { status: 400 });
  }
  const report = await prisma.report.create({
    data: {
      buyerId: me.id,
      productId: body.productId ?? null,
      ratingId: body.ratingId ?? null,
      reason: body.reason.trim().slice(0, 500),
    },
  });
  return NextResponse.json({ id: report.id });
};
