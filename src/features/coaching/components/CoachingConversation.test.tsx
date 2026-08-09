import { fireEvent, render, screen } from "@testing-library/react";

import { CoachingConversation } from "./CoachingConversation";

describe("CoachingConversation", () => {
  const onSendMessage = jest.fn().mockResolvedValue(true);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("shows the factual preparation stage and keeps the next draft editable", () => {
    const onStopGenerating = jest.fn();

    render(
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

    const composer = screen.getByLabelText("What would you like to explore?");
    expect(composer).toBeEnabled();
    fireEvent.keyDown(composer, { key: "Enter" });
    expect(onSendMessage).not.toHaveBeenCalled();
    fireEvent.click(stopButton);
    expect(onStopGenerating).toHaveBeenCalledTimes(1);
  });
});
