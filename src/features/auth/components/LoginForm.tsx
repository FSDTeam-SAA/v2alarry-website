"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { type FormEvent, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  clearLoginSuccessToast,
  navigateToAuthenticatedDestination,
  recordLoginSuccessToast,
} from "@/features/auth/lib/login-success";

import { AuthField } from "./AuthFields";
import Image from "next/image";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  function getCallbackUrl() {
    const callbackUrl = searchParams.get("callbackUrl");
    return callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const callbackUrl = getCallbackUrl();

    setError(undefined);
    setIsSubmitting(true);

    const response = await signIn("credentials", {
      callbackUrl,
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (response?.ok) {
      recordLoginSuccessToast();
      setIsSuccess(true);
      window.setTimeout(
        () => navigateToAuthenticatedDestination(callbackUrl),
        200,
      );
      return;
    }

    const message = "Invalid email or password.";
    setError(message);
  }

  async function handleGoogleSignIn() {
    const callbackUrl = getCallbackUrl();

    setError(undefined);
    setIsGoogleSubmitting(true);
    recordLoginSuccessToast();

    const response = await signIn("google", { callbackUrl, redirect: true });
    if (response?.error) {
      clearLoginSuccessToast();
      const message = "Unable to start Google sign-in. Please try again.";
      setError(message);
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <form
      aria-busy={isSuccess || isSubmitting || isGoogleSubmitting}
      className="auth-form auth-login-form"
      data-auth-state={isSuccess ? "success" : "idle"}
      onSubmit={handleSubmit}
    >
      <div aria-hidden={isSuccess} className="auth-login-content">
        <h1 className="md:text-5xl">Welcome Back</h1>
        <div className="auth-fields">
          <AuthField
            autoComplete="email"
            id="email"
            label="Email"
            name="email"
            placeholder="Your email address"
            type="email"
          />
          <AuthField
            autoComplete="current-password"
            id="password"
            label="Password"
            name="password"
            placeholder="Your password"
            type="password"
          />
        </div>
        <p className="auth-forgot-password py-5 hover:underline">
          <Link href="/forgot-password">Forgot password?</Link>
        </p>
        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
        <Button
          className="auth-primary-button"
          disabled={isSubmitting || isGoogleSubmitting || isSuccess}
          type="submit"
        >
          {isSubmitting ? "Logging in…" : "Log in"}
        </Button>
        <AuthDivider label="Or login with" />
        <Button
          className="bg-primary/10 text-accent-foreground hover:bg-accent/80 dark:bg-accent/30 dark:text-accent-foreground/80 dark:hover:bg-accent/50 border dark:border-input flex *:items-center justify-center gap-2 w-full"
          disabled={isSubmitting || isGoogleSubmitting || isSuccess}
          onClick={handleGoogleSignIn}
          type="button"
        >
          <span aria-hidden="true" className="auth-google-mark">
            <Image
              src="/images/google.jpg"
              alt="Login with Google"
              width={18}
              height={18}
              className="auth-google-mark"
            />
          </span>
          {isGoogleSubmitting ? "Connecting to Google…" : "Sign in with Google"}
        </Button>
        <p className="auth-footer-copy mt-4">
          Don&apos;t have an account? <Link href="/signup">Sign up</Link>
        </p>
      </div>
      <div className="auth-login-success" role="status">
        <CheckCircle2 aria-hidden size={28} />
        <span>Welcome back</span>
      </div>
    </form>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="auth-divider py-4" aria-hidden="true">
      <span />
      <p>{label}</p>
      <span />
    </div>
  );
}
