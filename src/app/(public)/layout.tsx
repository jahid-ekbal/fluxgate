import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, Users, Zap } from "lucide-react";
import type { LayoutProps } from "@/lib/types";
import { getSessionUser } from "@/server/marketplace";

const points = [
  { icon: ShieldCheck, text: "Sessions verified on the server" },
  { icon: Users, text: "Shoppers and admins, routed by role" },
  { icon: Zap, text: "Email plus Google and Discord login" },
];

const PublicLayout = async ({ children }: LayoutProps) => {
  const me = await getSessionUser();
  if (me) {
    redirect(
      me.role === "admin" ? "/admin"
      : me.role === "seller" ? "/seller"
      : "/browse",
    );
  }
  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <div className="bg-primary text-primary-foreground hidden flex-col justify-between p-10 lg:flex">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="Fluxgate home">
          <span className="bg-primary-foreground/15 flex size-9 items-center justify-center rounded-md">
            <Zap className="size-5" />
          </span>
          <span className="text-xl font-semibold">Fluxgate</span>
        </Link>
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-semibold tracking-tight">
            The gateway to your store
          </h1>
          <p className="text-primary-foreground/80 text-lg">
            One secure account for shopping the catalog and running the
            dashboard.
          </p>
          <ul className="flex flex-col gap-3">
            {points.map((point) => (
              <li
                key={point.text}
                className="flex items-center gap-3 text-sm">
                <point.icon className="size-4 shrink-0" />
                {point.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-primary-foreground/70 text-sm">
          Protected by role based access
        </p>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        {children}
      </div>
    </main>
  );
};

export default PublicLayout;
