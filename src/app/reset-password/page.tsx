import { AuthShell } from "@/features/auth/components/AuthShell";
import { ResetPasswordForm } from "@/features/auth/components/PasswordRecoveryForms";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      prompt="Your future leadership awaits."
      statement="Keep your account secure."
      visualPosition="start"
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
