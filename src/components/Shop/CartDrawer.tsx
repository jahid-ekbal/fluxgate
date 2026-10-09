"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/shadcnui/alert";
import { Button } from "@/components/shadcnui/button";
import { Field, FieldLabel } from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";
import { Separator } from "@/components/shadcnui/separator";
import { formatMoney } from "@/lib/money";

export const openCart = () => {
  window.dispatchEvent(new CustomEvent("open-cart"));
};

type CartItem = {
  id: string;
  qty: number;
  product: {
    id: string;
    name: string;
    sellerId?: string;
    unitUsd: number;
  };
};

type CartData = {
  items: CartItem[];
  totalUsd: number;
  currency: string;
  paymentMethod: string;
  rates: Record<string, number>;
};

const CartDrawer = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<CartData | null>(null);
  const [proof, setProof] = useState("");
  const [coupon, setCoupon] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/cart");
    if (response.ok) {
      setData((await response.json()) as CartData);
    } else {
      setData(null);
    }
  }, []);

  useEffect(() => {
    const show = () => {
      setOpen(true);
      void load();
    };
    const refresh = () => {
      void load();
    };
    window.addEventListener("open-cart", show);
    window.addEventListener("cart-updated", refresh);
    return () => {
      window.removeEventListener("open-cart", show);
      window.removeEventListener("cart-updated", refresh);
    };
  }, [load]);

  const setQty = async (productId: string, qty: number) => {
    if (qty < 1) {
      await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
    } else {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, qty }),
      });
    }
    await load();
    window.dispatchEvent(new CustomEvent("cart-updated"));
  };

  const checkout = async () => {
    if (!data || data.items.length === 0) {
      return;
    }
    setPlacing(true);
    setMessage(null);
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currency: data.currency,
        paymentMethod: data.paymentMethod,
        advanceProof: proof.trim() === "" ? undefined : proof.trim(),
        couponCode: coupon.trim() === "" ? undefined : coupon.trim(),
      }),
    });
    setPlacing(false);
    if (!response.ok) {
      setMessage("Checkout failed, try again");
      return;
    }
    setProof("");
    setCoupon("");
    setOpen(false);
    await load();
    window.dispatchEvent(new CustomEvent("cart-updated"));
    router.refresh();
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-label="Shopping cart">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => setOpen(false)}
      />
      <div className="bg-background absolute top-0 right-0 flex h-full w-full max-w-md flex-col border-l">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ShoppingCart className="size-5" />
            Cart
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close cart"
            onClick={() => setOpen(false)}>
            <X />
          </Button>
        </div>
        <div className="flex grow flex-col gap-3 overflow-y-auto p-4">
          {!data || data.items.length === 0 ?
            <p className="text-muted-foreground py-8 text-center text-sm">
              Your cart is empty
            </p>
          : data.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 rounded-md border p-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">
                    {item.product.name}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {formatMoney(
                      item.product.unitUsd,
                      data.currency,
                      data.rates,
                    )}{" "}
                    each
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Decrease quantity"
                    onClick={() => setQty(item.product.id, item.qty - 1)}>
                    <Minus />
                  </Button>
                  <span className="w-6 text-center text-sm">{item.qty}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Increase quantity"
                    onClick={() => setQty(item.product.id, item.qty + 1)}>
                    <Plus />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove item"
                    onClick={() => setQty(item.product.id, 0)}>
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))
          }
        </div>
        {data && data.items.length > 0 && (
          <div className="flex flex-col gap-3 border-t p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="text-lg font-semibold">
                {formatMoney(data.totalUsd, data.currency, data.rates)}
              </span>
            </div>
            <p className="text-muted-foreground text-xs">
              Paying with {data.paymentMethod} in {data.currency}, change in
              settings
            </p>
            <Field>
              <FieldLabel htmlFor="coupon-code">Coupon (optional)</FieldLabel>
              <Input
                id="coupon-code"
                value={coupon}
                onChange={(event) => setCoupon(event.target.value)}
                placeholder="EKBAL30"
                autoComplete="off"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="advance-proof">
                Advance proof (optional)
              </FieldLabel>
              <Input
                id="advance-proof"
                value={proof}
                onChange={(event) => setProof(event.target.value)}
                placeholder="Payment reference"
                autoComplete="off"
              />
            </Field>
            {message && (
              <Alert variant="destructive">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            <Button
              type="button"
              disabled={placing}
              onClick={checkout}>
              {placing ? "Placing order" : "Place order"}
            </Button>
          </div>
        )}
        <Separator />
      </div>
    </div>
  );
};

export default CartDrawer;
