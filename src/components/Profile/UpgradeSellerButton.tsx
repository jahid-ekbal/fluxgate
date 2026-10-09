"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Store } from "lucide-react";
import { Button } from "@/components/shadcnui/button";

const UpgradeSellerButton = () => {
  const router = useRouter();
  const [sending, setSending] = useState(false);

  const upgrade = async () => {
    setSending(true);
    const response = await fetch("/api/settings", { method: "POST" });
    setSending(false);
    if (response.ok) {
      router.push("/seller");
      router.refresh();
    }
  };

  return (
    <Button
      type="button"
      disabled={sending}
      onClick={upgrade}>
      <Store />
      {sending ? "Upgrading" : "Become a seller"}
    </Button>
  );
};

export default UpgradeSellerButton;
