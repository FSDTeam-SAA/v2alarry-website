type RegisterUserInput = {
  email: string;
  fullName: string;
  password: string;
};

export async function registerUser({
  email,
  fullName,
  password,
}: RegisterUserInput): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) throw new Error("Authentication service is not configured");

  const response = await fetch(`${baseUrl}/auth/register`, {
    body: JSON.stringify({
      email,
      full_name: fullName,
      password,
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
