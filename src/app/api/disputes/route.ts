import { NextResponse } from "next/server";
import prisma from "@/lib/dbClient/prisma";
import { getSessionUser } from "@/server/marketplace";

export const POST = async (request: Request) => {
  const me = await getSessionUser();
  if (!me) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as {
    orderId?: string;
    reason?: string;
  } | null;
  if (
    typeof body?.orderId !== "string" ||
    typeof body?.reason !== "string" ||
    body.reason.trim() === ""
  ) {
    return NextResponse.json({ error: "Invalid dispute" }, { status: 400 });
  }
  const order = await prisma.order.findFirst({
    where: { id: body.orderId, buyerId: me.id },
  });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  const dispute = await prisma.dispute.create({
    data: {
      orderId: order.id,
      buyerId: me.id,
      reason: body.reason.trim().slice(0, 1000),
    },
  });
  return NextResponse.json({ id: dispute.id });
};
