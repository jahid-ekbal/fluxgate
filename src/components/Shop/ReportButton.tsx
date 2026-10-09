"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/shadcnui/button";
import { Input } from "@/components/shadcnui/input";

const ReportButton = ({
  productId,
  ratingId,
}: {
  productId?: string;
  ratingId?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (reason.trim() === "") {
      return;
    }
    setSending(true);
    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, ratingId, reason: reason.trim() }),
    });
    setSending(false);
    if (response.ok) {
      setDone(true);
      setOpen(false);
      setReason("");
    }
  };

  if (done) {
    return <p className="text-muted-foreground text-xs">Reported, thanks</p>;
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label="Report"
        onClick={() => setOpen(true)}>
        <Flag />
        Report
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Reason"
        aria-label="Report reason"
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

export default ReportButton;
