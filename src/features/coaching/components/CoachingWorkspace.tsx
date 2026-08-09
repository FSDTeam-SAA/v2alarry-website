"use client";

import { coachingStarters } from "../coaching-data";
import { useCoachingWorkspace } from "../hooks/useCoachingWorkspace";
import { CoachingConversation } from "./CoachingConversation";
import { CoachingSidebar } from "./CoachingSidebar";

export function CoachingWorkspace() {
  const workspace = useCoachingWorkspace();

  return (
    <main className="coaching-workspace ">
      <CoachingSidebar
        activeConversationId={workspace.activeConversationId}
        accountName={workspace.accountName}
        conversationCount={workspace.conversationCount}
        conversationsError={workspace.conversationsError}
        filteredConversations={workspace.filteredConversations}
        isDeletingConversation={workspace.isDeletingConversation}
        isHistoryLoading={workspace.isHistoryLoading}
        isSearchOpen={workspace.isSearchOpen}
        isStreaming={workspace.isStreaming}
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
          activeConversationId={workspace.activeConversationId}
          canRefreshConversation={Boolean(workspace.activeConversationId)}
          copySubmittedMessage={workspace.copySubmittedMessage}
          draft={workspace.draft}
          greetingName={workspace.greetingName}
          hasActiveConversation={workspace.hasActiveConversation}
          isStreaming={workspace.isStreaming}
          isTranscriptError={workspace.isTranscriptError}
          isTranscriptLoading={workspace.isTranscriptLoading}
          messages={workspace.messages}
          onDraftChange={workspace.setDraft}
          onRefreshConversation={workspace.refreshActiveConversation}
          onSendMessage={workspace.sendMessage}
          onStopGenerating={workspace.stopGenerating}
          onUsePrompt={workspace.setDraft}
          starters={coachingStarters}
          streamError={workspace.streamError}
          submissionState={workspace.submissionState}
        />
      </section>
    </main>
  );
}
