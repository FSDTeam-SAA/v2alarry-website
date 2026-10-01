import type { NextRequest } from "next/server";
import { getToken, type JWT } from "next-auth/jwt";

import { proxy } from "./proxy";

jest.mock("next-auth/jwt", () => ({ getToken: jest.fn() }));
jest.mock("next/server", () => ({
  NextResponse: {
    redirect: (url: URL) => ({
      headers: new Headers({ location: url.toString() }),
    }),
    next: () => ({ headers: new Headers({ "x-middleware-next": "1" }) }),
  },
}));

const request = (path: string) => {
  const url = `https://lab.v2a.com${path}`;
  return { nextUrl: new URL(url), url } as unknown as NextRequest;
};

const sessionToken = (
  role: "admin" | "user",
  acceptedAgreementVersion: string | null,
): JWT => ({
  id: "7",
  name: "Test User",
  email: "user@example.com",
  image: "",
  role,
  accessToken: "access-token",
  refreshToken: "refresh-token",
  accessTokenExpires: Date.now() + 60_000,
  acceptedAgreementVersion,
});

describe("proxy authorization", () => {
  it("routes unauthenticated users to login", async () => {
    jest.mocked(getToken).mockResolvedValue(null);
    const response = await proxy(request("/coaching/new"));
    expect(response.headers.get("location")).toContain("/login?callbackUrl=");
  });

  it("routes accounts without current consent to the agreement gate", async () => {
    jest.mocked(getToken).mockResolvedValue(sessionToken("user", null));
    const response = await proxy(request("/coaching/new"));
    expect(response.headers.get("location")).toBe(
      "https://lab.v2a.com/agreement",
    );
  });

  it("prevents a user from reaching admin routes", async () => {
    jest
      .mocked(getToken)
      .mockResolvedValue(sessionToken("user", "leadercoach-pilot-v1"));
    const response = await proxy(request("/dashboard"));
    expect(response.headers.get("location")).toBe(
      "https://lab.v2a.com/coaching/new",
    );
  });

  it("allows a consenting admin to reach the dashboard", async () => {
    jest
      .mocked(getToken)
      .mockResolvedValue(sessionToken("admin", "leadercoach-pilot-v1"));
    const response = await proxy(request("/dashboard"));
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
