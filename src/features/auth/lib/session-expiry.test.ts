import {
  AUTH_SESSION_EXPIRED_EVENT,
  getSessionDraft,
  notifySessionExpired,
  restoreSessionDraft,
} from "./session-expiry";

describe("session expiry draft recovery", () => {
  beforeEach(() => {
    sessionStorage.clear();
    document.body.innerHTML = "";
  });

  it("captures non-password fields and announces an expired session", () => {
    document.body.innerHTML = `
      <input name="title" value="A leadership conversation" />
      <textarea name="message">Keep this draft</textarea>
      <input name="password" type="password" value="do-not-save" />
    `;
    const listener = jest.fn();
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, listener);

    notifySessionExpired();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(getSessionDraft()).toEqual({
      pathname: window.location.pathname,
      values: {
        message: "Keep this draft",
        title: "A leadership conversation",
      },
    });
  });

  it("restores a saved draft through input events", () => {
    const inputListener = jest.fn();
    document.body.innerHTML = '<textarea name="message"></textarea>';
    const textarea = document.querySelector("textarea");
    textarea?.addEventListener("input", inputListener);

    sessionStorage.setItem(
      "leadercoach.session-expiry-draft",
      JSON.stringify({
        pathname: window.location.pathname,
        values: { message: "Restored message" },
      }),
    );

    expect(restoreSessionDraft()).toBe(true);
    expect(textarea?.value).toBe("Restored message");
    expect(inputListener).toHaveBeenCalledTimes(1);
    expect(getSessionDraft()).toBeNull();
  });
});
