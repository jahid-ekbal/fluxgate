import { NextResponse } from "next/server";
import prisma from "@/lib/dbClient/prisma";
import { ratingSchema } from "@/lib/zodSchema";
import { getSessionUser } from "@/server/marketplace";

export const POST = async (request: Request) => {
  const me = await getSessionUser();
  if (!me) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const parsed = ratingSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }
  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  const rating = await prisma.rating.upsert({
    where: {
      buyerId_productId: { buyerId: me.id, productId: product.id },
    },
    update: { stars: parsed.data.stars, comment: parsed.data.comment ?? null },
    create: {
      buyerId: me.id,
      productId: product.id,
      stars: parsed.data.stars,
      comment: parsed.data.comment ?? null,
    },
  });
  return NextResponse.json({ id: rating.id });
};
