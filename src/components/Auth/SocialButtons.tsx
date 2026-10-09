"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Alert, AlertDescription } from "@/components/shadcnui/alert";
import { Button } from "@/components/shadcnui/button";

const GoogleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="size-4"
    aria-hidden="true">
    <path
      fill="currentColor"
      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
    />
    <path
      fill="currentColor"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
    />
    <path
      fill="currentColor"
      d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
    />
    <path
      fill="currentColor"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
    />
  </svg>
);

const DiscordIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="size-4"
    aria-hidden="true">
    <path
      fill="currentColor"
      d="M20.32 4.37a19.8 19.8 0 0 0-4.93-1.51 13.78 13.78 0 0 0-.64 1.28 18.27 18.27 0 0 0-5.5 0 12.64 12.64 0 0 0-.64-1.28h-.05A19.74 19.74 0 0 0 3.64 4.37 20.15 20.15 0 0 0 .11 18.06a19.9 19.9 0 0 0 6.04 3.03c.49-.66.93-1.37 1.3-2.1a12.9 12.9 0 0 1-2.05-.98c.17-.12.34-.25.5-.38a14.2 14.2 0 0 0 12.2 0c.16.13.33.26.5.38-.65.38-1.34.72-2.05.98.37.73.81 1.44 1.3 2.1a19.84 19.84 0 0 0 6.04-3.03 20.02 20.02 0 0 0-3.57-13.69ZM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42s.95-2.42 2.16-2.42 2.18 1.09 2.16 2.42c0 1.34-.95 2.42-2.16 2.42Zm7.96 0c-1.18 0-2.16-1.08-2.16-2.42s.95-2.42 2.16-2.42 2.18 1.09 2.16 2.42c0 1.34-.95 2.42-2.16 2.42Z"
    />
  </svg>
);

const SocialButtons = () => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"google" | "discord" | null>(null);

  const handleSocial = async (provider: "google" | "discord") => {
    setError(null);
    setPending(provider);
    const { error: signInError } = await authClient.signIn.social({
      provider,
      callbackURL: "/browse",
    });
    if (signInError) {
      setError(signInError.message ?? "Social sign in failed");
      setPending(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={pending !== null}
        onClick={() => handleSocial("google")}>
        <GoogleIcon />
        {pending === "google" ? "Opening Google" : "Continue with Google"}
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={pending !== null}
        onClick={() => handleSocial("discord")}>
        <DiscordIcon />
        {pending === "discord" ? "Opening Discord" : "Continue with Discord"}
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SocialButtons;
