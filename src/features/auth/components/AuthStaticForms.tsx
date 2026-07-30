import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

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
  return (
    <form className="auth-form">
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
      <Button className="auth-primary-button" type="button">
        Sign In
      </Button>
      <AuthDivider label="Or login with" />
      <Button className="auth-primary-button" type="button">
        <span aria-hidden="true" className="auth-google-mark">
          G
        </span>
        Sign in with Google
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
      <Button className="auth-primary-button" type="button">
        Log in
      </Button>
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
      <Button className="auth-primary-button" type="button">
        Verify
      </Button>
      <p className="auth-footer-copy">
        Didn&apos;t Receive OTP? <button type="button">Resend OTP</button>
      </p>
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
      <Button className="auth-primary-button" type="button">
        Continue
      </Button>
    </form>
  );
}
