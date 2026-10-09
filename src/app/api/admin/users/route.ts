import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { audit } from "@/server/audit";
import { getSessionUser } from "@/server/marketplace";

const adminOnly = async () => {
  const me = await getSessionUser();
  if (!me || me.role !== "admin") {
    return null;
  }
  return me;
};

export const POST = async (request: Request) => {
  const me = await adminOnly();
  if (!me) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 },
    );
  }
  const body = (await request.json().catch(() => null)) as {
    action?: string;
    userId?: string;
    role?: string;
  } | null;
  const h = await headers();

  if (body?.action === "ban" && body.userId) {
    await auth.api.banUser({ body: { userId: body.userId }, headers: h });
    await audit(me.id, "user.ban", body.userId);
    return NextResponse.json({ done: true });
  }
  if (body?.action === "unban" && body.userId) {
    await auth.api.unbanUser({ body: { userId: body.userId }, headers: h });
    await audit(me.id, "user.unban", body.userId);
    return NextResponse.json({ done: true });
  }
  if (body?.action === "setRole" && body.userId && body.role) {
    if (!["buyer", "seller", "admin"].includes(body.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    await auth.api.setRole({
      body: { userId: body.userId, role: body.role as "admin" },
      headers: h,
    });
    await audit(me.id, "user.setRole", body.userId, body.role);
    return NextResponse.json({ done: true });
  }
  if (body?.action === "remove" && body.userId) {
    await auth.api.removeUser({ body: { userId: body.userId }, headers: h });
    await audit(me.id, "user.remove", body.userId);
    return NextResponse.json({ done: true });
  }
  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
};
