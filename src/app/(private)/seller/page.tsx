import { redirect } from "next/navigation";
import prisma from "@/lib/dbClient/prisma";
import SellerDashboard from "@/components/Seller/SellerDashboard";
import { getRates } from "@/server/currency";
import { getSessionUser } from "@/server/marketplace";

export const metadata = { title: "Seller dashboard" };

const SellerPage = async () => {
  const me = await getSessionUser();
  if (!me) {
    redirect("/sign-in");
  }
  if (me.role !== "seller" && me.role !== "admin") {
    redirect("/browse");
  }

  const sellerId = me.id;
  const [products, orders, methods, ratings, rates] = await Promise.all([
    prisma.product.findMany({
      where: { sellerId },
      include: { ratings: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      where: { sellerId },
      include: {
        items: { include: { product: true } },
        buyer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.sellerPaymentMethod.findMany({
      where: { sellerId },
      orderBy: { label: "asc" },
    }),
    prisma.rating.findMany({
      where: { product: { sellerId } },
      include: {
        product: { select: { name: true } },
        buyer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    getRates(),
  ]);

  return (
    <main className="flex min-h-dvh w-full flex-col gap-6 px-6 pt-20 pb-32">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-semibold tracking-tight">
          Seller dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage products, orders, payments, and ratings
        </p>
      </div>
      <SellerDashboard
        products={products.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          badge: product.badge ?? undefined,
          imageUrl: product.imageUrl ?? undefined,
          listPrice: product.listPrice,
          salePrice: product.salePrice ?? undefined,
          status: product.status,
          ratingCount: product.ratings.length,
        }))}
        orders={orders.map((order) => ({
          id: order.id,
          status: order.status,
          totalUsd: order.totalUsd,
          currency: order.currency,
          paymentMethod: order.paymentMethod,
          advanceProof: order.advanceProof,
          buyerName: order.buyer.name,
          createdAt: order.createdAt.toISOString(),
          items: order.items.map((item) => ({
            qty: item.qty,
            priceUsd: item.priceUsd,
            productName: item.product.name,
          })),
        }))}
        methods={methods.map((method) => ({
          id: method.id,
          type: method.type as "manual" | "online",
          channel: method.channel,
          label: method.label,
          details: method.details,
        }))}
        ratings={ratings.map((rating) => ({
          id: rating.id,
          stars: rating.stars,
          comment: rating.comment,
          productName: rating.product.name,
          buyerName: rating.buyer.name,
          createdAt: rating.createdAt.toISOString(),
        }))}
        currency={me.currency}
        rates={rates}
      />
    </main>
  );
};

export default SellerPage;
