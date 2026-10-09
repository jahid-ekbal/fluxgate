import Link from "next/link";
import { ArrowRight, LayoutGrid, Lock, ShieldCheck, Users } from "lucide-react";
import { Metadata } from "next";
import { Badge } from "@/components/shadcnui/badge";
import { buttonVariants } from "@/components/shadcnui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { Separator } from "@/components/shadcnui/separator";

export const metadata: Metadata = {
  title: "Fluxgate",
  description: "Fluxgate, the storefront gateway with secure role based access",
};

const features = [
  {
    icon: Lock,
    title: "Secure sign in",
    description:
      "Email plus password with hashed credentials, Google and Discord OAuth, and encrypted tokens.",
  },
  {
    icon: Users,
    title: "Role dashboards",
    description:
      "Shoppers land on browse while admins land on a dashboard with user management.",
  },
  {
    icon: ShieldCheck,
    title: "Guarded routes",
    description:
      "Every private page checks the session on the server, so roles can never be faked.",
  },
];

const steps = [
  {
    title: "Create your account",
    description: "Sign up with email or continue with Google or Discord.",
  },
  {
    title: "Browse the catalog",
    description: "Signed in shoppers land straight on the browse experience.",
  },
  {
    title: "Admins manage users",
    description: "Admins land on the dashboard with roles and stats.",
  },
];

const stats = [
  { value: "3", label: "Login methods" },
  { value: "2", label: "Roles, user and admin" },
  { value: "7d", label: "Secure sessions" },
];

const page = () => {
  return (
    <main className="flex w-full flex-col gap-20 px-6 pt-24 pb-32">
      <section className="grid items-center gap-12 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-6">
          <Badge variant="secondary">Fluxgate storefront</Badge>
          <h1 className="text-5xl font-semibold tracking-tight">
            The gateway to your store
          </h1>
          <p className="text-muted-foreground text-lg">
            Fluxgate pairs a clean storefront with secure role based access, so
            shoppers browse and admins manage from one place.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/sign-up"
              className={buttonVariants({ variant: "default", size: "lg" })}>
              Get started
              <ArrowRight />
            </Link>
            <Link
              href="/browse"
              className={buttonVariants({ variant: "secondary", size: "lg" })}>
              <LayoutGrid />
              Browse
            </Link>
          </div>
        </div>
        <Card aria-label="Fluxgate preview">
          <CardHeader>
            <CardTitle>Today at Fluxgate</CardTitle>
            <CardDescription>Live snapshot of the store</CardDescription>
          </CardHeader>
          <div className="flex flex-col gap-3 px-6 pb-6">
            {[
              { label: "Orders", value: "w-3/4" },
              { label: "Visitors", value: "w-1/2" },
              { label: "Members", value: "w-2/3" },
            ].map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs">
                  {row.label}
                </span>
                <div className="bg-muted h-2 rounded-full">
                  <div className={`bg-primary h-2 rounded-full ${row.value}`} />
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <Badge>All systems live</Badge>
            </div>
          </div>
        </Card>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-3xl font-semibold tracking-tight">
          Built for selling
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-md">
                  <feature.icon className="size-5" />
                </span>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-3xl font-semibold tracking-tight">How it works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title}>
              <CardHeader>
                <span className="text-muted-foreground text-sm font-medium">
                  Step {index + 1}
                </span>
                <CardTitle>{step.title}</CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/50 grid gap-6 rounded-2xl p-8 text-center sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-1">
            <span className="text-4xl font-semibold">{stat.value}</span>
            <span className="text-muted-foreground text-sm">{stat.label}</span>
          </div>
        ))}
      </section>

      <section>
        <Card className="items-center p-8 text-center">
          <CardTitle className="text-3xl">Open your Fluxgate today</CardTitle>
          <CardDescription>
            One account for shopping, one dashboard for running the store.
          </CardDescription>
          <Link
            href="/sign-up"
            className={buttonVariants({ variant: "default", size: "lg" })}>
            Create account
            <ArrowRight />
          </Link>
        </Card>
      </section>
    </main>
  );
};

export default page;
