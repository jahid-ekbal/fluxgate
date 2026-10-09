import { NextResponse } from "next/server";
import prisma from "@/lib/dbClient/prisma";
import { checkoutSchema, orderStatusSchema } from "@/lib/zodSchema";
import { priceOf } from "@/server/currency";
import { getSessionUser } from "@/server/marketplace";

export const GET = async () => {
  const me = await getSessionUser();
  if (!me) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const where =
    me.role === "admin" ? {}
    : me.role === "seller" ? { sellerId: me.id }
    : { buyerId: me.id };
  const orders = await prisma.order.findMany({
    where,
    include: {
      items: { include: { product: true } },
      buyer: { select: { name: true, email: true } },
      seller: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ orders });
};

export const POST = async (request: Request) => {
  const me = await getSessionUser();
  if (!me) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout" }, { status: 400 });
  }
  const cartItems = await prisma.cartItem.findMany({
    where: { buyerId: me.id },
    include: { product: true },
  });
  const items = cartItems.filter((item) => item.product.status === "approved");
  if (items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const bySeller = new Map<string, typeof items>();
  for (const item of items) {
    const group = bySeller.get(item.product.sellerId) ?? [];
    group.push(item);
    bySeller.set(item.product.sellerId, group);
  }

  const orderIds: string[] = [];
  const couponCode = parsed.data.couponCode?.trim().toUpperCase() || null;
  let discountPct = 0;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode },
    });
    if (coupon && coupon.active) {
      discountPct = coupon.percent;
    }
  }
  for (const [sellerId, group] of bySeller) {
    const subtotal = group.reduce(
      (sum, item) => sum + priceOf(item.product) * item.qty,
      0,
    );
    const totalUsd = Math.round(subtotal * (1 - discountPct / 100) * 100) / 100;
    const order = await prisma.order.create({
      data: {
        buyerId: me.id,
        sellerId,
        status: "pending",
        currency: parsed.data.currency,
        paymentMethod: parsed.data.paymentMethod,
        advanceProof: parsed.data.advanceProof ?? null,
        couponCode,
        discountPct,
        totalUsd,
        items: {
          create: group.map((item) => ({
            productId: item.productId,
            qty: item.qty,
            priceUsd: priceOf(item.product),
          })),
        },
      },
    });
    orderIds.push(order.id);
  }

  await prisma.cartItem.deleteMany({ where: { buyerId: me.id } });
  return NextResponse.json({ orderIds });
};

export const PATCH = async (request: Request) => {
  const me = await getSessionUser();
  if (!me) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as {
    orderId?: string;
    status?: string;
  } | null;
  const parsed = orderStatusSchema.safeParse({ status: body?.status });
  if (!body?.orderId || !parsed.success) {
    return NextResponse.json(
      { error: "Invalid status update" },
      { status: 400 },
    );
  }
  const order = await prisma.order.findUnique({ where: { id: body.orderId } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (me.role !== "admin" && order.sellerId !== me.id) {
    return NextResponse.json({ error: "Not your order" }, { status: 403 });
  }
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: parsed.data.status },
  });
  return NextResponse.json({ id: updated.id, status: updated.status });
};
