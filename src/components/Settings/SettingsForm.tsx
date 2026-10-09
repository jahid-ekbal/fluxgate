"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { settingsSchema, type SettingsInput } from "@/lib/zodSchema";
import { Alert, AlertDescription } from "@/components/shadcnui/alert";
import { Button } from "@/components/shadcnui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { Field, FieldLabel } from "@/components/shadcnui/field";

const METHODS = [
  "whatsapp",
  "discord",
  "google-form",
  "razorpay",
  "stripe",
  "crypto",
] as const;

const CURR_OPTIONS = ["USD", "INR", "PKR", "BDT", "USDT"] as const;

const SettingsForm = ({
  initial,
}: {
  initial: { currency: string; paymentMethod: string };
}) => {
  const [message, setMessage] = useState<string | null>(null);
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      currency:
        (CURR_OPTIONS as readonly string[]).includes(initial.currency) ?
          (initial.currency as SettingsInput["currency"])
        : "USD",
      paymentMethod: initial.paymentMethod,
    },
    mode: "all",
  });

  const onSubmit = async (values: SettingsInput) => {
    setMessage(null);
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setMessage(response.ok ? "Settings saved" : "Saving failed, try again");
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>
          Currency converts every price, payment method prefills checkout
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4">
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Currency</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {CURR_OPTIONS.map((code) => (
                    <Button
                      key={code}
                      type="button"
                      variant={field.value === code ? "default" : "outline"}
                      size="sm"
                      aria-pressed={field.value === code}
                      onClick={() => field.onChange(code)}>
                      {code}
                    </Button>
                  ))}
                </div>
              </Field>
            )}
          />
          <Controller
            name="paymentMethod"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Payment method</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {METHODS.map((method) => (
                    <Button
                      key={method}
                      type="button"
                      variant={field.value === method ? "default" : "outline"}
                      size="sm"
                      aria-pressed={field.value === method}
                      onClick={() => field.onChange(method)}>
                      {method}
                    </Button>
                  ))}
                </div>
              </Field>
            )}
          />
          {message && (
            <Alert
              variant={
                message === "Settings saved" ? "default" : "destructive"
              }>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}>
            {isSubmitting ?
              <Loader2 className="animate-spin" />
            : <Save />}
            {isSubmitting ? "Saving" : "Save settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SettingsForm;
