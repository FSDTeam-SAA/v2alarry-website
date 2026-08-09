import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type PropsWithChildren } from "react";

import { getConversationMessages, streamChat } from "../api/chat.api";
import {
  getStreamFailureRecovery,
  useCoachingWorkspace,
} from "./useCoachingWorkspace";

const replace = jest.fn();

jest.mock("next/navigation", () => ({
  useParams: () => ({ conversationId: "conversation-1" }),
  useRouter: () => ({ push: jest.fn(), replace }),
}));

jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { name: "Test Person" } },
    status: "authenticated",
  }),
}));

jest.mock("../api/chat.api", () => ({
  getConversationMessages: jest.fn(),
  streamChat: jest.fn(),
}));

jest.mock("./useChat", () => ({
  chatKeys: {
    conversations: ["chat", "conversations"],
    messages: (conversationId: string) => [
      "chat",
      "conversations",
      conversationId,
      "messages",
    ],
  },
  useConversationMessages: () => ({
    data: [],
    isError: false,
    isLoading: false,
  }),
  useConversations: () => ({ data: [], isError: false, isLoading: false }),
  useDeleteConversation: () => ({ isPending: false, mutateAsync: jest.fn() }),
}));

const mockedGetConversationMessages = jest.mocked(getConversationMessages);
const mockedStreamChat = jest.mocked(streamChat);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function Wrapper({ children }: PropsWithChildren) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

describe("getStreamFailureRecovery", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    replace.mockReset();
    Object.assign(global, {
      cancelAnimationFrame: jest.fn(),
      requestAnimationFrame: (callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      },
    });
  });

  it("restores the draft when the stream fails before its first token", () => {
    expect(
      getStreamFailureRecovery({
        error: new Error(
          "The chat service is temporarily unavailable. Please try again.",
        ),
        hasReceivedToken: false,
        isAborted: false,
      }),
    ).toEqual({
      errorMessage:
        "The chat service is temporarily unavailable. Please try again.",
      preservePartialResponse: false,
    });
  });

  it("preserves a partial response when the stream stops after tokens", () => {
    expect(
      getStreamFailureRecovery({
        error: new Error("network lost"),
        hasReceivedToken: true,
        isAborted: false,
      }),
    ).toEqual({
      errorMessage:
        "The response was interrupted. Refresh this session to check whether it was saved.",
      preservePartialResponse: true,
    });
  });

  it("treats a done event as success when the follow-up history refresh fails", async () => {
    mockedGetConversationMessages.mockRejectedValue(
      new Error("history refresh failed"),
    );
    mockedStreamChat.mockImplementation(async (_input, handlers) => {
      handlers.onAccepted?.();
      handlers.onToken("Hello");
      handlers.onDone({
        assistantMessageId: "assistant-message-1",
        conversationId: "conversation-1",
        userMessageId: "user-message-1",
      });
    });

    const { result } = renderHook(() => useCoachingWorkspace(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setDraft("Hello");
    });

    let sent = false;
    await act(async () => {
      sent = await result.current.sendMessage();
    });

    expect(sent).toBe(true);
    expect(replace).toHaveBeenCalledWith("/coaching/conversation-1");
    expect(result.current.streamError).toBeNull();
  });

  it("keeps the active request alive while submission state re-renders", async () => {
    let continueStream: (() => void) | undefined;
    let streamSignal: AbortSignal | undefined;
    mockedGetConversationMessages.mockResolvedValue([]);
    mockedStreamChat.mockImplementation(async (_input, handlers, signal) => {
      streamSignal = signal;
      await new Promise<void>((resolve) => {
        continueStream = resolve;
      });

      if (signal?.aborted) {
        throw new DOMException("The operation was aborted", "AbortError");
      }

      handlers.onAccepted?.();
      handlers.onDone({
        assistantMessageId: "assistant-message-1",
        conversationId: "conversation-1",
        userMessageId: "user-message-1",
      });
    });

    const { result } = renderHook(() => useCoachingWorkspace(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setDraft("Hello");
    });

    let sendPromise: Promise<boolean> | undefined;
    act(() => {
      sendPromise = result.current.sendMessage();
    });

    await waitFor(() => expect(streamSignal).toBeDefined());
    const wasAbortedDuringSubmission = streamSignal?.aborted;

    continueStream?.();
    let sent = false;
    await act(async () => {
      sent = (await sendPromise) ?? false;
    });

    expect(wasAbortedDuringSubmission).toBe(false);
    expect(sent).toBe(true);
  });
});
