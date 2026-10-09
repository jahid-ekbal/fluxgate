"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { AnimatedThemeToggler } from "@/components/shadcnui/animated-theme-toggler";

const subscribe = () => () => {};

const ThemeToggler = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <span
        className="block size-6"
        aria-hidden="true"
      />
    );
  }

  return (
    <AnimatedThemeToggler
      variant="circle"
      duration={400}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      onThemeChange={setTheme}
      aria-label="Toggle theme"
      className="flex size-10 items-center justify-center rounded-full"
    />
  );
};

export default ThemeToggler;
