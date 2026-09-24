import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import {
  requestPasswordReset,
  resetPassword,
  verifyResetOtp,
} from "@/features/auth/api/password-recovery.api";

import {
  ForgotPasswordForm,
  OtpForm,
  ResetPasswordForm,
} from "./PasswordRecoveryForms";

const replace = jest.fn();
const push = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
}));

jest.mock("@/features/auth/api/password-recovery.api", () => ({
  requestPasswordReset: jest.fn(),
  resetPassword: jest.fn(),
  verifyResetOtp: jest.fn(),
}));

const mockRequestPasswordReset = jest.mocked(requestPasswordReset);
const mockResetPassword = jest.mocked(resetPassword);
const mockVerifyResetOtp = jest.mocked(verifyResetOtp);

describe("password recovery forms", () => {
  beforeEach(() => {
    push.mockReset();
    replace.mockReset();
    mockRequestPasswordReset.mockReset();
    mockResetPassword.mockReset();
    mockVerifyResetOtp.mockReset();
    sessionStorage.clear();
  });

  it("requests a recovery code and advances to OTP verification", async () => {
    mockRequestPasswordReset.mockResolvedValue();
    render(<ForgotPasswordForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "member@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send code" }));

    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith(
        "member@example.com",
      );
      expect(push).toHaveBeenCalledWith("/verify-otp");
    });
  });

  it("accepts a pasted OTP and advances after verification", async () => {
    sessionStorage.setItem(
      "leadercoach.password-recovery",
      JSON.stringify({ email: "member@example.com", resendAvailableAt: 0 }),
    );
    mockVerifyResetOtp.mockResolvedValue();
    render(<OtpForm />);

    const firstInput = await screen.findByLabelText("OTP digit 1");
    fireEvent.paste(firstInput, { clipboardData: { getData: () => "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Verify code" }));

    await waitFor(() => {
      expect(mockVerifyResetOtp).toHaveBeenCalledWith(
        "member@example.com",
        "123456",
      );
      expect(push).toHaveBeenCalledWith("/reset-password");
    });
  });

  it("resets a verified password and clears recovery state", async () => {
    sessionStorage.setItem(
      "leadercoach.password-recovery",
      JSON.stringify({
        email: "member@example.com",
        code: "123456",
        resendAvailableAt: 0,
      }),
    );
    mockResetPassword.mockResolvedValue();
    render(<ResetPasswordForm />);

    await screen.findByLabelText("Create a password");
    fireEvent.change(screen.getByLabelText("Create a password"), {
      target: { value: "new-password" },
    });
    fireEvent.change(screen.getByLabelText("Confirm password"), {
      target: { value: "new-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Reset password" }));

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith(
        "member@example.com",
        "123456",
        "new-password",
      );
      expect(replace).toHaveBeenCalledWith("/login");
    });
    expect(sessionStorage.getItem("leadercoach.password-recovery")).toBeNull();
  });
});
