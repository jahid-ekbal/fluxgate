import { NextResponse } from "next/server";
import prisma from "@/lib/dbClient/prisma";
import { cartSchema } from "@/lib/zodSchema";
import { getRates, priceOf } from "@/server/currency";
import { getSessionUser } from "@/server/marketplace";

export const GET = async () => {
  const me = await getSessionUser();
  if (!me) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const [items, rates] = await Promise.all([
    prisma.cartItem.findMany({
      where: { buyerId: me.id },
      include: { product: true },
      orderBy: { createdAt: "asc" },
    }),
    getRates(),
  ]);
  const totalUsd = items.reduce(
    (sum, item) => sum + priceOf(item.product) * item.qty,
    0,
  );
  return NextResponse.json({
    items: items.map((item) => ({
      id: item.id,
      qty: item.qty,
      product: {
        id: item.product.id,
        name: item.product.name,
        category: item.product.category,
        badge: item.product.badge,
        listPrice: item.product.listPrice,
        salePrice: item.product.salePrice,
        unitUsd: priceOf(item.product),
      },
    })),
    totalUsd,
    currency: me.currency,
    paymentMethod: me.paymentMethod,
    rates,
  });
};

export const POST = async (request: Request) => {
  const me = await getSessionUser();
  if (!me) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const parsed = cartSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart input" }, { status: 400 });
  }
  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  const item = await prisma.cartItem.upsert({
    where: { buyerId_productId: { buyerId: me.id, productId: product.id } },
    update: { qty: parsed.data.qty },
    create: { buyerId: me.id, productId: product.id, qty: parsed.data.qty },
  });
  return NextResponse.json({ id: item.id, qty: item.qty });
};

export const DELETE = async (request: Request) => {
  const me = await getSessionUser();
  if (!me) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as {
    productId?: string;
  } | null;
  if (body?.productId) {
    await prisma.cartItem.deleteMany({
      where: { buyerId: me.id, productId: body.productId },
    });
  } else {
    await prisma.cartItem.deleteMany({ where: { buyerId: me.id } });
  }
  return NextResponse.json({ cleared: true });
};
