import { Zap } from "lucide-react";
import { Spinner } from "@/components/shadcnui/spinner";

const Loading = () => {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="flex flex-col items-center gap-4">
        <span className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-md">
          <Zap className="size-6" />
        </span>
        <Spinner className="size-8" />
        <p className="text-muted-foreground text-sm">Loading Fluxgate</p>
      </div>
    </main>
  );
};

export default Loading;
