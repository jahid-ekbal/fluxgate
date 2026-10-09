import Link from "next/link";
import { Compass, House, Zap } from "lucide-react";
import { buttonVariants } from "@/components/shadcnui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";

const NotFound = () => {
  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-xl place-items-center px-6 py-24">
      <Card className="w-full items-center p-8 text-center">
        <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
          <Compass className="size-6" />
        </span>
        <CardHeader className="w-full items-center">
          <span className="flex items-center gap-2">
            <Zap className="size-4" />
            Fluxgate
          </span>
          <CardTitle className="text-3xl">Page not found</CardTitle>
          <CardDescription>
            This address does not exist. Browse the catalog or head home.
          </CardDescription>
        </CardHeader>
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            href="/browse"
            className={buttonVariants({ variant: "default" })}>
            Browse products
          </Link>
          <Link
            href="/"
            className={buttonVariants({ variant: "secondary" })}>
            <House />
            Home
          </Link>
        </div>
      </Card>
    </main>
  );
};

export default NotFound;
