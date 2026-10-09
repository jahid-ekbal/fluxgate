"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import {
  BadgePercent,
  ChartArea,
  Eye,
  Flag,
  Inbox,
  LayoutDashboard,
  Menu,
  Shapes,
  Users,
} from "lucide-react";
import { Button } from "@/components/shadcnui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcnui/dropdown-menu";
import { cn } from "@/lib/utils";

const items: { href: Route; label: string; Icon: typeof Users }[] = [
  { href: "/admin", label: "Overview", Icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", Icon: Users },
  { href: "/admin/taxonomy", label: "Taxonomy", Icon: Shapes },
  { href: "/admin/moderation", label: "Moderation", Icon: Flag },
  { href: "/admin/analytics", label: "Analytics", Icon: ChartArea },
  { href: "/admin/requests", label: "Requests", Icon: Inbox },
  { href: "/admin/visitors", label: "Visitors", Icon: Eye },
  { href: "/admin/ops", label: "Coupons & Rates", Icon: BadgePercent },
];

const AdminMenu = () => {
  const router = useRouter();
  const pathname = usePathname();
  const current =
    items.find((item) =>
      item.href === "/admin" ?
        pathname === "/admin"
      : pathname.startsWith(item.href),
    ) ?? items[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            aria-label="Admin menu">
            <Menu />
            {current.label}
          </Button>
        }
      />
      <DropdownMenuContent
        align="start"
        className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Admin sections</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {items.map((item) => {
            const active =
              item.href === "/admin" ?
                pathname === "/admin"
              : pathname.startsWith(item.href);
            return (
              <DropdownMenuItem
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(active && "bg-muted")}>
                <item.Icon className="size-4" />
                {item.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AdminMenu;
