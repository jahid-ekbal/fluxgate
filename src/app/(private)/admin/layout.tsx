import { redirect } from "next/navigation";
import AdminMenu from "@/components/Admin/AdminMenu";
import type { LayoutProps } from "@/lib/types";
import { getSessionUser } from "@/server/marketplace";

const AdminLayout = async ({ children }: LayoutProps) => {
  const me = await getSessionUser();
  if (!me) {
    redirect("/sign-in");
  }
  if (me.role !== "admin") {
    redirect("/browse");
  }
  return (
    <div className="flex min-h-dvh w-full flex-col gap-6 px-6 pt-20 pb-32">
      <div>
        <AdminMenu />
      </div>
      <div className="min-w-0 grow">{children}</div>
    </div>
  );
};

export default AdminLayout;
