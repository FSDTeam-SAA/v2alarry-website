const PASSWORD_RECOVERY_STORAGE_KEY = "leadercoach.password-recovery";
const OTP_LENGTH = 6;
const RESEND_COOLDOWN_MS = 60_000;

export type PasswordRecoveryState = {
  code?: string;
  email: string;
  resendAvailableAt: number;
};

function isPasswordRecoveryState(
  value: unknown,
): value is PasswordRecoveryState {
  if (!value || typeof value !== "object") return false;
  const state = value as Record<string, unknown>;
  return (
    typeof state.email === "string" &&
    typeof state.resendAvailableAt === "number" &&
    (state.code === undefined ||
      (typeof state.code === "string" &&
        new RegExp(`^\\d{${OTP_LENGTH}}$`).test(state.code)))
  );
}

export function getPasswordRecoveryStateSnapshot(): string | null {
  try {
    return window.sessionStorage.getItem(PASSWORD_RECOVERY_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getPasswordRecoveryState(): PasswordRecoveryState | null {
  const rawState = getPasswordRecoveryStateSnapshot();
  if (!rawState) return null;

  try {
    const state: unknown = JSON.parse(rawState);
    return isPasswordRecoveryState(state) ? state : null;
  } catch {
    return null;
  }
}

export function saveRecoveryEmail(email: string): PasswordRecoveryState {
  const state = {
    email,
    resendAvailableAt: Date.now() + RESEND_COOLDOWN_MS,
  };
  window.sessionStorage.setItem(
    PASSWORD_RECOVERY_STORAGE_KEY,
    JSON.stringify(state),
  );
  return state;
}

export function saveVerifiedRecoveryCode(
  code: string,
): PasswordRecoveryState | null {
  const state = getPasswordRecoveryState();
  if (!state) return null;

  const nextState = { ...state, code };
  window.sessionStorage.setItem(
    PASSWORD_RECOVERY_STORAGE_KEY,
    JSON.stringify(nextState),
  );
  return nextState;
}

export function setResendAvailableAt(
  resendAvailableAt: number,
): PasswordRecoveryState | null {
  const state = getPasswordRecoveryState();
  if (!state) return null;

  const nextState = { ...state, resendAvailableAt };
  window.sessionStorage.setItem(
    PASSWORD_RECOVERY_STORAGE_KEY,
    JSON.stringify(nextState),
  );
  return nextState;
}

export function clearPasswordRecoveryState(): void {
  window.sessionStorage.removeItem(PASSWORD_RECOVERY_STORAGE_KEY);
}
