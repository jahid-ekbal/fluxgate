import prisma from "@/lib/dbClient/prisma";
import AnalyticsCharts from "@/components/Admin/AnalyticsCharts";
import { Badge } from "@/components/shadcnui/badge";
import { Card } from "@/components/shadcnui/card";

export const metadata = { title: "Admin analytics" };

const dayKey = (value: Date) => value.toISOString().slice(0, 10);

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const AdminAnalyticsPage = async () => {
  const since = daysAgo(14);
  const [orders, ratings, items, visits] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: { totalUsd: true, status: true, createdAt: true },
    }),
    prisma.rating.groupBy({
      by: ["stars"],
      _count: { stars: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { priceUsd: true, qty: true },
      orderBy: { _sum: { priceUsd: "desc" } },
      take: 5,
    }),
    prisma.visitLog.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, vpn: true },
    }),
  ]);

  const days: { day: string; revenue: number; visits: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const date = daysAgo(i);
    days.push({ day: dayKey(date).slice(5), revenue: 0, visits: 0 });
  }
  for (const order of orders) {
    const key = dayKey(order.createdAt).slice(5);
    const point = days.find((d) => d.day === key);
    if (point && order.status !== "pending") {
      point.revenue = Math.round((point.revenue + order.totalUsd) * 100) / 100;
    }
  }
  for (const visit of visits) {
    const key = dayKey(visit.createdAt).slice(5);
    const point = days.find((d) => d.day === key);
    if (point) {
      point.visits += 1;
    }
  }

  const byStatus = ["pending", "confirmed", "delivered"].map((status) => ({
    status,
    count: orders.filter((o) => o.status === status).length,
  }));
  const dist = [1, 2, 3, 4, 5].map((stars) => ({
    stars,
    count: ratings.find((r) => r.stars === stars)?._count.stars ?? 0,
  }));
  const topIds = items.map((item) => item.productId);
  const topProducts = await prisma.product.findMany({
    where: { id: { in: topIds } },
    select: { id: true, name: true },
  });
  const vpnShare =
    visits.length === 0 ?
      0
    : Math.round((visits.filter((v) => v.vpn).length / visits.length) * 100);

  const Bar = ({
    label,
    count,
    max,
  }: {
    label: string;
    count: number;
    max: number;
  }) => (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-24 shrink-0">{label}</span>
      <div className="bg-muted h-2 grow rounded-full">
        <div
          className="bg-primary h-2 rounded-full"
          style={{ width: max === 0 ? "0%" : `${(count / max) * 100}%` }}
        />
      </div>
      <span className="w-10 text-right font-medium">{count}</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
      <AnalyticsCharts points={days} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="pb-3 text-lg font-semibold">Orders by status</h2>
          <div className="flex flex-col gap-2">
            {byStatus.map((row) => (
              <Bar
                key={row.status}
                label={row.status}
                count={row.count}
                max={Math.max(...byStatus.map((r) => r.count), 1)}
              />
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="pb-3 text-lg font-semibold">Ratings</h2>
          <div className="flex flex-col gap-2">
            {dist.map((row) => (
              <Bar
                key={row.stars}
                label={`${row.stars} stars`}
                count={row.count}
                max={Math.max(...dist.map((r) => r.count), 1)}
              />
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="pb-3 text-lg font-semibold">Top products</h2>
          <div className="flex flex-col gap-2">
            {topProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate">{product.name}</span>
                <Badge variant="secondary">
                  $
                  {items
                    .find((i) => i.productId === product.id)
                    ?._sum.priceUsd?.toFixed(2) ?? "0.00"}
                </Badge>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-muted-foreground text-sm">No sales yet</p>
            )}
          </div>
        </Card>
      </div>
      <Card className="p-6">
        <h2 className="pb-1 text-lg font-semibold">Visitors</h2>
        <p className="text-muted-foreground text-sm">
          {visits.length} visits in 14 days, {vpnShare}% flagged VPN
        </p>
      </Card>
    </div>
  );
};

export default AdminAnalyticsPage;
