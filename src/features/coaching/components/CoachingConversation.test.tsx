import { fireEvent, render, screen } from "@testing-library/react";

import { CoachingConversation } from "./CoachingConversation";

describe("CoachingConversation", () => {
  const onSendMessage = jest.fn().mockResolvedValue(true);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("shows a status-only composer while Jess prepares a response and restores the retained draft", () => {
    const onStopGenerating = jest.fn();

    const { rerender } = render(
      <CoachingConversation
        activeConversationId="conversation-1"
        activeTitle="Leading Through Change"
        canRefreshConversation
        copySubmittedMessage={jest.fn().mockResolvedValue(undefined)}
        draft="A follow-up thought"
        greetingName={null}
        hasActiveConversation
        isStreaming
        isTranscriptError={false}
        isTranscriptLoading={false}
        messages={[
          {
            content: "",
            createdAt: "2026-08-09T10:00:00Z",
            id: "reply-1",
            isStreaming: true,
            role: "assistant",
          },
        ]}
        onDraftChange={jest.fn()}
        onRefreshConversation={jest.fn().mockResolvedValue(undefined)}
        onSendMessage={onSendMessage}
        onStopGenerating={onStopGenerating}
        onUsePrompt={jest.fn()}
        starters={[]}
        streamError={null}
        submissionState={{
          conversationId: "conversation-1",
          draftSnapshot: "Original question",
          stage: "retrieving_context",
          status: "streaming",
        }}
      />,
    );

    expect(screen.getByText("Reviewing relevant context…")).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Leading Through Change" }),
    ).toHaveClass("coaching-panel-processing");
    expect(
      screen.getByText("Jess is preparing your response…"),
    ).toBeInTheDocument();
    const stopButton = screen.getByRole("button", {
      name: "Stop generating",
    });
    expect(stopButton).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Send coaching message" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByLabelText("What would you like to explore?"),
    ).not.toBeInTheDocument();
    expect(onSendMessage).not.toHaveBeenCalled();
    fireEvent.click(stopButton);
    expect(onStopGenerating).toHaveBeenCalledTimes(1);

    rerender(
      <CoachingConversation
        activeConversationId="conversation-1"
        activeTitle="Leading Through Change"
        canRefreshConversation
        copySubmittedMessage={jest.fn().mockResolvedValue(undefined)}
        draft="A follow-up thought"
        greetingName={null}
        hasActiveConversation
        isStreaming={false}
        isTranscriptError={false}
        isTranscriptLoading={false}
        messages={[]}
        onDraftChange={jest.fn()}
        onRefreshConversation={jest.fn().mockResolvedValue(undefined)}
        onSendMessage={onSendMessage}
        onStopGenerating={onStopGenerating}
        onUsePrompt={jest.fn()}
        starters={[]}
        streamError={null}
        submissionState={{ status: "idle" }}
      />,
    );

    expect(
      screen.getByLabelText("What would you like to explore?"),
    ).toHaveValue("A follow-up thought");
  });

  it("keeps empty messages disabled and sends a populated idle draft", () => {
    const onDraftChange = jest.fn();

    const { rerender } = render(
      <CoachingConversation
        activeConversationId={null}
        activeTitle="New coaching session"
        canRefreshConversation={false}
        copySubmittedMessage={jest.fn().mockResolvedValue(undefined)}
        draft=""
        greetingName={null}
        hasActiveConversation={false}
        isStreaming={false}
        isTranscriptError={false}
        isTranscriptLoading={false}
        messages={[]}
        onDraftChange={onDraftChange}
        onRefreshConversation={jest.fn().mockResolvedValue(undefined)}
        onSendMessage={onSendMessage}
        onStopGenerating={jest.fn()}
        onUsePrompt={jest.fn()}
        starters={[]}
        streamError={null}
        submissionState={{ status: "idle" }}
      />,
    );

    const sendButton = screen.getByRole("button", {
      name: "Send coaching message",
    });
    expect(sendButton).toBeDisabled();

    rerender(
      <CoachingConversation
        activeConversationId={null}
        activeTitle="New coaching session"
        canRefreshConversation={false}
        copySubmittedMessage={jest.fn().mockResolvedValue(undefined)}
        draft="I need help preparing for a difficult conversation."
        greetingName={null}
        hasActiveConversation={false}
        isStreaming={false}
        isTranscriptError={false}
        isTranscriptLoading={false}
        messages={[]}
        onDraftChange={onDraftChange}
        onRefreshConversation={jest.fn().mockResolvedValue(undefined)}
        onSendMessage={onSendMessage}
        onStopGenerating={jest.fn()}
        onUsePrompt={jest.fn()}
        starters={[]}
        streamError={null}
        submissionState={{ status: "idle" }}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Send coaching message" }),
    );

    expect(onSendMessage).toHaveBeenCalledTimes(1);
  });
});
