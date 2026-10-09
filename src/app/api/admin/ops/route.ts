import { NextResponse } from "next/server";
import prisma from "@/lib/dbClient/prisma";
import { audit } from "@/server/audit";
import { getSessionUser } from "@/server/marketplace";

const adminOnly = async () => {
  const me = await getSessionUser();
  if (!me || me.role !== "admin") {
    return null;
  }
  return me;
};

export const GET = async () => {
  const me = await adminOnly();
  if (!me) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 },
    );
  }
  const [coupons, rates, logs] = await Promise.all([
    prisma.coupon.findMany({ orderBy: { code: "asc" } }),
    prisma.currencyRate.findMany({ orderBy: { code: "asc" } }),
    prisma.auditLog.findMany({
      include: { actor: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);
  return NextResponse.json({ coupons, rates, logs });
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
    kind?: string;
    code?: string;
    percent?: number;
    id?: string;
    active?: boolean;
    perUsd?: number;
  } | null;

  if (body?.kind === "coupon") {
    if (typeof body.code !== "string" || typeof body.percent !== "number") {
      return NextResponse.json({ error: "Invalid coupon" }, { status: 400 });
    }
    const coupon = await prisma.coupon.upsert({
      where: { code: body.code.trim().toUpperCase() },
      update: { percent: body.percent, active: body.active ?? true },
      create: {
        code: body.code.trim().toUpperCase(),
        percent: body.percent,
        active: body.active ?? true,
      },
    });
    await audit(me.id, "coupon.save", coupon.id, coupon.code);
    return NextResponse.json({ id: coupon.id });
  }

  if (body?.kind === "coupon-delete" && body.id) {
    await prisma.coupon.delete({ where: { id: body.id } });
    await audit(me.id, "coupon.delete", body.id);
    return NextResponse.json({ deleted: true });
  }

  if (body?.kind === "rate" && body.code && typeof body.perUsd === "number") {
    await prisma.currencyRate.upsert({
      where: { code: body.code },
      update: { perUsd: body.perUsd },
      create: { code: body.code, perUsd: body.perUsd },
    });
    await audit(me.id, "rate.save", body.code, String(body.perUsd));
    return NextResponse.json({ saved: true });
  }

  return NextResponse.json({ error: "Invalid input" }, { status: 400 });
};
