export const AUTH_SESSION_EXPIRED_EVENT = "leadercoach:session-expired";

const DRAFT_STORAGE_KEY = "leadercoach.session-expiry-draft";

type SessionDraft = {
  pathname: string;
  values: Record<string, string>;
};

function isDraftField(
  field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
): field is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  if (!field.name || field instanceof HTMLInputElement) {
    return Boolean(
      field.name &&
      !["checkbox", "file", "hidden", "password", "radio", "submit"].includes(
        field.type,
      ),
    );
  }

  return Boolean(field.name);
}

export function getSessionDraft(): SessionDraft | null {
  const serializedDraft = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
  if (!serializedDraft) return null;

  try {
    const draft: unknown = JSON.parse(serializedDraft);
    if (
      !draft ||
      typeof draft !== "object" ||
      typeof (draft as SessionDraft).pathname !== "string" ||
      typeof (draft as SessionDraft).values !== "object"
    ) {
      return null;
    }

    return draft as SessionDraft;
  } catch {
    return null;
  }
}

function captureSessionDraft(): void {
  const values = Object.fromEntries(
    Array.from(
      document.querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >("input, textarea, select"),
    )
      .filter(isDraftField)
      .map((field) => [field.name, field.value])
      .filter(([, value]) => value.length > 0),
  );

  if (Object.keys(values).length === 0) return;

  window.sessionStorage.setItem(
    DRAFT_STORAGE_KEY,
    JSON.stringify({ pathname: window.location.pathname, values }),
  );
}

export function notifySessionExpired(): void {
  captureSessionDraft();
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
}

export function restoreSessionDraft(): boolean {
  const draft = getSessionDraft();
  window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);

  if (!draft || draft.pathname !== window.location.pathname) return false;

  for (const [name, value] of Object.entries(draft.values)) {
    const field = Array.from(
      document.querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >("input, textarea, select"),
    ).find((candidate) => candidate.name === name);

    if (!field || !isDraftField(field)) continue;

    field.value = value;
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
  }

  return true;
}

export function clearSessionDraft(): void {
  window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
}
