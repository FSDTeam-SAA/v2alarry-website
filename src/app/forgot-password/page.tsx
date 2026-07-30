import { AuthShell } from "@/features/auth/components/AuthShell";
import { ForgotPasswordForm } from "@/features/auth/components/AuthStaticForms";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      prompt="Leadership growth never stops."
      statement="Your leadership journey is waiting."
      visualPosition="start"
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
