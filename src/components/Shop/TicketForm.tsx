"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Loader2, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/components/shadcnui/alert";
import { Button } from "@/components/shadcnui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { Field, FieldError, FieldLabel } from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";

const TicketForm = () => {
  const [message, setMessage] = useState<string | null>(null);
  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { subject: "", message: "" },
    mode: "all",
  });

  const onSubmit = async (values: { subject: string; message: string }) => {
    setMessage(null);
    if (values.subject.trim() === "" || values.message.trim() === "") {
      setMessage("Subject and message are required");
      return;
    }
    const response = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!response.ok) {
      setMessage("Sending failed, try again");
      return;
    }
    reset();
    setMessage("Ticket sent, support will reply soon");
  };

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>Need help?</CardTitle>
        <CardDescription>Open a support ticket</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4">
          <Controller
            name="subject"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="ticket-subject">Subject</FieldLabel>
                <Input
                  {...field}
                  id="ticket-subject"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="message"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="ticket-message">Message</FieldLabel>
                <Input
                  {...field}
                  id="ticket-message"
                  autoComplete="off"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          {message && (
            <Alert
              variant={
                message.startsWith("Ticket sent") ? "default" : "destructive"
              }>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}>
            {isSubmitting ?
              <Loader2 className="animate-spin" />
            : <Send />}
            {isSubmitting ? "Sending" : "Send ticket"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TicketForm;
