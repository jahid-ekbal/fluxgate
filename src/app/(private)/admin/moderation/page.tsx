import prisma from "@/lib/dbClient/prisma";
import ModerationQueue from "@/components/Admin/ModerationQueue";

export const metadata = { title: "Admin moderation" };

const AdminModerationPage = async () => {
  const [reports, hidden, takedown] = await Promise.all([
    prisma.report.findMany({
      include: {
        buyer: { select: { name: true } },
        product: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.rating.findMany({
      where: { hidden: true },
      include: {
        product: { select: { name: true } },
        buyer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { status: "takedown" },
      include: { seller: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">Moderation</h1>
      <ModerationQueue
        reports={reports.map((report) => ({
          id: report.id,
          reason: report.reason,
          status: report.status,
          createdAt: report.createdAt.toISOString(),
          buyerName: report.buyer.name,
          productName: report.product?.name ?? null,
          productId: report.productId,
          ratingId: report.ratingId,
        }))}
        hidden={hidden.map((rating) => ({
          id: rating.id,
          stars: rating.stars,
          comment: rating.comment,
          productName: rating.product.name,
          buyerName: rating.buyer.name,
        }))}
        takedown={takedown.map((product) => ({
          id: product.id,
          name: product.name,
          status: product.status,
          sellerName: product.seller.name,
        }))}
      />
    </div>
  );
};

export default AdminModerationPage;
