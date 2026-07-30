"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";

import { AuthField } from "./AuthFields";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const callbackUrl = searchParams.get("callbackUrl") ?? "/";

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
      router.push(callbackUrl);
      return;
    }

    setError("Invalid email or password.");
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h1>Welcome Back</h1>
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
      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        className="auth-primary-button"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Logging in…" : "Log in"}
      </Button>
      <AuthDivider label="Or login with" />
      <Button className="auth-primary-button" type="button">
        <span aria-hidden="true" className="auth-google-mark">
          G
        </span>
        Sign in with Google
      </Button>
      <p className="auth-footer-copy">
        Don&apos;t have an account? <Link href="/signup">Sign In</Link>
      </p>
    </form>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="auth-divider" aria-hidden="true">
      <span />
      <p>{label}</p>
      <span />
    </div>
  );
}
