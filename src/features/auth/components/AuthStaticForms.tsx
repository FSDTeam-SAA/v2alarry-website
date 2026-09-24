"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { registerUser } from "@/features/auth/api/register.api";
import { TermsAgreementContent } from "@/features/terms/components/TermsAgreementContent";

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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!termsAccepted) {
      toast.error(
        "Please accept the Terms and Conditions to create an account.",
      );
      return;
    }

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
    if (!termsAccepted) {
      toast.error("Please accept the agreement before continuing with Google.");
      return;
    }
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
    <>
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
        <div className="auth-checkbox-row">
          <Checkbox
            checked={termsAccepted}
            id="terms"
            name="terms"
            onCheckedChange={(checked) => setTermsAccepted(Boolean(checked))}
            required
          />
          <label htmlFor="terms" className="cursor-pointer select-none">
            Accept the{" "}
            <button
              className="font-medium underline hover:text-[#1b1818] cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                setIsTermsOpen(true);
              }}
              type="button"
            >
              Terms and Conditions
            </button>
          </label>
        </div>
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

      {/* Terms & Conditions Dialog Modal */}
      <Dialog onOpenChange={setIsTermsOpen} open={isTermsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-[#FDFCFB]">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#E5E0DA] shrink-0 text-left">
            <DialogTitle className="text-xl font-bold text-[#1B1818]">
              LeaderCoach Pilot Coaching & Privacy Agreement
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6E6663] mt-1">
              Please review the pilot program terms, privacy expectations, and
              supervision boundaries.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <TermsAgreementContent />
          </div>

          <DialogFooter className="px-6 py-4 border-t border-[#E5E0DA] bg-stone-50 flex flex-row items-center justify-between gap-3 shrink-0">
            <Link
              className="text-xs text-[#6E6663] hover:text-[#1B1818] underline"
              href="/terms"
              onClick={() => setIsTermsOpen(false)}
              target="_blank"
            >
              Open in dedicated page ↗
            </Link>
            <div className="flex items-center gap-2">
              <DialogClose asChild>
                <Button size="sm" variant="outline">
                  Close
                </Button>
              </DialogClose>
              <Button
                className="bg-[#252222] hover:bg-[#3D3737] text-white"
                onClick={() => {
                  setTermsAccepted(true);
                  setIsTermsOpen(false);
                  toast.success("Terms and Conditions accepted.");
                }}
                size="sm"
                type="button"
              >
                I Agree & Accept
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
