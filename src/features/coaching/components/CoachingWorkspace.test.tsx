import { act, fireEvent, render, screen } from "@testing-library/react";

import { useCoachingWorkspace } from "../hooks/useCoachingWorkspace";
import { CoachingWorkspace } from "./CoachingWorkspace";

jest.mock("next/image", () => ({ __esModule: true, default: () => null }));
jest.mock("../hooks/useCoachingWorkspace", () => ({
  useCoachingWorkspace: jest.fn(),
}));

const mockedWorkspace = jest.mocked(useCoachingWorkspace);

describe("CoachingWorkspace", () => {
  const removeConversation = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.resetAllMocks();
    mockedWorkspace.mockReturnValue({
      activeConversationId: "conversation-1",
      activeTitle: "Leading Through Change",
      conversationsError: false,
      createNewSession: jest.fn(),
      draft: "",
      filteredConversations: [
        {
          createdAt: "2026-08-04T10:00:00Z",
          id: "conversation-1",
          messageCount: 2,
          title: "Leading Through Change",
          updatedAt: "2026-08-04T10:00:00Z",
        },
      ],
      hasActiveConversation: true,
      isDeletingConversation: false,
      isHistoryLoading: false,
      isSearchOpen: false,
      isStreaming: false,
      isTranscriptError: false,
      isTranscriptLoading: false,
      messages: [
        {
          content: "What needs the clearest leadership right now?",
          createdAt: "2026-08-04T10:00:00Z",
          id: "message-1",
          role: "assistant",
        },
      ],
      refreshActiveConversation: jest.fn().mockResolvedValue(undefined),
      removeConversation,
      searchQuery: "",
      selectSession: jest.fn(),
      sendMessage: jest.fn().mockResolvedValue(true),
      setDraft: jest.fn(),
      setSearchQuery: jest.fn(),
      streamError: null,
      toggleSearch: jest.fn(),
    });
  });

  it("explains that attachments are unavailable", () => {
    render(<CoachingWorkspace />);

    expect(screen.getByRole("button", { name: "Attach" })).toBeDisabled();
    expect(
      screen.getByText("File attachments aren’t available yet."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Your conversations are saved to your account."),
    ).toBeInTheDocument();
  });

  it("requires confirmation before deleting a conversation", async () => {
    render(<CoachingWorkspace />);

    fireEvent.click(
      screen.getByRole("button", { name: "Delete Leading Through Change" }),
    );
    expect(
      screen.getByRole("heading", { name: "Delete this coaching session?" }),
    ).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Delete session" }));
    });
    expect(removeConversation).toHaveBeenCalledWith("conversation-1");
  });
});
