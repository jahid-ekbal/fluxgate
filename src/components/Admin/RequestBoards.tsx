"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/shadcnui/badge";
import { Button } from "@/components/shadcnui/button";
import { Card } from "@/components/shadcnui/card";
import { timeAgo } from "@/lib/dates";

export type ReqTicket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  buyerName: string;
};

export type ReqDispute = {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  buyerName: string;
  orderTotal: number;
  orderStatus: string;
};

export type PendingProduct = {
  id: string;
  name: string;
  description: string;
  category: string;
  listPrice: number;
  salePrice: number | null;
  createdAt: string;
  sellerName: string;
};

const act = async (kind: string, id: string, action: string) => {
  await fetch("/api/admin/requests", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, id, action }),
  });
};

const RequestBoards = ({
  tickets,
  disputes,
  pending,
}: {
  tickets: ReqTicket[];
  disputes: ReqDispute[];
  pending: PendingProduct[];
}) => {
  const router = useRouter();
  const run = async (kind: string, id: string, action: string) => {
    await act(kind, id, action);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">
          Approvals ({pending.length} pending)
        </h2>
        {pending.map((product) => (
          <Card
            key={product.id}
            className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium">
                {product.name} by {product.sellerName}
              </span>
              <span className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => run("product", product.id, "approve")}>
                  Approve
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => run("product", product.id, "reject")}>
                  Reject
                </Button>
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              {product.category} (${product.listPrice}){" "}
              {timeAgo(product.createdAt)}
            </p>
            <p className="text-muted-foreground text-xs">
              {product.description}
            </p>
          </Card>
        ))}
        {pending.length === 0 && (
          <p className="text-muted-foreground text-sm">Nothing pending</p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Support tickets</h2>
        {tickets.map((ticket) => (
          <Card
            key={ticket.id}
            className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium">
                {ticket.subject} by {ticket.buyerName}
              </span>
              <span className="flex items-center gap-2">
                <Badge
                  variant={ticket.status === "open" ? "default" : "secondary"}>
                  {ticket.status}
                </Badge>
                {ticket.status === "open" && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => run("ticket", ticket.id, "close")}>
                    Close
                  </Button>
                )}
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              {ticket.message} ({timeAgo(ticket.createdAt)})
            </p>
          </Card>
        ))}
        {tickets.length === 0 && (
          <p className="text-muted-foreground text-sm">No tickets</p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Disputes</h2>
        {disputes.map((dispute) => (
          <Card
            key={dispute.id}
            className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium">
                ${dispute.orderTotal.toFixed(2)} {dispute.orderStatus} by{" "}
                {dispute.buyerName}
              </span>
              <span className="flex items-center gap-2">
                <Badge
                  variant={dispute.status === "open" ? "default" : "secondary"}>
                  {dispute.status}
                </Badge>
                {dispute.status === "open" && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => run("dispute", dispute.id, "resolve")}>
                    Resolve
                  </Button>
                )}
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              {dispute.reason} ({timeAgo(dispute.createdAt)})
            </p>
          </Card>
        ))}
        {disputes.length === 0 && (
          <p className="text-muted-foreground text-sm">No disputes</p>
        )}
      </section>
    </div>
  );
};

export default RequestBoards;
