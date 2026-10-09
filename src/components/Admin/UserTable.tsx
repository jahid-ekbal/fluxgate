"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/shadcnui/badge";
import { Field, FieldLabel } from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
};

const UserTable = ({ users }: { users: AdminUserRow[] }) => {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const filtered =
    needle.length === 0 ?
      users
    : users.filter(
        (user) =>
          user.name.toLowerCase().includes(needle) ||
          user.email.toLowerCase().includes(needle),
      );

  return (
    <div className="flex flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="user-search">Search users</FieldLabel>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            id="user-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name or email"
            autoComplete="off"
            className="pl-9"
          />
        </div>
      </Field>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-muted-foreground border-b">
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Email</th>
              <th className="py-2 pr-4 font-medium">Role</th>
              <th className="py-2 font-medium">Verified</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr
                key={user.id}
                className="border-b last:border-0">
                <td className="py-2 pr-4">{user.name}</td>
                <td className="py-2 pr-4">{user.email}</td>
                <td className="py-2 pr-4">
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                </td>
                <td className="py-2">
                  <Badge
                    variant={user.emailVerified ? "secondary" : "destructive"}>
                    {user.emailVerified ? "yes" : "no"}
                  </Badge>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="text-muted-foreground py-4 text-center">
                  No users match this search
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
