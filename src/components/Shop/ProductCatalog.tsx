"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppWindow,
  Gamepad2,
  Monitor,
  Palette,
  ShoppingCart,
  Star,
  Terminal,
} from "lucide-react";
import { Badge } from "@/components/shadcnui/badge";
import { Button } from "@/components/shadcnui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { Field, FieldLabel } from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";
import { formatMoney } from "@/lib/money";
import RateForm from "@/components/Shop/RateForm";
import ReportButton from "@/components/Shop/ReportButton";

export type CatalogComment = {
  stars: number;
  comment: string | null;
  buyerName: string;
  createdAt: string;
};

export type CatalogProduct = {
  id: string;
  name: string;
  description: string;
  category: string;
  badge: string | null;
  imageUrl: string | null;
  listPrice: number;
  salePrice: number | null;
  sellerName: string;
  avgStars: number;
  ratingCount: number;
  comments: CatalogComment[];
};

const categoryIcon = (category: string) => {
  if (category === "Operating Systems") return Monitor;
  if (category === "Gaming & Utilities") return Gamepad2;
  if (category === "Design & Development") return Palette;
  if (category === "Terminal & Customization") return Terminal;
  return AppWindow;
};

const Stars = ({ value }: { value: number }) => (
  <span
    className="flex items-center gap-0.5"
    aria-label={`${value.toFixed(1)} stars`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={
          star <= Math.round(value) ?
            "size-3.5 fill-amber-400 text-amber-400"
          : "text-muted-foreground size-3.5"
        }
      />
    ))}
  </span>
);

const ProductCatalog = ({
  products,
  currency,
  rates,
}: {
  products: CatalogProduct[];
  currency: string;
  rates: Record<string, number>;
}) => {
  const router = useRouter();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState<string | null>(null);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    [products],
  );
  const needle = query.trim().toLowerCase();
  const filtered = products.filter(
    (product) =>
      (category === "All" || product.category === category) &&
      (needle.length === 0 ||
        product.name.toLowerCase().includes(needle) ||
        product.description.toLowerCase().includes(needle)),
  );

  const addToCart = async (productId: string) => {
    setAdding(productId);
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, qty: 1 }),
    });
    setAdding(null);
    window.dispatchEvent(new CustomEvent("cart-updated"));
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <Button
              key={item}
              type="button"
              variant={category === item ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(item)}>
              {item}
            </Button>
          ))}
        </div>
        <Field className="lg:ml-auto lg:w-64">
          <FieldLabel htmlFor="product-search">Search products</FieldLabel>
          <Input
            id="product-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name or description"
            autoComplete="off"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => {
          const Icon = categoryIcon(product.category);
          return (
            <Card
              key={product.id}
              className="flex flex-col">
              {product.imageUrl ?
                <div className="mx-6 mt-6 overflow-hidden rounded-md">
                  {/* eslint-disable-next-line @next/next/no-img-element -- seller URLs are arbitrary hosts */}
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    loading="lazy"
                    className="h-28 w-full object-cover"
                  />
                </div>
              : <div className="bg-muted mx-6 mt-6 flex h-28 items-center justify-between rounded-md p-4">
                  <Icon className="text-primary size-10" />
                  {product.badge && <Badge>{product.badge}</Badge>}
                </div>
              }
              <CardHeader className="grow">
                <CardTitle className="text-base">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
                <div className="flex items-center gap-2 pt-1">
                  <Stars value={product.avgStars} />
                  <span className="text-muted-foreground text-xs">
                    {product.avgStars.toFixed(1)} ({product.ratingCount})
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-semibold">
                    {formatMoney(
                      product.salePrice ?? product.listPrice,
                      currency,
                      rates,
                    )}
                  </span>
                  {product.salePrice && (
                    <span className="text-muted-foreground text-sm line-through">
                      {formatMoney(product.listPrice, currency, rates)}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-xs">
                  Sold by {product.sellerName}
                </p>
              </CardHeader>
              <div className="flex flex-col gap-3 px-6 pb-6">
                <Button
                  type="button"
                  disabled={adding === product.id}
                  onClick={() => addToCart(product.id)}>
                  <ShoppingCart />
                  {adding === product.id ? "Adding" : "Add to cart"}
                </Button>
                <RateForm
                  productId={product.id}
                  comments={product.comments}
                  onRated={() => router.refresh()}
                />
                <ReportButton productId={product.id} />
              </div>
            </Card>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <p className="text-muted-foreground py-8 text-center text-sm">
          No products match this filter
        </p>
      )}
    </div>
  );
};

export default ProductCatalog;
