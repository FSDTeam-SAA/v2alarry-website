import { registerUser } from "./register.api";

describe("registerUser", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000/api/v1";
    global.fetch = jest.fn();
  });

  it("posts the backend registration contract", async () => {
    jest.mocked(fetch).mockResolvedValue({ ok: true } as Response);

    await registerUser({
      email: "member@example.com",
      fullName: "Member Name",
      password: "password123",
    });

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/auth/register",
      {
        body: JSON.stringify({
          email: "member@example.com",
          full_name: "Member Name",
          password: "password123",
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      },
    );
  });

  it("returns the backend's safe error detail", async () => {
    jest.mocked(fetch).mockResolvedValue({
      json: jest.fn().mockResolvedValue({ detail: "User already exists" }),
      ok: false,
    } as unknown as Response);

    await expect(
      registerUser({
        email: "member@example.com",
        fullName: "Member Name",
        password: "password123",
      }),
    ).rejects.toThrow("User already exists");
  });
});
