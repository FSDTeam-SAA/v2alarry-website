import { fireEvent, render, screen } from "@testing-library/react";

import { CoachingSidebar } from "./CoachingSidebar";

jest.mock("next/image", () => ({ __esModule: true, default: () => null }));

describe("CoachingSidebar", () => {
  it("moves keyboard focus into search results and restores it after closing", () => {
    const onToggleSearch = jest.fn();
    const title =
      "Leading a team through a long and difficult organizational transition";

    render(
      <CoachingSidebar
        activeConversationId={null}
        accountName="Test Person"
        conversationCount={1}
        conversationsError={false}
        filteredConversations={[
          {
            createdAt: "2026-08-09T10:00:00Z",
            id: "conversation-1",
            messageCount: 2,
            title,
            updatedAt: "2026-08-09T10:00:00Z",
          },
        ]}
        isDeletingConversation={false}
        isHistoryLoading={false}
        isSearchOpen
        isStreaming={false}
        onCreateSession={jest.fn()}
        onDeleteConversation={jest.fn().mockResolvedValue(undefined)}
        onSearchQueryChange={jest.fn()}
        onSelectSession={jest.fn()}
        onToggleSearch={onToggleSearch}
        searchQuery="transition"
      />,
    );

    const searchInput = screen.getByRole("searchbox", {
      name: "Search session titles",
    });
    const result = screen.getByRole("button", { name: title });
    const searchTrigger = screen.getByRole("button", {
      name: "Search Sessions",
    });

    fireEvent.keyDown(searchInput, { key: "ArrowDown" });
    expect(result).toHaveFocus();

    fireEvent.keyDown(searchInput, { key: "Escape" });
    expect(onToggleSearch).toHaveBeenCalledTimes(1);
    expect(searchTrigger).toHaveFocus();
  });

  it("explains when no session title matches the search", () => {
    render(
      <CoachingSidebar
        activeConversationId={null}
        accountName="Test Person"
        conversationCount={3}
        conversationsError={false}
        filteredConversations={[]}
        isDeletingConversation={false}
        isHistoryLoading={false}
        isSearchOpen
        isStreaming={false}
        onCreateSession={jest.fn()}
        onDeleteConversation={jest.fn().mockResolvedValue(undefined)}
        onSearchQueryChange={jest.fn()}
        onSelectSession={jest.fn()}
        onToggleSearch={jest.fn()}
        searchQuery="unmatched"
      />,
    );

    expect(
      screen.getByText("No session titles match “unmatched”."),
    ).toBeInTheDocument();
  });
});
