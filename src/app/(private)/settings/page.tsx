import { redirect } from "next/navigation";
import SettingsForm from "@/components/Settings/SettingsForm";
import { getSessionUser } from "@/server/marketplace";

export const metadata = { title: "Settings" };

const SettingsPage = async () => {
  const me = await getSessionUser();
  if (!me) {
    redirect("/sign-in");
  }
  return (
    <main className="flex min-h-dvh w-full flex-col gap-6 px-6 pt-20 pb-32">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Currency and payment preferences apply across the store
        </p>
      </div>
      <SettingsForm
        initial={{ currency: me.currency, paymentMethod: me.paymentMethod }}
      />
    </main>
  );
};

export default SettingsPage;
