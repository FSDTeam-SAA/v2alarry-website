type RegisterUserInput = {
  email: string;
  fullName: string;
  password: string;
};

import { CURRENT_AGREEMENT_VERSION } from "@/features/terms/agreement";

export async function registerUser({
  email,
  fullName,
  password,
}: RegisterUserInput): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

  const response = await fetch(`${baseUrl}/auth/register`, {
    body: JSON.stringify({
      email,
      full_name: fullName,
      password,
      agreement_version: CURRENT_AGREEMENT_VERSION,
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (response.ok) return;

  const payload: unknown = await response.json().catch(() => null);
  const detail =
    payload &&
    typeof payload === "object" &&
    typeof (payload as { detail?: unknown }).detail === "string"
      ? (payload as { detail: string }).detail
      : "Unable to create your account. Please try again.";

  throw new Error(detail);
}
