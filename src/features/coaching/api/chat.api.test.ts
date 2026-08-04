import { getSession } from "next-auth/react";
import { ReadableStream } from "node:stream/web";
import { TextDecoder, TextEncoder } from "node:util";

import { streamChat } from "./chat.api";

jest.mock("next-auth/react", () => ({ getSession: jest.fn() }));

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
    const response = {
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode('data: {"type":"token","content":"Hel'),
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

    await streamChat({ message: "Hello", stream: true }, { onDone, onToken });

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
});
