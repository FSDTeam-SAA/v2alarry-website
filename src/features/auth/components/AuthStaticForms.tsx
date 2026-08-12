"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { registerUser } from "@/features/auth/api/register.api";

import { AuthDivider } from "./LoginForm";
import { AuthField } from "./AuthFields";

function FooterLink({ children, href }: { children: string; href: string }) {
  return (
    <p className="auth-footer-copy">
      {children} <Link href={href}>Sign In</Link>
    </p>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [googleError, setGoogleError] = useState<string>();
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setIsSubmitting(true);
    try {
      await registerUser({ email, fullName, password });
      toast.success("Account created. You can log in now.");
      router.push("/login");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create your account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setGoogleError(undefined);
    setIsGoogleSubmitting(true);

    const response = await signIn("google", {
      callbackUrl: "/",
      redirect: true,
    });
    if (response?.error) {
      setGoogleError("Unable to start Google sign-in. Please try again.");
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h1>Create your account</h1>
      <div className="auth-fields">
        <AuthField
          id="name"
          label="Name"
          name="name"
          placeholder="Your full name"
        />
        <AuthField
          id="signup-email"
          label="Email"
          name="email"
          placeholder="Your email address"
          type="email"
        />
        <AuthField
          autoComplete="new-password"
          id="signup-password"
          label="Password"
          name="password"
          placeholder="Your password"
          type="password"
        />
      </div>
      <label className="auth-checkbox-row" htmlFor="terms">
        <Checkbox id="terms" name="terms" required />
        <span>
          Accept the <Link href="/terms">Terms and Conditions</Link>
        </span>
      </label>
      <Button
        className="auth-primary-button"
        disabled={isSubmitting || isGoogleSubmitting}
        type="submit"
      >
        {isSubmitting ? "Creating account…" : "Create account"}
      </Button>
      <AuthDivider label="Or login with" />
      {googleError ? (
        <p className="auth-error" role="alert">
          {googleError}
        </p>
      ) : null}
      <Button
        className="auth-primary-button"
        disabled={isSubmitting || isGoogleSubmitting}
        onClick={handleGoogleSignIn}
        type="button"
      >
        <span aria-hidden="true" className="auth-google-mark">
          G
        </span>
        {isGoogleSubmitting ? "Connecting to Google…" : "Sign in with Google"}
      </Button>
      <FooterLink href="/login">Already have an account?</FooterLink>
    </form>
  );
}

export function ForgotPasswordForm() {
  return (
    <form className="auth-form auth-form-compact">
      <h1>Forgot Password</h1>
      <AuthField
        id="recovery-email"
        label="Email"
        name="email"
        placeholder="Your email address"
        type="email"
      />
      <p className="auth-footer-copy" role="status">
        Password recovery is not available yet.
      </p>
      <Link className="auth-primary-button" href="/login">
        Return to login
      </Link>
      <FooterLink href="/signup">Don&apos;t have an account?</FooterLink>
    </form>
  );
}

export function OtpForm() {
  return (
    <form className="auth-form auth-form-compact">
      <h1>Enter OTP</h1>
      <div className="auth-otp-fields" aria-label="One-time password">
        {["4", "2", "6", "", "", ""].map((value, index) => (
          <input
            aria-label={`OTP digit ${index + 1}`}
            defaultValue={value}
            inputMode="numeric"
            key={index}
            maxLength={1}
          />
        ))}
      </div>
      <p className="auth-footer-copy" role="status">
        One-time-password verification is not available yet.
      </p>
      <Link className="auth-primary-button" href="/login">
        Return to login
      </Link>
    </form>
  );
}

export function ResetPasswordForm() {
  return (
    <form className="auth-form auth-form-compact">
      <h1>New Password</h1>
      <div className="auth-fields">
        <AuthField
          autoComplete="new-password"
          id="new-password"
          label="Create a password"
          name="password"
          placeholder="••••••••"
          type="password"
        />
        <AuthField
          autoComplete="new-password"
          id="confirm-password"
          label="Confirm Password"
          name="confirmPassword"
          placeholder="••••••••"
          type="password"
        />
      </div>
      <p className="auth-footer-copy" role="status">
        Password reset is not available yet.
      </p>
      <Link className="auth-primary-button" href="/login">
        Return to login
      </Link>
    </form>
  );
}
