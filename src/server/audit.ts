import prisma from "@/lib/dbClient/prisma";

export const audit = async (
  actorId: string,
  action: string,
  target?: string,
  detail?: string,
) =>
  prisma.auditLog.create({
    data: { actorId, action, target: target ?? null, detail: detail ?? null },
  });
