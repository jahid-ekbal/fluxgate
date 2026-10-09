import { NextResponse } from "next/server";
import prisma from "@/lib/dbClient/prisma";
import { paymentMethodSchema } from "@/lib/zodSchema";
import { canSell, getSessionUser } from "@/server/marketplace";

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const sellerId = url.searchParams.get("sellerId");
  if (!sellerId) {
    return NextResponse.json({ error: "sellerId required" }, { status: 400 });
  }
  const methods = await prisma.sellerPaymentMethod.findMany({
    where: { sellerId },
    orderBy: { label: "asc" },
  });
  return NextResponse.json({ methods });
};

export const POST = async (request: Request) => {
  const me = await getSessionUser();
  if (!me || !canSell(me.role)) {
    return NextResponse.json(
      { error: "Seller access required" },
      { status: 403 },
    );
  }
  const parsed = paymentMethodSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payment method" },
      { status: 400 },
    );
  }
  const method = await prisma.sellerPaymentMethod.create({
    data: { ...parsed.data, sellerId: me.id },
  });
  return NextResponse.json({ id: method.id });
};

export const PUT = async (request: Request) => {
  const me = await getSessionUser();
  if (!me || !canSell(me.role)) {
    return NextResponse.json(
      { error: "Seller access required" },
      { status: 403 },
    );
  }
  const body = (await request.json().catch(() => null)) as
    ({ id?: string } & Record<string, unknown>) | null;
  const parsed = paymentMethodSchema.safeParse(body ?? {});
  if (!body?.id || !parsed.success) {
    return NextResponse.json(
      { error: "Invalid payment method" },
      { status: 400 },
    );
  }
  const where =
    me.role === "admin" ? { id: body.id } : { id: body.id, sellerId: me.id };
  const target = await prisma.sellerPaymentMethod.findFirst({ where });
  if (!target) {
    return NextResponse.json(
      { error: "Payment method not found" },
      { status: 404 },
    );
  }
  const method = await prisma.sellerPaymentMethod.update({
    where: { id: target.id },
    data: parsed.data,
  });
  return NextResponse.json({ id: method.id });
};

export const DELETE = async (request: Request) => {
  const me = await getSessionUser();
  if (!me || !canSell(me.role)) {
    return NextResponse.json(
      { error: "Seller access required" },
      { status: 403 },
    );
  }
  const body = (await request.json().catch(() => null)) as {
    id?: string;
  } | null;
  if (!body?.id) {
    return NextResponse.json(
      { error: "Payment method id required" },
      { status: 400 },
    );
  }
  const where =
    me.role === "admin" ? { id: body.id } : { id: body.id, sellerId: me.id };
  const owned = await prisma.sellerPaymentMethod.findFirst({ where });
  if (!owned) {
    return NextResponse.json(
      { error: "Payment method not found" },
      { status: 404 },
    );
  }
  await prisma.sellerPaymentMethod.delete({ where: { id: owned.id } });
  return NextResponse.json({ deleted: true });
};
