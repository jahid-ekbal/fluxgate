import LogoutButton from "@/components/LogoutButton";
import { auth } from "@/lib/auth";
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Private dashboard",
};

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <section className="animate-in fade-in zoom-in w-full max-w-md space-y-4 text-center duration-300">
        <h1 className="text-3xl font-semibold">Welcome {session.user.name}</h1>
        <p className="text-muted-foreground">{session.user.email}</p>
        <LogoutButton />
      </section>
    </main>
  );
};

export default DashboardPage;
