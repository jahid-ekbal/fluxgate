"use server";

import { auth } from "@/lib/auth";
import { loginFormSchema, registerFormSchema } from "@/lib/zodSchema";
import { headers } from "next/headers";

export type AuthActionResult = {
  success: boolean;
  error?: string;
};

export const loginAction = async (input: {
  email: string;
  password: string;
}): Promise<AuthActionResult> => {
  const parsed = loginFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid credentials" };
  }

  try {
    await auth.api.signInEmail({
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
      },
    });
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error && error.message ? error.message : "Login failed";
    return { success: false, error: message };
  }
};

export const registerAction = async (input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthActionResult> => {
  const parsed = registerFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid registration details" };
  }

  try {
    await auth.api.signUpEmail({
      body: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      },
    });
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error && error.message ?
        error.message
      : "Registration failed";
    return { success: false, error: message };
  }
};

export const logoutAction = async (): Promise<AuthActionResult> => {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error && error.message ? error.message : "Logout failed";
    return { success: false, error: message };
  }
};
