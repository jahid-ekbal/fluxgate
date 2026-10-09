"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import {
  LayoutGrid,
  LogIn,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Store,
  UserPlus,
  Zap,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import UserMenu from "@/components/Auth/UserMenu";
import ThemeToggler from "@/components/Layout/ThemeToggler";
import { openCart } from "@/components/Shop/CartDrawer";
import { Dock, DockIcon } from "@/components/shadcnui/dock";
import { Separator } from "@/components/shadcnui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcnui/tooltip";
import { buttonVariants } from "@/components/shadcnui/button";
import { cn } from "@/lib/utils";

const DockLink = ({
  href,
  label,
  active,
  children,
}: {
  href: Route;
  label: string;
  active: boolean;
  children: React.ReactNode;
}) => (
  <DockIcon>
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href={href}
            aria-label={label}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "size-full rounded-full",
              active && "bg-muted text-foreground",
            )}>
            {children}
          </Link>
        }
      />
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  </DockIcon>
);

const DockNav = () => {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const role =
    (session?.user as { role?: string } | undefined)?.role ?? "buyer";
  const [cartCount, setCartCount] = useState(0);

  const loadCount = useCallback(async () => {
    if (!session) {
      setCartCount(0);
      return;
    }
    const response = await fetch("/api/cart");
    if (!response.ok) {
      setCartCount(0);
      return;
    }
    const data = (await response.json()) as {
      items: { qty: number }[];
    };
    setCartCount(data.items.reduce((sum, item) => sum + item.qty, 0));
  }, [session]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadCount();
    }, 0);
    const refresh = () => {
      void loadCount();
    };
    window.addEventListener("cart-updated", refresh);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("cart-updated", refresh);
    };
  }, [loadCount]);

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <TooltipProvider delay={200}>
        <Dock className="mt-0">
          <DockLink
            href="/"
            label="Fluxgate home"
            active={pathname === "/"}>
            <span className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Zap className="size-4" />
            </span>
          </DockLink>
          <DockLink
            href="/browse"
            label="Browse"
            active={pathname.startsWith("/browse")}>
            <LayoutGrid className="size-4" />
          </DockLink>
          {session && (role === "seller" || role === "admin") && (
            <DockLink
              href="/seller"
              label="Seller dashboard"
              active={pathname.startsWith("/seller")}>
              <Store className="size-4" />
            </DockLink>
          )}
          {session && role === "admin" && (
            <DockLink
              href="/admin"
              label="Admin dashboard"
              active={pathname.startsWith("/admin")}>
              <ShieldCheck className="size-4" />
            </DockLink>
          )}
          <Separator
            orientation="vertical"
            className="h-8"
          />
          {!session && (
            <>
              <DockLink
                href="/sign-in"
                label="Sign in"
                active={pathname.startsWith("/sign-in")}>
                <LogIn className="size-4" />
              </DockLink>
              <DockLink
                href="/sign-up"
                label="Sign up"
                active={pathname.startsWith("/sign-up")}>
                <UserPlus className="size-4" />
              </DockLink>
            </>
          )}
          {session && (
            <>
              <DockIcon>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <button
                        type="button"
                        aria-label="Open cart"
                        onClick={openCart}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "relative size-full rounded-full",
                        )}>
                        <ShoppingCart className="size-4" />
                        {cartCount > 0 && (
                          <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full text-[10px] font-semibold">
                            {cartCount > 99 ? "99" : cartCount}
                          </span>
                        )}
                      </button>
                    }
                  />
                  <TooltipContent>
                    <p>Cart</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>
              <DockLink
                href="/settings"
                label="Settings"
                active={pathname.startsWith("/settings")}>
                <Settings className="size-4" />
              </DockLink>
              <DockIcon>
                <UserMenu />
              </DockIcon>
            </>
          )}
          <DockIcon>
            <ThemeToggler />
          </DockIcon>
        </Dock>
      </TooltipProvider>
    </div>
  );
};

export default DockNav;
