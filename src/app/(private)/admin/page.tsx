import { headers } from "next/headers";
import {
  BadgeCheck,
  CircleDollarSign,
  ShieldCheck,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/dbClient/prisma";
import { timeAgo } from "@/lib/dates";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";

export const metadata = { title: "Admin overview" };

const AdminPage = async () => {
  const [result, revenue, activity, counts] = await Promise.all([
    auth.api.listUsers({
      query: { limit: 100 },
      headers: await headers(),
    }),
    prisma.order.aggregate({
      _sum: { totalUsd: true },
      where: { status: { in: ["confirmed", "delivered"] } },
    }),
    prisma.auditLog.findMany({
      include: { actor: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.product.count({ where: { status: "pending" } }),
  ]);

  const users = result.users.map((user) => ({
    role: (user as { role?: string }).role ?? "buyer",
    emailVerified: user.emailVerified,
  }));
  const adminCount = users.filter((user) => user.role === "admin").length;
  const buyerCount = users.filter((user) => user.role === "buyer").length;
  const sellerCount = users.filter((user) => user.role === "seller").length;
  const verifiedCount = users.filter((user) => user.emailVerified).length;

  const stats = [
    { icon: Users, value: String(result.total), label: "Total users" },
    { icon: ShoppingBag, value: String(buyerCount), label: "Buyers" },
    { icon: Store, value: String(sellerCount), label: "Sellers" },
    { icon: ShieldCheck, value: String(adminCount), label: "Admins" },
    { icon: BadgeCheck, value: String(verifiedCount), label: "Verified" },
    {
      icon: CircleDollarSign,
      value: `$${(revenue._sum.totalUsd ?? 0).toFixed(2)}`,
      label: "Revenue",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-semibold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          {counts} products awaiting approval
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-md">
                <stat.icon className="size-5" />
              </span>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
              <CardDescription>{stat.label}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <h2 className="pb-3 text-lg font-semibold">Recent activity</h2>
        <div className="flex flex-col gap-2">
          {activity.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm last:border-0">
              <span>
                <span className="font-medium">{entry.actor.name}</span>{" "}
                {entry.action}
                {entry.target ? ` ${entry.target}` : ""}
                {entry.detail ? ` (${entry.detail})` : ""}
              </span>
              <span className="text-muted-foreground text-xs">
                {timeAgo(entry.createdAt)}
              </span>
            </div>
          ))}
          {activity.length === 0 && (
            <p className="text-muted-foreground text-sm">No activity yet</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminPage;
