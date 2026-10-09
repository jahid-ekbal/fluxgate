import prisma from "@/lib/dbClient/prisma";
import OpsManager from "@/components/Admin/OpsManager";

export const metadata = { title: "Admin coupons and rates" };

const AdminOpsPage = async () => {
  const [coupons, rates, logs] = await Promise.all([
    prisma.coupon.findMany({ orderBy: { code: "asc" } }),
    prisma.currencyRate.findMany({ orderBy: { code: "asc" } }),
    prisma.auditLog.findMany({
      include: { actor: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">Coupons & Rates</h1>
      <OpsManager
        coupons={coupons}
        rates={rates}
        logs={logs.map((entry) => ({
          id: entry.id,
          action: entry.action,
          target: entry.target,
          detail: entry.detail,
          createdAt: entry.createdAt.toISOString(),
          actorName: entry.actor.name,
        }))}
      />
    </div>
  );
};

export default AdminOpsPage;
