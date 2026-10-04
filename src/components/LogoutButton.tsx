"use client";

import { Button } from "@/components/shadcnui/button";
import { toast } from "@/components/shadcnui/toast";
import { logoutAction } from "@/server/actions/auth";
import { Loader2Icon, LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const LogoutButton = () => {
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  const logoutHandler = () => {
    startTransition(async () => {
      const result = await logoutAction();
      if (!result.success) {
        toast.add({
          title: "Logout failed",
          description: result.error ?? "Try again.",
          type: "error",
        });
        return;
      }
      toast.add({
        title: "Logged out",
        description: "Redirecting to login.",
        type: "success",
      });
      replace("/login");
    });
  };

  return (
    <Button
      onClick={logoutHandler}
      disabled={isPending}
      variant="outline">
      {isPending ?
        <>
          <Loader2Icon className="animate-spin" /> Logging out...
        </>
      : <>
          <LogOutIcon /> Logout
        </>
      }
    </Button>
  );
};

export default LogoutButton;
