"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/shadcnui/badge";
import { Button } from "@/components/shadcnui/button";
import { Card } from "@/components/shadcnui/card";
import { formatMoney } from "@/lib/money";
import { formatDate, timeAgo } from "@/lib/dates";
import MethodForm, {
  type MethodFormValue,
} from "@/components/Seller/MethodForm";
import ProductForm, {
  type ProductFormValue,
} from "@/components/Seller/ProductForm";

export type SellerProduct = ProductFormValue & {
  id: string;
  status: string;
  ratingCount: number;
};

export type SellerOrder = {
  id: string;
  status: string;
  totalUsd: number;
  currency: string;
  paymentMethod: string;
  advanceProof: string | null;
  buyerName: string;
  createdAt: string;
  items: { qty: number; priceUsd: number; productName: string }[];
};

export type SellerMethod = MethodFormValue & { id: string };

export type SellerRating = {
  id: string;
  stars: number;
  comment: string | null;
  productName: string;
  buyerName: string;
  createdAt: string;
};

const SellerDashboard = ({
  products,
  orders,
  methods,
  ratings,
  currency,
  rates,
}: {
  products: SellerProduct[];
  orders: SellerOrder[];
  methods: SellerMethod[];
  ratings: SellerRating[];
  currency: string;
  rates: Record<string, number>;
}) => {
  const router = useRouter();
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(
    null,
  );
  const [showMethodForm, setShowMethodForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<SellerMethod | null>(null);

  const refresh = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setShowMethodForm(false);
    setEditingMethod(null);
    router.refresh();
  };

  const deleteProduct = async (id: string) => {
    await fetch("/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    refresh();
  };

  const deleteMethod = async (id: string) => {
    await fetch("/api/payment-methods", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    refresh();
  };

  const setStatus = async (orderId: string, status: string) => {
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    refresh();
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            My products ({products.length})
          </h2>
          <Button
            type="button"
            size="sm"
            variant={showProductForm ? "outline" : "default"}
            onClick={() => {
              setEditingProduct(null);
              setShowProductForm((value) => !value);
            }}>
            {showProductForm ? "Close" : "Add product"}
          </Button>
        </div>
        {showProductForm && (
          <Card className="p-6">
            <ProductForm onDone={refresh} />
          </Card>
        )}
        {editingProduct && (
          <Card className="p-6">
            <ProductForm
              initial={editingProduct}
              onDone={refresh}
            />
          </Card>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {products.map((product) => (
            <Card
              key={product.id}
              className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {product.category} ({product.ratingCount} ratings)
                  </span>
                  <Badge
                    variant={
                      product.status === "approved" ? "secondary" : "default"
                    }
                    className="w-fit">
                    {product.status}
                  </Badge>
                  <span className="text-sm font-semibold">
                    {formatMoney(
                      product.salePrice ?? product.listPrice,
                      currency,
                      rates,
                    )}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Edit product"
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(product);
                    }}>
                    <Pencil />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete product"
                    onClick={() => deleteProduct(product.id)}>
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">
          Orders received ({orders.length})
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{order.buyerName}</span>
                <Badge
                  variant={
                    order.status === "delivered" ? "secondary" : "default"
                  }>
                  {order.status}
                </Badge>
              </div>
              <p className="text-muted-foreground text-xs">
                {order.items
                  .map((item) => `${item.productName} x${item.qty}`)
                  .join(", ")}
              </p>
              <p className="text-sm font-semibold">
                {formatMoney(order.totalUsd, order.currency, rates)} via{" "}
                {order.paymentMethod}
              </p>
              <p className="text-muted-foreground text-xs">
                Placed {formatDate(order.createdAt)}
              </p>
              {order.advanceProof && (
                <p className="text-muted-foreground text-xs">
                  Proof: {order.advanceProof}
                </p>
              )}
              <div className="flex gap-2 pt-1">
                {order.status === "pending" && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setStatus(order.id, "confirmed")}>
                    Confirm
                  </Button>
                )}
                {order.status === "confirmed" && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setStatus(order.id, "delivered")}>
                    Deliver
                  </Button>
                )}
              </div>
            </Card>
          ))}
          {orders.length === 0 && (
            <p className="text-muted-foreground text-sm">No orders yet</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Payment methods</h2>
          <Button
            type="button"
            size="sm"
            variant={showMethodForm ? "outline" : "default"}
            onClick={() => {
              setEditingMethod(null);
              setShowMethodForm((value) => !value);
            }}>
            {showMethodForm ? "Close" : "Add method"}
          </Button>
        </div>
        {showMethodForm && (
          <Card className="p-6">
            <MethodForm onDone={refresh} />
          </Card>
        )}
        {editingMethod && (
          <Card className="p-6">
            <MethodForm
              initial={editingMethod}
              onDone={refresh}
            />
          </Card>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {methods.map((method) => (
            <Card
              key={method.id}
              className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{method.label}</span>
                  <span className="text-muted-foreground text-xs">
                    {method.type} ({method.channel})
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {method.details}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Edit payment method"
                    onClick={() => {
                      setShowMethodForm(false);
                      setEditingMethod(method);
                    }}>
                    <Pencil />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete payment method"
                    onClick={() => deleteMethod(method.id)}>
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">
          Ratings received ({ratings.length})
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {ratings.map((rating) => (
            <Card
              key={rating.id}
              className="p-4">
              <div className="flex items-center gap-1 text-sm font-medium">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                {rating.stars}/5 on {rating.productName}
              </div>
              <p className="text-muted-foreground text-xs">
                by {rating.buyerName} {timeAgo(rating.createdAt)}
                {rating.comment ? `, ${rating.comment}` : ""}
              </p>
            </Card>
          ))}
          {ratings.length === 0 && (
            <p className="text-muted-foreground text-sm">No ratings yet</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default SellerDashboard;
