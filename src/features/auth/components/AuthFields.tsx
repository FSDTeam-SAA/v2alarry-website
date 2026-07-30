import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthFieldProps = {
  autoComplete?: string;
  id: string;
  label: string;
  name: string;
  placeholder: string;
  type?: "email" | "password" | "text";
};

export function AuthField({
  autoComplete,
  id,
  label,
  name,
  placeholder,
  type = "text",
}: AuthFieldProps) {
  return (
    <div className="auth-field">
      <Label htmlFor={id}>{label}</Label>
      <Input
        autoComplete={autoComplete}
        id={id}
        name={name}
        placeholder={placeholder}
        required
        type={type}
      />
    </div>
  );
}
