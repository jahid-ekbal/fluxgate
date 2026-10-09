"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { ratingSchema, type RatingInput } from "@/lib/zodSchema";
import { timeAgo } from "@/lib/dates";
import { Button } from "@/components/shadcnui/button";
import { Field, FieldError, FieldLabel } from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";
import { cn } from "@/lib/utils";
import type { CatalogComment } from "@/components/Shop/ProductCatalog";

const RateForm = ({
  productId,
  comments,
  onRated,
}: {
  productId: string;
  comments: CatalogComment[];
  onRated: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [picked, setPicked] = useState(5);
  const {
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(ratingSchema),
    defaultValues: { productId, stars: 5, comment: "" },
    mode: "all",
  });

  const onSubmit = async (values: RatingInput) => {
    setMessage(null);
    const response = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!response.ok) {
      setMessage("Rating failed, try again");
      return;
    }
    reset({ productId, stars: 5, comment: "" });
    setOpen(false);
    onRated();
  };

  return (
    <div className="flex flex-col gap-2">
      {comments.slice(0, 2).map((item, index) => (
        <div
          key={index}
          className="bg-muted/50 rounded-md p-2 text-xs">
          <span className="font-medium">
            {item.buyerName} ({item.stars}/5)
          </span>
          <span className="text-muted-foreground">
            {timeAgo(item.createdAt)}
          </span>
          {item.comment && (
            <p className="text-muted-foreground">{item.comment}</p>
          )}
        </div>
      ))}
      {!open && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}>
          <Star />
          Rate this product
        </Button>
      )}
      {open && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`${value} stars`}
                onClick={() => {
                  setPicked(value);
                  setValue("stars", value, { shouldValidate: true });
                }}>
                <Star
                  className={cn(
                    "size-5",
                    value <= picked ?
                      "fill-amber-400 text-amber-400"
                    : "text-muted-foreground",
                  )}
                />
              </button>
            ))}
          </div>
          <Controller
            name="comment"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`comment-${productId}`}>
                  Comment (optional)
                </FieldLabel>
                <Input
                  {...field}
                  id={`comment-${productId}`}
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          {message && <p className="text-destructive text-xs">{message}</p>}
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}>
              {isSubmitting ? "Saving" : "Submit rating"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default RateForm;
