import { NextResponse } from "next/server";
import prisma from "@/lib/dbClient/prisma";
import { productSchema } from "@/lib/zodSchema";
import { canSell, getSessionUser, ownProduct } from "@/server/marketplace";

export const POST = async (request: Request) => {
  const me = await getSessionUser();
  if (!me || !canSell(me.role)) {
    return NextResponse.json(
      { error: "Seller access required" },
      { status: 403 },
    );
  }
  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }
  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      badge: parsed.data.badge || null,
      imageUrl: parsed.data.imageUrl || null,
      sellerId: me.id,
      status: me.role === "admin" ? "approved" : "pending",
    },
  });
  return NextResponse.json({ id: product.id });
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
  const parsed = productSchema.safeParse(body ?? {});
  if (!body?.id || !parsed.success) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }
  const owned =
    me.role === "admin" ?
      await prisma.product.findUnique({ where: { id: body.id } })
    : await ownProduct(me.id, body.id);
  if (!owned) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  const product = await prisma.product.update({
    where: { id: body.id },
    data: {
      ...parsed.data,
      badge: parsed.data.badge || null,
      imageUrl: parsed.data.imageUrl || null,
    },
  });
  return NextResponse.json({ id: product.id });
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
    return NextResponse.json({ error: "Product id required" }, { status: 400 });
  }
  const owned =
    me.role === "admin" ?
      await prisma.product.findUnique({ where: { id: body.id } })
    : await ownProduct(me.id, body.id);
  if (!owned) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  await prisma.product.delete({ where: { id: body.id } });
  return NextResponse.json({ deleted: true });
};
