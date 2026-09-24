import {
  consumeLoginSuccessToast,
  recordLoginSuccessToast,
} from "./login-success";

describe("login success toast state", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("consumes a login success toast only once", () => {
    recordLoginSuccessToast();

    expect(consumeLoginSuccessToast()).toBe(true);
    expect(consumeLoginSuccessToast()).toBe(false);
  });

  it("does not consume an expired login success toast", () => {
    sessionStorage.setItem(
      "leadercoach.login-success",
      JSON.stringify({ expiresAt: Date.now() - 1 }),
    );

    expect(consumeLoginSuccessToast()).toBe(false);
  });
});
