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

const slugOf = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const GET = async () => {
  const me = await adminOnly();
  if (!me) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 },
    );
  }
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.tag.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }),
  ]);
  return NextResponse.json({ categories, tags });
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
    name?: string;
    id?: string;
  } | null;
  if (!body?.name || body.name.trim() === "") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (body.kind === "tag") {
    const tag = await prisma.tag.create({ data: { name: body.name.trim() } });
    await audit(me.id, "tag.create", tag.id, tag.name);
    return NextResponse.json({ id: tag.id });
  }
  const category = await prisma.category.create({
    data: { name: body.name.trim(), slug: slugOf(body.name.trim()) },
  });
  await audit(me.id, "category.create", category.id, category.name);
  return NextResponse.json({ id: category.id });
};

export const DELETE = async (request: Request) => {
  const me = await adminOnly();
  if (!me) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 },
    );
  }
  const body = (await request.json().catch(() => null)) as {
    kind?: string;
    id?: string;
  } | null;
  if (!body?.id) {
    return NextResponse.json({ error: "Id is required" }, { status: 400 });
  }
  if (body.kind === "tag") {
    await prisma.productTag.deleteMany({ where: { tagId: body.id } });
    await prisma.tag.delete({ where: { id: body.id } });
    await audit(me.id, "tag.delete", body.id);
  } else {
    await prisma.product.updateMany({
      where: { categoryId: body.id },
      data: { categoryId: null },
    });
    await prisma.category.delete({ where: { id: body.id } });
    await audit(me.id, "category.delete", body.id);
  }
  return NextResponse.json({ deleted: true });
};
