"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Loader2,
  ShoppingBag,
  Store,
  UserPlus,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { signUpSchema, type SignUp } from "@/lib/zodSchema";
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

const SignUpForm = () => {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<SignUp>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", role: "buyer" },
    mode: "all",
  });

  const onSubmit = async (values: SignUp) => {
    setServerError(null);
    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    });
    if (error) {
      setServerError(error.message ?? "Sign up failed");
      return;
    }
    if (values.role === "seller") {
      const claim = await fetch("/api/settings", { method: "POST" });
      if (!claim.ok) {
        setServerError(
          "Account created, seller upgrade failed, contact support",
        );
        router.push("/browse");
        router.refresh();
        return;
      }
      router.push("/seller");
    } else {
      router.push("/browse");
    }
    router.refresh();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Sign up with email or a provider</CardDescription>
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
            name="role"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Join as</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { value: "buyer", label: "Buyer", icon: ShoppingBag },
                      { value: "seller", label: "Seller", icon: Store },
                    ] as const
                  ).map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={
                        field.value === option.value ? "default" : "outline"
                      }
                      aria-pressed={field.value === option.value}
                      onClick={() => field.onChange(option.value)}
                      className="h-auto flex-col gap-1 py-3">
                      <option.icon className="size-5" />
                      {option.label}
                    </Button>
                  ))}
                </div>
              </Field>
            )}
          />
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  autoComplete="name"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
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
                    autoComplete="new-password"
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
            : <UserPlus />}
            {isSubmitting ? "Creating account" : "Sign up"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center gap-1 text-sm">
        <span className="text-muted-foreground">Already have an account?</span>
        <Link
          href="/sign-in"
          className={buttonVariants({ variant: "link", size: "sm" })}>
          Sign in
        </Link>
      </CardFooter>
    </Card>
  );
};

export default SignUpForm;
