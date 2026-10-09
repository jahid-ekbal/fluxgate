import { NextResponse } from "next/server";
import prisma from "@/lib/dbClient/prisma";
import { getSessionUser } from "@/server/marketplace";

export const POST = async (request: Request) => {
  const me = await getSessionUser();
  if (!me) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as {
    subject?: string;
    message?: string;
  } | null;
  if (
    typeof body?.subject !== "string" ||
    body.subject.trim() === "" ||
    typeof body?.message !== "string" ||
    body.message.trim() === ""
  ) {
    return NextResponse.json({ error: "Invalid ticket" }, { status: 400 });
  }
  const ticket = await prisma.supportTicket.create({
    data: {
      buyerId: me.id,
      subject: body.subject.trim().slice(0, 120),
      message: body.message.trim().slice(0, 2000),
    },
  });
  return NextResponse.json({ id: ticket.id });
};
