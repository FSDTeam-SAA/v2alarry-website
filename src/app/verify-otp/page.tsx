import { AuthShell } from "@/features/auth/components/AuthShell";
import { OtpForm } from "@/features/auth/components/PasswordRecoveryForms";

export default function VerifyOtpPage() {
  return (
    <AuthShell
      prompt="You're one step away from growth."
      statement="Continue Your Growth"
      visualPosition="end"
    >
      <OtpForm />
    </AuthShell>
  );
}
