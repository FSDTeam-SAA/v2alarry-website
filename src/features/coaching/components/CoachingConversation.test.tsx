import { fireEvent, render, screen } from "@testing-library/react";

import { CoachingConversation } from "./CoachingConversation";

describe("CoachingConversation", () => {
  const onSendMessage = jest.fn().mockResolvedValue(true);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("shows the factual preparation stage and keeps the next draft editable", () => {
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
        onStopGenerating={jest.fn()}
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

    const composer = screen.getByLabelText("What would you like to explore?");
    expect(composer).toBeEnabled();
    fireEvent.keyDown(composer, { key: "Enter" });
    expect(onSendMessage).not.toHaveBeenCalled();
  });
});
