import { AuthShell } from "@/features/auth/components/AuthShell";
import { SignUpForm } from "@/features/auth/components/AuthStaticForms";

export default function SignUpPage() {
  return (
    <AuthShell
      prompt="Describe your leadership challenge..."
      statement="Lead with clarity and confidence"
      visualPosition="start"
    >
      <SignUpForm />
    </AuthShell>
  );
}
