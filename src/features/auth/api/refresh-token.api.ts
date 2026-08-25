// src/features/auth/api/refresh-token.api.ts
type RefreshResponse = {
  access_token: string;
  refresh_token: string;
  access_token_expires_in: number;
};

export async function refreshAccessToken(
  refreshToken: string,
): Promise<RefreshResponse> {
  const baseUrl =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "/api/v1";
  const response = await fetch(`${baseUrl}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Unable to refresh session");
  }

  return response.json() as Promise<RefreshResponse>;
}
