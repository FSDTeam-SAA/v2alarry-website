"use client";

import { suggestedPrompts } from "../coaching-data";
import { useCoachingWorkspace } from "../hooks/useCoachingWorkspace";
import { CoachingConversation } from "./CoachingConversation";
import { CoachingSidebar } from "./CoachingSidebar";

export function CoachingWorkspace() {
  const workspace = useCoachingWorkspace();

  return (
    <main className="coaching-workspace ">
      <CoachingSidebar
        activeConversationId={workspace.activeConversationId}
        conversationsError={workspace.conversationsError}
        filteredConversations={workspace.filteredConversations}
        isDeletingConversation={workspace.isDeletingConversation}
        isHistoryLoading={workspace.isHistoryLoading}
        isSearchOpen={workspace.isSearchOpen}
        onCreateSession={workspace.createNewSession}
        onDeleteConversation={workspace.removeConversation}
        onSearchQueryChange={workspace.setSearchQuery}
        onSelectSession={workspace.selectSession}
        onToggleSearch={workspace.toggleSearch}
        searchQuery={workspace.searchQuery}
      />
      <section className="coaching-main ">
        <CoachingConversation
          activeTitle={workspace.activeTitle}
          canRefreshConversation={Boolean(workspace.activeConversationId)}
          draft={workspace.draft}
          hasActiveConversation={workspace.hasActiveConversation}
          isStreaming={workspace.isStreaming}
          isTranscriptError={workspace.isTranscriptError}
          isTranscriptLoading={workspace.isTranscriptLoading}
          messages={workspace.messages}
          onDraftChange={workspace.setDraft}
          onRefreshConversation={workspace.refreshActiveConversation}
          onSendMessage={workspace.sendMessage}
          onUsePrompt={workspace.setDraft}
          prompts={suggestedPrompts}
          streamError={workspace.streamError}
        />
      </section>
    </main>
  );
}
