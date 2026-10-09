import { redirect } from "next/navigation";
import type { LayoutProps } from "@/lib/types";
import { getSession } from "@/server/get-session";

const PrivateLayout = async ({ children }: LayoutProps) => {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }
  return <>{children}</>;
};

export default PrivateLayout;
