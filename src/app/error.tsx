"use client";

import Link from "next/link";
import { RotateCcw, TriangleAlert, Zap } from "lucide-react";
import { SiDiscord, SiGmail, SiWhatsapp } from "@icons-pack/react-simple-icons";
import { buttonVariants } from "@/components/shadcnui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";

const support = [
  { label: "Discord", href: "https://discord.gg/Gy25h8aGX3", Icon: SiDiscord },
  {
    label: "WhatsApp",
    href: "https://wa.me/919830175297?text=Hi",
    Icon: SiWhatsapp,
  },
  { label: "Gmail", href: "mailto:support@fluxgate.app", Icon: SiGmail },
];

const ErrorPage = ({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-xl place-items-center px-6 py-24">
      <Card className="w-full items-center p-8 text-center">
        <span className="bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full">
          <TriangleAlert className="size-6" />
        </span>
        <CardHeader className="w-full items-center">
          <span className="flex items-center gap-2">
            <Zap className="size-4" />
            Fluxgate
          </span>
          <CardTitle className="text-3xl">Something went wrong</CardTitle>
          <CardDescription>
            The page hit an error. Try again or reach support on any channel.
          </CardDescription>
        </CardHeader>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className={buttonVariants({ variant: "default" })}>
            <RotateCcw />
            Try again
          </button>
          <Link
            href="/"
            className={buttonVariants({ variant: "secondary" })}>
            Back home
          </Link>
        </div>
        <div className="flex justify-center gap-2 pt-2">
          {support.map((item) => (
            <a
              key={item.label}
              href={item.href}
              aria-label={`Contact support on ${item.label}`}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "ghost", size: "icon" })}>
              <item.Icon className="size-4" />
            </a>
          ))}
        </div>
      </Card>
    </main>
  );
};

export default ErrorPage;
