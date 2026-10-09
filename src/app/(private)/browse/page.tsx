import Link from "next/link";
import { ArrowRight, PackageOpen } from "lucide-react";
import prisma from "@/lib/dbClient/prisma";
import { Badge } from "@/components/shadcnui/badge";
import { buttonVariants } from "@/components/shadcnui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/shadcnui/card";
import ProductCatalog, {
  type CatalogProduct,
} from "@/components/Shop/ProductCatalog";
import DisputeButton from "@/components/Shop/DisputeButton";
import TicketForm from "@/components/Shop/TicketForm";
import { getRates } from "@/server/currency";
import { formatDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { getSessionUser } from "@/server/marketplace";

export const metadata = { title: "Browse" };

const BrowsePage = async () => {
  const me = await getSessionUser();
  const role = me?.role ?? "buyer";
  const currency = me?.currency ?? "USD";

  const [products, rates] = await Promise.all([
    prisma.product.findMany({
      where: { status: "approved" },
      include: {
        seller: { select: { name: true } },
        ratings: {
          where: { hidden: false },
          include: { buyer: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    getRates(),
  ]);

  const catalog: CatalogProduct[] = products.map((product) => {
    const count = product.ratings.length;
    const avg =
      count === 0 ? 0 : (
        product.ratings.reduce((sum, rating) => sum + rating.stars, 0) / count
      );
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      badge: product.badge,
      imageUrl: product.imageUrl,
      listPrice: product.listPrice,
      salePrice: product.salePrice,
      sellerName: product.seller.name,
      avgStars: avg,
      ratingCount: count,
      comments: product.ratings.slice(0, 5).map((rating) => ({
        stars: rating.stars,
        comment: rating.comment,
        buyerName: rating.buyer.name,
        createdAt: rating.createdAt.toISOString(),
      })),
    };
  });

  const orders =
    me ?
      await prisma.order.findMany({
        where: { buyerId: me.id },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    : [];

  return (
    <main className="flex min-h-dvh w-full flex-col gap-8 px-6 pt-20 pb-32">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-semibold tracking-tight">Browse</h1>
          <p className="text-muted-foreground">
            {catalog.length} products, prices in {currency}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={role === "buyer" ? "secondary" : "default"}>
            {role}
          </Badge>
          {(role === "seller" || role === "admin") && (
            <Link
              href={role === "admin" ? "/admin" : "/seller"}
              className={buttonVariants({ variant: "secondary", size: "sm" })}>
              {role === "admin" ? "Admin dashboard" : "Seller dashboard"}
              <ArrowRight />
            </Link>
          )}
        </div>
      </div>

      <ProductCatalog
        products={catalog}
        currency={currency}
        rates={rates}
      />

      {orders.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">My recent orders</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    {order.items.reduce((sum, item) => sum + item.qty, 0)} items
                  </span>
                  <Badge
                    variant={
                      order.status === "delivered" ? "secondary" : "default"
                    }>
                    {order.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-xs">
                  {order.items
                    .map((item) => `${item.product.name} x${item.qty}`)
                    .join(", ")}
                </p>
                <p className="text-sm font-semibold">
                  {formatMoney(order.totalUsd, order.currency, rates)} via{" "}
                  {order.paymentMethod}
                </p>
                <p className="text-muted-foreground text-xs">
                  Placed {formatDate(order.createdAt)}
                </p>
                <DisputeButton orderId={order.id} />
              </Card>
            ))}
          </div>
        </section>
      )}

      <TicketForm />

      {catalog.length === 0 && (
        <Card className="items-center p-8 text-center">
          <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
            <PackageOpen className="size-6" />
          </span>
          <CardTitle className="text-2xl">No products yet</CardTitle>
          <CardDescription>
            Check back soon, sellers are stocking the catalog.
          </CardDescription>
          <CardContent>
            <Link
              href="/"
              className={buttonVariants({ variant: "secondary" })}>
              Back to home
            </Link>
          </CardContent>
        </Card>
      )}
    </main>
  );
};

export default BrowsePage;
