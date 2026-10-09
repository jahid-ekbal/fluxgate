import prisma from "@/lib/dbClient/prisma";
import RequestBoards from "@/components/Admin/RequestBoards";

export const metadata = { title: "Admin requests" };

const AdminRequestsPage = async () => {
  const [tickets, disputes, pending] = await Promise.all([
    prisma.supportTicket.findMany({
      include: { buyer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.dispute.findMany({
      include: {
        buyer: { select: { name: true } },
        order: { select: { totalUsd: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.product.findMany({
      where: { status: "pending" },
      include: { seller: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">Requests</h1>
      <RequestBoards
        tickets={tickets.map((ticket) => ({
          id: ticket.id,
          subject: ticket.subject,
          message: ticket.message,
          status: ticket.status,
          createdAt: ticket.createdAt.toISOString(),
          buyerName: ticket.buyer.name,
        }))}
        disputes={disputes.map((dispute) => ({
          id: dispute.id,
          reason: dispute.reason,
          status: dispute.status,
          createdAt: dispute.createdAt.toISOString(),
          buyerName: dispute.buyer.name,
          orderTotal: dispute.order.totalUsd,
          orderStatus: dispute.order.status,
        }))}
        pending={pending.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          listPrice: product.listPrice,
          salePrice: product.salePrice,
          createdAt: product.createdAt.toISOString(),
          sellerName: product.seller.name,
        }))}
      />
    </div>
  );
};

export default AdminRequestsPage;
