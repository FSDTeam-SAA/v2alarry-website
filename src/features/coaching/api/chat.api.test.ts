import { getSession } from "next-auth/react";
import { ReadableStream } from "node:stream/web";
import { TextDecoder, TextEncoder } from "node:util";

import { notifySessionExpired } from "@/features/auth/lib/session-expiry";

import { streamChat } from "./chat.api";

jest.mock("next-auth/react", () => ({ getSession: jest.fn() }));
jest.mock("@/features/auth/lib/session-expiry", () => ({
  notifySessionExpired: jest.fn(),
}));

const mockedGetSession = jest.mocked(getSession);

describe("streamChat", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    Object.assign(global, { TextDecoder, TextEncoder });
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000/api/v1";
    mockedGetSession.mockResolvedValue({
      accessToken: "access-token",
    } as never);
  });

  it("parses SSE events split across network chunks", async () => {
    const encoder = new TextEncoder();
    const onToken = jest.fn();
    const onDone = jest.fn();
    const onStatus = jest.fn();
    const response = {
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(
              'data: {"type":"status","status":"retrieving_context"}\n\ndata: {"type":"token","content":"Hel',
            ),
          );
          controller.enqueue(
            encoder.encode(
              'lo"}\n\ndata: {"type":"done","conversation_id":"conversation-1","user_message_id":"user-message-1","assistant_message_id":"assistant-message-1","persisted":true}\n\ndata: [DONE]\n\n',
            ),
          );
          controller.close();
        },
      }),
      ok: true,
    } as unknown as Response;
    const fetchMock = jest.fn().mockResolvedValue(response);
    global.fetch = fetchMock;

    await streamChat(
      { message: "Hello", stream: true },
      { onDone, onStatus, onToken },
    );

    expect(onStatus).toHaveBeenCalledWith("retrieving_context");
    expect(onToken).toHaveBeenCalledWith("Hello");
    expect(onDone).toHaveBeenCalledWith({
      conversationId: "conversation-1",
      userMessageId: "user-message-1",
      assistantMessageId: "assistant-message-1",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/chat/"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer access-token",
        }),
        method: "POST",
      }),
    );
  });

  it("surfaces the server's safe stream error", async () => {
    const encoder = new TextEncoder();
    const response = {
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(
              'data: {"type":"error","content":"The chat service is temporarily unavailable. Please try again."}\n\n',
            ),
          );
          controller.close();
        },
      }),
      ok: true,
    } as unknown as Response;
    global.fetch = jest.fn().mockResolvedValue(response);

    await expect(
      streamChat(
        { message: "Hello", stream: true },
        { onDone: jest.fn(), onToken: jest.fn() },
      ),
    ).rejects.toThrow(
      "The chat service is temporarily unavailable. Please try again.",
    );
  });

  it("opens the shared re-login flow for an unauthorized stream request", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ detail: "Expired token" }),
      ok: false,
      status: 401,
    } as unknown as Response);

    await expect(
      streamChat(
        { message: "Hello", stream: true },
        { onDone: jest.fn(), onToken: jest.fn() },
      ),
    ).rejects.toThrow("Expired token");

    expect(notifySessionExpired).toHaveBeenCalledTimes(1);
  });
});
