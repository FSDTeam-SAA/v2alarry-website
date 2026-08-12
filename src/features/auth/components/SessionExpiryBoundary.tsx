"use client";

import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AUTH_SESSION_EXPIRED_EVENT,
  notifySessionExpired,
  restoreSessionDraft,
} from "@/features/auth/lib/session-expiry";

import { AuthField } from "./AuthFields";

export function SessionExpiryBoundary({ children }: { children: ReactNode }) {
  const { data: session, update } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handledExpiry = useRef(false);

  const openExpiredSession = useCallback(() => {
    if (handledExpiry.current) return;

    handledExpiry.current = true;
    notifySessionExpired();
    setIsOpen(true);
    toast.warning("Your session expired. Please sign in again.");
    void signOut({ redirect: false });
  }, []);

  useEffect(() => {
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, openExpiredSession);
    return () =>
      window.removeEventListener(
        AUTH_SESSION_EXPIRED_EVENT,
        openExpiredSession,
      );
  }, [openExpiredSession]);

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") openExpiredSession();
  }, [openExpiredSession, session?.error]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);
    try {
      const response = await signIn("credentials", {
        callbackUrl: window.location.pathname,
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        redirect: false,
      });

      if (!response?.ok) {
        setError("Invalid email or password.");
        return;
      }

      await update();
      restoreSessionDraft();
      handledExpiry.current = false;
      setError(undefined);
      setIsOpen(false);
      toast.success("You are signed in again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {children}
      <Dialog open={isOpen}>
        <DialogContent
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle>Sign in to continue</DialogTitle>
            <DialogDescription>
              Your session expired. Your current draft will remain here after
              you sign in.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="session-expiry-email">Email</Label>
              <Input
                autoComplete="email"
                id="session-expiry-email"
                name="email"
                required
                type="email"
              />
            </div>
            <AuthField
              autoComplete="current-password"
              id="session-expiry-password"
              label="Password"
              name="password"
              placeholder="Your password"
              type="password"
            />
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
