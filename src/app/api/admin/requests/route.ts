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
  const [reports, tickets, disputes, pending] = await Promise.all([
    prisma.report.findMany({
      include: {
        buyer: { select: { name: true, email: true } },
        product: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.supportTicket.findMany({
      include: { buyer: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.dispute.findMany({
      include: {
        buyer: { select: { name: true, email: true } },
        order: { select: { totalUsd: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.product.findMany({
      where: { status: "pending" },
      include: { seller: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return NextResponse.json({ reports, tickets, disputes, pending });
};

export const PATCH = async (request: Request) => {
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
    action?: string;
  } | null;
  if (!body?.kind || !body?.id || !body?.action) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  if (body.kind === "report") {
    if (body.action === "dismiss") {
      await prisma.report.update({
        where: { id: body.id },
        data: { status: "dismissed" },
      });
    } else if (body.action === "hide-rating") {
      const report = await prisma.report.findUnique({ where: { id: body.id } });
      if (report?.ratingId) {
        await prisma.rating.update({
          where: { id: report.ratingId },
          data: { hidden: true },
        });
      }
      await prisma.report.update({
        where: { id: body.id },
        data: { status: "resolved" },
      });
    } else if (body.action === "takedown-product") {
      const report = await prisma.report.findUnique({ where: { id: body.id } });
      if (report?.productId) {
        await prisma.product.update({
          where: { id: report.productId },
          data: { status: "takedown" },
        });
      }
      await prisma.report.update({
        where: { id: body.id },
        data: { status: "resolved" },
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    await audit(me.id, `report.${body.action}`, body.id);
    return NextResponse.json({ done: true });
  }

  if (body.kind === "ticket" && body.action === "close") {
    await prisma.supportTicket.update({
      where: { id: body.id },
      data: { status: "closed" },
    });
    await audit(me.id, "ticket.close", body.id);
    return NextResponse.json({ done: true });
  }

  if (body.kind === "dispute" && body.action === "resolve") {
    await prisma.dispute.update({
      where: { id: body.id },
      data: { status: "resolved" },
    });
    await audit(me.id, "dispute.resolve", body.id);
    return NextResponse.json({ done: true });
  }

  if (body.kind === "product" && ["approve", "reject"].includes(body.action)) {
    await prisma.product.update({
      where: { id: body.id },
      data: { status: body.action === "approve" ? "approved" : "takedown" },
    });
    await audit(me.id, `product.${body.action}`, body.id);
    return NextResponse.json({ done: true });
  }

  if (body.kind === "rating" && body.action === "unhide") {
    await prisma.rating.update({
      where: { id: body.id },
      data: { hidden: false },
    });
    await audit(me.id, "rating.unhide", body.id);
    return NextResponse.json({ done: true });
  }

  if (body.kind === "rating" && body.action === "delete") {
    await prisma.rating.delete({ where: { id: body.id } });
    await audit(me.id, "rating.delete", body.id);
    return NextResponse.json({ done: true });
  }

  return NextResponse.json({ error: "Invalid input" }, { status: 400 });
};
