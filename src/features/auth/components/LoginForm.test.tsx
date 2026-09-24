import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { signIn } from "next-auth/react";

import { recordLoginSuccessToast } from "@/features/auth/lib/login-success";

import { LoginForm } from "./LoginForm";

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

jest.mock("@/features/auth/lib/login-success", () => ({
  navigateToAuthenticatedDestination: jest.fn(),
  recordLoginSuccessToast: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockSignIn = jest.mocked(signIn);
const mockRecordLoginSuccessToast = jest.mocked(recordLoginSuccessToast);

describe("LoginForm", () => {
  beforeEach(() => {
    mockSignIn.mockReset();
    mockRecordLoginSuccessToast.mockReset();
  });

  it("submits email and password through the credentials provider", async () => {
    mockSignIn.mockResolvedValue({
      error: null,
      ok: true,
      status: 200,
      url: null,
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "member@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        callbackUrl: "/",
        email: "member@example.com",
        password: "password123",
        redirect: false,
      });
    });
  });

  it("starts the Google OAuth flow with the current callback URL", async () => {
    mockSignIn.mockResolvedValue(undefined);

    render(<LoginForm />);

    fireEvent.click(
      screen.getByRole("button", { name: "Sign in with Google" }),
    );

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("google", {
        callbackUrl: "/",
        redirect: true,
      });
      expect(mockRecordLoginSuccessToast).toHaveBeenCalledTimes(1);
    });
  });

  it("records a one-time toast before a successful credentials handoff", async () => {
    mockSignIn.mockResolvedValue({
      error: null,
      ok: true,
      status: 200,
      url: null,
    });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "member@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(mockRecordLoginSuccessToast).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("status")).toHaveTextContent("Welcome back");
    });
  });

  it("toggles password visibility without clearing the entered password", () => {
    render(<LoginForm />);
    const password = screen.getByLabelText("Password");

    fireEvent.change(password, { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));

    expect(password).toHaveAttribute("type", "text");
    expect(password).toHaveValue("password123");
    expect(
      screen.getByRole("button", { name: "Hide password" }),
    ).toBeInTheDocument();
  });
});
