"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/shadcnui/badge";
import { Button } from "@/components/shadcnui/button";
import { Field, FieldLabel } from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  banned?: boolean;
};

const ROLES = ["buyer", "seller", "admin"] as const;

const UserManager = ({ initial }: { initial: ManagedUser[] }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const users =
    needle.length === 0 ?
      initial
    : initial.filter(
        (user) =>
          user.name.toLowerCase().includes(needle) ||
          user.email.toLowerCase().includes(needle),
      );

  const act = async (action: string, userId: string, role?: string) => {
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, userId, role }),
    });
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <Field className="max-w-sm">
        <FieldLabel htmlFor="admin-user-search">Search users</FieldLabel>
        <Input
          id="admin-user-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Name or email"
          autoComplete="off"
        />
      </Field>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-muted-foreground border-b">
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Email</th>
              <th className="py-2 pr-4 font-medium">Role</th>
              <th className="py-2 pr-4 font-medium">State</th>
              <th className="py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b last:border-0">
                <td className="py-2 pr-4">{user.name}</td>
                <td className="py-2 pr-4">{user.email}</td>
                <td className="py-2 pr-4">
                  <Badge
                    variant={user.role === "buyer" ? "secondary" : "default"}>
                    {user.role}
                  </Badge>
                </td>
                <td className="py-2 pr-4">
                  <Badge variant={user.banned ? "destructive" : "secondary"}>
                    {user.banned ?
                      "banned"
                    : user.emailVerified ?
                      "verified"
                    : "unverified"}
                  </Badge>
                </td>
                <td className="flex flex-wrap gap-1 py-2">
                  {ROLES.filter((role) => role !== user.role).map((role) => (
                    <Button
                      key={role}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => act("setRole", user.id, role)}>
                      {role}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => act(user.banned ? "unban" : "ban", user.id)}>
                    {user.banned ? "Unban" : "Ban"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => act("remove", user.id)}>
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManager;
