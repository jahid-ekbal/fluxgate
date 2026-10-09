"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/shadcnui/badge";
import { Button } from "@/components/shadcnui/button";
import { Card } from "@/components/shadcnui/card";
import { timeAgo } from "@/lib/dates";

export type ModReport = {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  buyerName: string;
  productName: string | null;
  productId: string | null;
  ratingId: string | null;
};

export type HiddenRating = {
  id: string;
  stars: number;
  comment: string | null;
  productName: string;
  buyerName: string;
};

export type FlaggedProduct = {
  id: string;
  name: string;
  status: string;
  sellerName: string;
};

const act = async (kind: string, id: string, action: string) => {
  await fetch("/api/admin/requests", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, id, action }),
  });
};

const ModerationQueue = ({
  reports,
  hidden,
  takedown,
}: {
  reports: ModReport[];
  hidden: HiddenRating[];
  takedown: FlaggedProduct[];
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
          Reports ({reports.filter((r) => r.status === "open").length} open)
        </h2>
        {reports.map((report) => (
          <Card
            key={report.id}
            className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium">
                {report.productName ?? "Rating"} reported by {report.buyerName}
              </span>
              <Badge
                variant={report.status === "open" ? "default" : "secondary"}>
                {report.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-xs">
              {report.reason} ({timeAgo(report.createdAt)})
            </p>
            {report.status === "open" && (
              <div className="flex flex-wrap gap-2 pt-2">
                {report.ratingId && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => run("report", report.id, "hide-rating")}>
                    Hide rating
                  </Button>
                )}
                {report.productId && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      run("report", report.id, "takedown-product")
                    }>
                    Takedown product
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => run("report", report.id, "dismiss")}>
                  Dismiss
                </Button>
              </div>
            )}
          </Card>
        ))}
        {reports.length === 0 && (
          <p className="text-muted-foreground text-sm">No reports</p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">
          Hidden ratings ({hidden.length})
        </h2>
        {hidden.map((rating) => (
          <Card
            key={rating.id}
            className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium">
                {rating.stars}/5 on {rating.productName} by {rating.buyerName}
              </span>
              <span className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => run("rating", rating.id, "unhide")}>
                  Unhide
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => run("rating", rating.id, "delete")}>
                  Delete
                </Button>
              </span>
            </div>
            {rating.comment && (
              <p className="text-muted-foreground text-xs">{rating.comment}</p>
            )}
          </Card>
        ))}
        {hidden.length === 0 && (
          <p className="text-muted-foreground text-sm">Nothing hidden</p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">
          Takedown products ({takedown.length})
        </h2>
        {takedown.map((product) => (
          <Card
            key={product.id}
            className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium">
                {product.name} by {product.sellerName}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => run("product", product.id, "approve")}>
                Restore
              </Button>
            </div>
          </Card>
        ))}
        {takedown.length === 0 && (
          <p className="text-muted-foreground text-sm">Nothing taken down</p>
        )}
      </section>
    </div>
  );
};

export default ModerationQueue;
