const LOGIN_SUCCESS_STORAGE_KEY = "leadercoach.login-success";
const LOGIN_SUCCESS_TTL_MS = 60_000;

export function recordLoginSuccessToast(): void {
  window.sessionStorage.setItem(
    LOGIN_SUCCESS_STORAGE_KEY,
    JSON.stringify({ expiresAt: Date.now() + LOGIN_SUCCESS_TTL_MS }),
  );
}

export function clearLoginSuccessToast(): void {
  window.sessionStorage.removeItem(LOGIN_SUCCESS_STORAGE_KEY);
}

export function consumeLoginSuccessToast(): boolean {
  try {
    const rawMarker = window.sessionStorage.getItem(LOGIN_SUCCESS_STORAGE_KEY);
    window.sessionStorage.removeItem(LOGIN_SUCCESS_STORAGE_KEY);
    if (!rawMarker) return false;

    const marker: unknown = JSON.parse(rawMarker);
    return (
      typeof marker === "object" &&
      marker !== null &&
      typeof (marker as { expiresAt?: unknown }).expiresAt === "number" &&
      (marker as { expiresAt: number }).expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

export function navigateToAuthenticatedDestination(path: string): void {
  window.location.assign(path);
}
