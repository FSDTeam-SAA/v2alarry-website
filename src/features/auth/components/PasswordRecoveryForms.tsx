"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  requestPasswordReset,
  resetPassword,
  verifyResetOtp,
} from "@/features/auth/api/password-recovery.api";
import {
  clearPasswordRecoveryState,
  getPasswordRecoveryState,
  getPasswordRecoveryStateSnapshot,
  saveRecoveryEmail,
  saveVerifiedRecoveryCode,
  setResendAvailableAt,
  type PasswordRecoveryState,
} from "@/features/auth/lib/password-recovery";

import { AuthField } from "./AuthFields";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_MS = 60_000;

function subscribeToPasswordRecoveryState() {
  return () => undefined;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Unable to continue password recovery. Please try again.";
}

function RecoveryFooter() {
  return (
    <p className="auth-footer-copy">
      Use Google sign-in from the <Link href="/login">login page</Link> if your
      account uses Google.
    </p>
  );
}

function useRecoveryState(requireCode = false): PasswordRecoveryState | null {
  const { replace } = useRouter();
  const recoveryStateSnapshot = useSyncExternalStore(
    subscribeToPasswordRecoveryState,
    getPasswordRecoveryStateSnapshot,
    () => null,
  );
  const state = useMemo(
    () => (recoveryStateSnapshot ? getPasswordRecoveryState() : null),
    [recoveryStateSnapshot],
  );

  useEffect(() => {
    if (!state || (requireCode && !state.code)) {
      replace(requireCode ? "/verify-otp" : "/forgot-password");
    }
  }, [replace, requireCode, state]);

  return state;
}

export function ForgotPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    setError(undefined);
    setIsSubmitting(true);
    try {
      await requestPasswordReset(email);
      saveRecoveryEmail(email);
      toast.success(
        "If an eligible account uses that email, we sent a six-digit code.",
      );
      router.push("/verify-otp");
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form auth-form-compact" onSubmit={handleSubmit}>
      <h1>Forgot Password</h1>
      <p className="auth-footer-copy">
        Enter your email and we&apos;ll send a code if password recovery is
        available.
      </p>
      <AuthField
        autoComplete="email"
        id="recovery-email"
        label="Email"
        name="email"
        placeholder="Your email address"
        type="email"
      />
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
        {isSubmitting ? "Sending code…" : "Send code"}
      </Button>
      <p className="auth-footer-copy">
        Remembered it? <Link href="/login">Return to login</Link>
      </p>
      <RecoveryFooter />
    </form>
  );
}

export function OtpForm() {
  const router = useRouter();
  const recoveryState = useRecoveryState();
  const [digits, setDigits] = useState<string[]>(() =>
    Array(OTP_LENGTH).fill(""),
  );
  const [error, setError] = useState<string>();
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [now, setNow] = useState(Date.now());
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!recoveryState || recoveryState.resendAvailableAt <= Date.now()) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [recoveryState]);

  function applyCode(value: string) {
    const nextDigits = value.replace(/\D/g, "").slice(0, OTP_LENGTH).split("");
    setDigits([
      ...nextDigits,
      ...Array(OTP_LENGTH - nextDigits.length).fill(""),
    ]);
    inputs.current[Math.min(nextDigits.length, OTP_LENGTH - 1)]?.focus();
  }

  function handleDigitChange(index: number, value: string) {
    const nextValue = value.replace(/\D/g, "");
    if (nextValue.length > 1) {
      applyCode(nextValue);
      return;
    }

    setDigits((currentDigits) => {
      const nextDigits = [...currentDigits];
      nextDigits[index] = nextValue;
      return nextDigits;
    });
    if (nextValue && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    applyCode(event.clipboardData.getData("text"));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!recoveryState) return;
    const code = digits.join("");
    if (code.length !== OTP_LENGTH) {
      setError("Enter the six-digit code from your email.");
      return;
    }

    setError(undefined);
    setIsSubmitting(true);
    try {
      await verifyResetOtp(recoveryState.email, code);
      saveVerifiedRecoveryCode(code);
      toast.success("Code verified. Choose a new password.");
      router.push("/reset-password");
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!recoveryState || recoveryState.resendAvailableAt > now) return;
    setError(undefined);
    setIsResending(true);
    try {
      await requestPasswordReset(recoveryState.email);
      const nextState = setResendAvailableAt(Date.now() + RESEND_COOLDOWN_MS);
      if (nextState) setNow(Date.now());
      setDigits(Array(OTP_LENGTH).fill(""));
      toast.success("If recovery is available, we sent a new code.");
      inputs.current[0]?.focus();
    } catch (resendError) {
      setError(getErrorMessage(resendError));
    } finally {
      setIsResending(false);
    }
  }

  if (!recoveryState) return null;

  const secondsRemaining = Math.max(
    0,
    Math.ceil((recoveryState.resendAvailableAt - now) / 1_000),
  );

  return (
    <form className="auth-form auth-form-compact" onSubmit={handleSubmit}>
      <h1>Enter OTP</h1>
      <p className="auth-footer-copy" id="otp-help">
        Enter the six-digit code sent to {recoveryState.email}.
      </p>
      <div
        className="auth-otp-fields"
        aria-describedby="otp-help"
        aria-label="One-time password"
      >
        {digits.map((value, index) => (
          <input
            aria-label={`OTP digit ${index + 1}`}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            inputMode="numeric"
            key={index}
            maxLength={1}
            onChange={(event) => handleDigitChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            ref={(element) => {
              inputs.current[index] = element;
            }}
            required
            type="text"
            value={value}
          />
        ))}
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
        {isSubmitting ? "Verifying code…" : "Verify code"}
      </Button>
      <Button
        className="auth-secondary-button"
        disabled={isResending || secondsRemaining > 0}
        onClick={handleResend}
        type="button"
      >
        {isResending
          ? "Sending code…"
          : secondsRemaining > 0
            ? `Resend code in ${secondsRemaining}s`
            : "Resend code"}
      </Button>
      <p className="auth-footer-copy">
        <Link href="/forgot-password">Use a different email</Link>
      </p>
      <RecoveryFooter />
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const recoveryState = useRecoveryState(true);
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!recoveryState?.code) return;
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(undefined);
    setIsSubmitting(true);
    try {
      await resetPassword(recoveryState.email, recoveryState.code, password);
      clearPasswordRecoveryState();
      toast.success("Password updated. Sign in with your new password.");
      router.replace("/login");
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!recoveryState) return null;

  return (
    <form className="auth-form auth-form-compact" onSubmit={handleSubmit}>
      <h1>New Password</h1>
      <div className="auth-fields">
        <AuthField
          autoComplete="new-password"
          id="new-password"
          label="Create a password"
          name="password"
          placeholder="At least 8 characters"
          type="password"
        />
        <AuthField
          autoComplete="new-password"
          id="confirm-password"
          label="Confirm password"
          name="confirmPassword"
          placeholder="Repeat your password"
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
        {isSubmitting ? "Updating password…" : "Reset password"}
      </Button>
      <RecoveryFooter />
    </form>
  );
}
