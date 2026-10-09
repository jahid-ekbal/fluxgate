"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { productSchema, type ProductInput } from "@/lib/zodSchema";
import { Alert, AlertDescription } from "@/components/shadcnui/alert";
import { Button } from "@/components/shadcnui/button";
import { Field, FieldError, FieldLabel } from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";

export type ProductFormValue = ProductInput & { id?: string };

const ProductForm = ({
  initial,
  onDone,
}: {
  initial?: ProductFormValue | null;
  onDone: () => void;
}) => {
  const [message, setMessage] = useState<string | null>(null);
  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      category: initial?.category ?? "",
      badge: initial?.badge ?? "",
      imageUrl: initial?.imageUrl ?? "",
      listPrice: initial?.listPrice ?? 0,
      salePrice: initial?.salePrice ?? undefined,
    },
    mode: "all",
  });

  const onSubmit = async (values: ProductInput) => {
    setMessage(null);
    const response = await fetch("/api/products", {
      method: initial?.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        initial?.id ?
          {
            id: initial.id,
            ...values,
            imageUrl: values.imageUrl || undefined,
            salePrice: values.salePrice || undefined,
          }
        : {
            ...values,
            imageUrl: values.imageUrl || undefined,
            salePrice: values.salePrice || undefined,
          },
      ),
    });
    if (!response.ok) {
      setMessage("Saving product failed, try again");
      return;
    }
    reset();
    onDone();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="grid gap-4 sm:grid-cols-2">
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="product-name">Name</FieldLabel>
            <Input
              {...field}
              id="product-name"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="category"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="product-category">Category</FieldLabel>
            <Input
              {...field}
              id="product-category"
              placeholder="Software"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field, fieldState }) => (
          <Field
            data-invalid={fieldState.invalid}
            className="sm:col-span-2">
            <FieldLabel htmlFor="product-description">Description</FieldLabel>
            <Input
              {...field}
              id="product-description"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="badge"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="product-badge">Badge (optional)</FieldLabel>
            <Input
              {...field}
              id="product-badge"
              placeholder="LATEST"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="imageUrl"
        control={control}
        render={({ field, fieldState }) => (
          <Field
            data-invalid={fieldState.invalid}
            className="sm:col-span-2">
            <FieldLabel htmlFor="product-image">
              Image URL (optional)
            </FieldLabel>
            <Input
              {...field}
              id="product-image"
              placeholder="https://example.com/image.png"
              inputMode="url"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="listPrice"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="product-list">List USD</FieldLabel>
              <Input
                id="product-list"
                type="number"
                step="0.01"
                min="0"
                value={field.value}
                onChange={(event) => field.onChange(Number(event.target.value))}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="salePrice"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="product-sale">Sale USD</FieldLabel>
              <Input
                id="product-sale"
                type="number"
                step="0.01"
                min="0"
                value={field.value ?? ""}
                onChange={(event) =>
                  field.onChange(
                    event.target.value === "" ?
                      undefined
                    : Number(event.target.value),
                  )
                }
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      {message && (
        <Alert
          variant="destructive"
          className="sm:col-span-2">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      <div className="sm:col-span-2">
        <Button
          type="submit"
          disabled={isSubmitting}>
          {isSubmitting ?
            <Loader2 className="animate-spin" />
          : <Plus />}
          {initial?.id ? "Save product" : "Add product"}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
