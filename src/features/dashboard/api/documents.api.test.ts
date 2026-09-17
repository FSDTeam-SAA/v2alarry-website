import { api } from "@/lib/api";
import { uploadDocument } from "./documents.api";

jest.mock("@/lib/api", () => ({ api: { post: jest.fn() } }));

describe("uploadDocument", () => {
  it("submits category and resolved user scope fields", async () => {
    jest.mocked(api.post).mockResolvedValue({});
    const file = new File(["leadership"], "guide.txt", { type: "text/plain" });

    await uploadDocument({
      title: "Leadership Guide",
      category: "Feedback",
      user_email: "leader@example.com",
      is_global: false,
      file,
    });

    const form = jest.mocked(api.post).mock.calls[0][1] as FormData;
    expect(form.get("category")).toBe("Feedback");
    expect(form.get("target_user_email")).toBe("leader@example.com");
    expect(form.get("is_global")).toBe("false");
  });
});
