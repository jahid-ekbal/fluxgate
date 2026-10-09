import { NextResponse } from "next/server";
import prisma from "@/lib/dbClient/prisma";
import { getSessionUser } from "@/server/marketplace";

export const POST = async (request: Request) => {
  const body = (await request.json().catch(() => null)) as {
    ip?: string;
    country?: string;
    vpn?: boolean;
    path?: string;
  } | null;
  if (!body?.path || typeof body.path !== "string") {
    return NextResponse.json({ error: "Invalid visit" }, { status: 400 });
  }
  await prisma.visitLog.create({
    data: {
      ip: typeof body.ip === "string" ? body.ip.slice(0, 64) : "unknown",
      country:
        typeof body.country === "string" ? body.country.slice(0, 8) : "Unknown",
      vpn: body.vpn === true,
      path: body.path.slice(0, 256),
    },
  });
  return NextResponse.json({ logged: true });
};

export const GET = async (request: Request) => {
  const me = await getSessionUser();
  if (!me || me.role !== "admin") {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 },
    );
  }
  const url = new URL(request.url);
  const country = url.searchParams.get("country") ?? "";
  const vpn = url.searchParams.get("vpn") ?? "";
  const visits = await prisma.visitLog.findMany({
    where: {
      ...(country !== "" ? { country } : {}),
      ...(vpn === "yes" ? { vpn: true }
      : vpn === "no" ? { vpn: false }
      : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const countries = await prisma.visitLog.groupBy({
    by: ["country"],
    _count: { country: true },
    orderBy: { _count: { country: "desc" } },
  });
  return NextResponse.json({ visits, countries });
};
