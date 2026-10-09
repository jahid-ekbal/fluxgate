"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { profileSchema, type ProfileInput } from "@/lib/zodSchema";
import { Alert, AlertDescription } from "@/components/shadcnui/alert";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcnui/avatar";
import { Button } from "@/components/shadcnui/button";
import { Field, FieldError, FieldLabel } from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";

const ProfileForm = ({
  initial,
}: {
  initial: { name: string; image: string };
}) => {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: initial.name, image: initial.image },
    mode: "all",
  });
  const [preview, setPreview] = useState(initial.image);
  const [previewName, setPreviewName] = useState(initial.name);
  const fallback = (previewName === "" ? "?" : previewName)
    .slice(0, 1)
    .toUpperCase();

  const onSubmit = async (values: ProfileInput) => {
    setMessage(null);
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!response.ok) {
      setMessage("Saving failed, try again");
      return;
    }
    setMessage("Profile saved");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage
            src={preview.trim() === "" ? undefined : preview.trim()}
            alt="Avatar preview"
          />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        <p className="text-muted-foreground text-xs">
          Paste any online image URL, no upload needed
        </p>
      </div>
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="profile-name">Name</FieldLabel>
            <Input
              {...field}
              id="profile-name"
              autoComplete="name"
              aria-invalid={fieldState.invalid}
              onChange={(event) => {
                field.onChange(event);
                setPreviewName(event.target.value);
              }}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="image"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="profile-image">Avatar image URL</FieldLabel>
            <Input
              {...field}
              id="profile-image"
              placeholder="https://example.com/avatar.png"
              inputMode="url"
              autoComplete="off"
              aria-invalid={fieldState.invalid}
              onChange={(event) => {
                field.onChange(event);
                setPreview(event.target.value);
              }}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      {message && (
        <Alert
          variant={message === "Profile saved" ? "default" : "destructive"}>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      <Button
        type="submit"
        disabled={isSubmitting}>
        {isSubmitting ?
          <Loader2 className="animate-spin" />
        : <Save />}
        {isSubmitting ? "Saving" : "Save profile"}
      </Button>
    </form>
  );
};

export default ProfileForm;
