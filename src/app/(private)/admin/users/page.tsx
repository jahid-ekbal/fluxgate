import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import UserManager from "@/components/Admin/UserManager";
import { Card } from "@/components/shadcnui/card";

export const metadata = { title: "Admin users" };

const AdminUsersPage = async () => {
  const result = await auth.api.listUsers({
    query: { limit: 100 },
    headers: await headers(),
  });
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
      <Card className="p-6">
        <UserManager
          initial={result.users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: (user as { role?: string }).role ?? "buyer",
            emailVerified: user.emailVerified,
            banned: (user as { banned?: boolean }).banned ?? false,
          }))}
        />
      </Card>
    </div>
  );
};

export default AdminUsersPage;
