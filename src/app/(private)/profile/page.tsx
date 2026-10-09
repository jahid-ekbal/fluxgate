import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CircleDollarSign,
  Package,
  Settings,
  ShoppingBag,
  Star,
  Store,
} from "lucide-react";
import prisma from "@/lib/dbClient/prisma";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcnui/avatar";
import { Badge } from "@/components/shadcnui/badge";
import { buttonVariants } from "@/components/shadcnui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import ProfileForm from "@/components/Profile/ProfileForm";
import UpgradeSellerButton from "@/components/Profile/UpgradeSellerButton";
import { formatDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { getRates } from "@/server/currency";
import { getSessionUser } from "@/server/marketplace";

export const metadata = { title: "Profile" };

const ProfilePage = async () => {
  const me = await getSessionUser();
  if (!me) {
    redirect("/sign-in");
  }

  const [user, rates] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: me.id },
      include: {
        _count: {
          select: {
            products: true,
            ratings: true,
            cartItems: true,
            buyerOrders: true,
            sellerOrders: true,
          },
        },
      },
    }),
    getRates(),
  ]);

  const [spent, earned, recentOrders, recentRatings] = await Promise.all([
    prisma.order.aggregate({
      _sum: { totalUsd: true },
      where: { buyerId: me.id },
    }),
    prisma.order.aggregate({
      _sum: { totalUsd: true },
      where: { sellerId: me.id, status: { in: ["confirmed", "delivered"] } },
    }),
    prisma.order.findMany({
      where: { buyerId: me.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.rating.findMany({
      where: { buyerId: me.id },
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const initial = (user.name ?? user.email).slice(0, 1).toUpperCase();
  const stats =
    me.role === "seller" || me.role === "admin" ?
      [
        {
          icon: Package,
          value: String(user._count.products),
          label: "Products",
        },
        {
          icon: ShoppingBag,
          value: String(user._count.sellerOrders),
          label: "Orders received",
        },
        {
          icon: CircleDollarSign,
          value: formatMoney(earned._sum.totalUsd ?? 0, me.currency, rates),
          label: "Earned",
        },
      ]
    : [
        {
          icon: ShoppingBag,
          value: String(user._count.buyerOrders),
          label: "Orders",
        },
        {
          icon: CircleDollarSign,
          value: formatMoney(spent._sum.totalUsd ?? 0, me.currency, rates),
          label: "Spent",
        },
        { icon: Star, value: String(user._count.ratings), label: "Ratings" },
      ];

  return (
    <main className="flex min-h-dvh w-full flex-col gap-8 px-6 pt-20 pb-32">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar className="size-20">
          <AvatarImage
            src={user.image ?? undefined}
            alt={user.name}
          />
          <AvatarFallback className="text-2xl">{initial}</AvatarFallback>
        </Avatar>
        <div className="flex grow flex-col gap-1">
          <h1 className="text-4xl font-semibold tracking-tight">{user.name}</h1>
          <p className="text-muted-foreground">
            {user.email} (member since {formatDate(user.createdAt)})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={me.role === "buyer" ? "secondary" : "default"}>
            {me.role}
          </Badge>
          <Badge variant={user.emailVerified ? "secondary" : "destructive"}>
            {user.emailVerified ? "verified" : "unverified"}
          </Badge>
          <Link
            href="/settings"
            className={buttonVariants({ variant: "secondary", size: "sm" })}>
            <Settings />
            Settings
          </Link>
          {me.role === "buyer" && <UpgradeSellerButton />}
        </div>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="pb-3 text-lg font-semibold">Edit profile</h2>
          <ProfileForm initial={{ name: user.name, image: user.image ?? "" }} />
        </Card>
        <Card className="p-6">
          <h2 className="pb-3 text-lg font-semibold">Recent orders</h2>
          <div className="flex flex-col gap-2">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm last:border-0">
                <span>
                  {order.items
                    .map((item) => `${item.product.name} x${item.qty}`)
                    .join(", ")}
                </span>
                <span className="flex items-center gap-2">
                  <Badge
                    variant={
                      order.status === "delivered" ? "secondary" : "default"
                    }>
                    {order.status}
                  </Badge>
                  <span className="font-medium">
                    {formatMoney(order.totalUsd, order.currency, rates)}
                  </span>
                </span>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="text-muted-foreground text-sm">No orders yet</p>
            )}
          </div>
          <h2 className="pt-4 pb-3 text-lg font-semibold">Recent ratings</h2>
          <div className="flex flex-col gap-2">
            {recentRatings.map((rating) => (
              <div
                key={rating.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm last:border-0">
                <span>
                  {rating.stars}/5 on {rating.product.name}
                </span>
                <span className="text-muted-foreground text-xs">
                  {rating.comment ?? ""}
                </span>
              </div>
            ))}
            {recentRatings.length === 0 && (
              <p className="text-muted-foreground text-sm">No ratings yet</p>
            )}
          </div>
          {(me.role === "seller" || me.role === "admin") && (
            <div className="pt-4">
              <Link
                href={me.role === "admin" ? "/admin" : "/seller"}
                className={buttonVariants({
                  variant: "secondary",
                  size: "sm",
                })}>
                <Store />
                {me.role === "admin" ? "Admin dashboard" : "Seller dashboard"}
              </Link>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
};

export default ProfilePage;
