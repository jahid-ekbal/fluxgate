"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { signInSchema, type SignIn } from "@/lib/zodSchema";
import { Alert, AlertDescription } from "@/components/shadcnui/alert";
import { Button, buttonVariants } from "@/components/shadcnui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcnui/card";
import { Field, FieldError, FieldLabel } from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";
import { Separator } from "@/components/shadcnui/separator";
import SocialButtons from "@/components/Auth/SocialButtons";

const SignInForm = () => {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
    mode: "all",
  });

  const onSubmit = async (values: SignIn) => {
    setServerError(null);
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      rememberMe: values.rememberMe ?? true,
    });
    if (error) {
      setServerError(error.message ?? "Sign in failed");
      return;
    }
    const session = await authClient.getSession();
    const role =
      (session?.data?.user as { role?: string } | undefined)?.role ?? "buyer";
    router.push(
      role === "admin" ? "/admin"
      : role === "seller" ? "/seller"
      : "/browse",
    );
    router.refresh();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Welcome back, enter your credentials</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <SocialButtons />
        <div className="flex items-center gap-2">
          <Separator className="flex-1" />
          <span className="text-muted-foreground text-xs">
            or continue with email
          </span>
          <Separator className="flex-1" />
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-4">
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  autoComplete="email"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <div className="relative">
                  <Input
                    {...field}
                    id={field.name}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute top-1/2 right-1 -translate-y-1/2">
                    {showPassword ?
                      <EyeOff />
                    : <Eye />}
                  </Button>
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}>
            {isSubmitting ?
              <Loader2 className="animate-spin" />
            : <LogIn />}
            {isSubmitting ? "Signing in" : "Sign in"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center gap-1 text-sm">
        <span className="text-muted-foreground">No account yet?</span>
        <Link
          href="/sign-up"
          className={buttonVariants({ variant: "link", size: "sm" })}>
          Sign up
        </Link>
      </CardFooter>
    </Card>
  );
};

export default SignInForm;
