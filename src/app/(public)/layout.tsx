import { LayoutProps } from "@/lib/types";

const PublicLayout = ({ children }: LayoutProps) => {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="animate-in fade-in zoom-in w-full max-w-md duration-300">
        {children}
      </div>
    </main>
  );
};

export default PublicLayout;
