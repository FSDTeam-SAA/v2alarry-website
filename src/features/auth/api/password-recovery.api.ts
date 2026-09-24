const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "/api/v1").replace(
  /\/+$/,
  "",
);

async function postPasswordRecovery(
  path: string,
  body: Record<string, string>,
): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/auth/${path}`, {
    body: JSON.stringify(body),
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
      : "Unable to continue password recovery. Please try again.";
  throw new Error(detail);
}

export function requestPasswordReset(email: string): Promise<void> {
  return postPasswordRecovery("forgot-password", { email });
}

export function verifyResetOtp(email: string, code: string): Promise<void> {
  return postPasswordRecovery("verify-reset-otp", { code, email });
}

export function resetPassword(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  return postPasswordRecovery("reset-password", {
    code,
    email,
    new_password: newPassword,
  });
}
