"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = type === "password";

  return (
    <div className="auth-field">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          autoComplete={autoComplete}
          className={isPasswordField ? "pr-11" : undefined}
          id={id}
          name={name}
          placeholder={placeholder}
          required
          type={isPasswordField && isPasswordVisible ? "text" : type}
        />
        {isPasswordField ? (
          <button
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            type="button"
          >
            {isPasswordVisible ? (
              <EyeOff aria-hidden size={18} />
            ) : (
              <Eye aria-hidden size={18} />
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}
