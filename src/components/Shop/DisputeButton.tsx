"use client";

import { useState } from "react";
import { Button } from "@/components/shadcnui/button";
import { Input } from "@/components/shadcnui/input";

const DisputeButton = ({ orderId }: { orderId: string }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (reason.trim() === "") {
      return;
    }
    setSending(true);
    const response = await fetch("/api/disputes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, reason: reason.trim() }),
    });
    setSending(false);
    if (response.ok) {
      setDone(true);
      setOpen(false);
      setReason("");
    }
  };

  if (done) {
    return (
      <p className="text-muted-foreground text-xs">Disputed, admin notified</p>
    );
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}>
        Open dispute
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Dispute reason"
        aria-label="Dispute reason"
        autoComplete="off"
      />
      <Button
        type="button"
        size="sm"
        disabled={sending}
        onClick={submit}>
        {sending ? "Sending" : "Send"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => setOpen(false)}>
        Cancel
      </Button>
    </div>
  );
};

export default DisputeButton;
