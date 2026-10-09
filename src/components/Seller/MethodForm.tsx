"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { paymentMethodSchema, type PaymentMethodInput } from "@/lib/zodSchema";
import { Alert, AlertDescription } from "@/components/shadcnui/alert";
import { Button } from "@/components/shadcnui/button";
import { Field, FieldError, FieldLabel } from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";

export type MethodFormValue = PaymentMethodInput & { id?: string };

const TYPES = ["manual", "online"] as const;

const MethodForm = ({
  initial,
  onDone,
}: {
  initial?: MethodFormValue | null;
  onDone: () => void;
}) => {
  const [message, setMessage] = useState<string | null>(null);
  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      type: initial?.type ?? "manual",
      channel: initial?.channel ?? "",
      label: initial?.label ?? "",
      details: initial?.details ?? "",
    },
    mode: "all",
  });

  const onSubmit = async (values: PaymentMethodInput) => {
    setMessage(null);
    const response = await fetch("/api/payment-methods", {
      method: initial?.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        initial?.id ? { id: initial.id, ...values } : values,
      ),
    });
    if (!response.ok) {
      setMessage("Saving payment method failed, try again");
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
        name="type"
        control={control}
        render={({ field }) => (
          <Field>
            <FieldLabel>Type</FieldLabel>
            <div className="flex gap-2">
              {TYPES.map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={field.value === type ? "default" : "outline"}
                  size="sm"
                  aria-pressed={field.value === type}
                  onClick={() => field.onChange(type)}>
                  {type}
                </Button>
              ))}
            </div>
          </Field>
        )}
      />
      <Controller
        name="channel"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="method-channel">Channel</FieldLabel>
            <Input
              {...field}
              id="method-channel"
              placeholder="whatsapp, crypto, razorpay"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="label"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="method-label">Label</FieldLabel>
            <Input
              {...field}
              id="method-label"
              placeholder="WhatsApp orders"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="details"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="method-details">Details</FieldLabel>
            <Input
              {...field}
              id="method-details"
              placeholder="Number, wallet, or link buyers use"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
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
          {initial?.id ? "Save method" : "Add method"}
        </Button>
      </div>
    </form>
  );
};

export default MethodForm;
