"use client";

import { suggestedPrompts } from "../coaching-data";
import { useCoachingWorkspace } from "../hooks/useCoachingWorkspace";
import { CoachingConversation } from "./CoachingConversation";
import { CoachingSidebar } from "./CoachingSidebar";

export function CoachingWorkspace() {
  const {
    activeSession,
    addAttachments,
    attachments,
    createNewSession,
    draft,
    filteredSessions,
    isSearchOpen,
    pendingReplyCounts,
    removeAttachment,
    searchQuery,
    selectSession,
    sendMessage,
    setDraft,
    setSearchQuery,
    toggleSearch,
  } = useCoachingWorkspace();

  return (
    <main className="coaching-workspace">
      <CoachingSidebar
        activeSessionId={activeSession?.id ?? null}
        filteredSessions={filteredSessions}
        isSearchOpen={isSearchOpen}
        onCreateSession={createNewSession}
        onSearchQueryChange={setSearchQuery}
        onSelectSession={selectSession}
        onToggleSearch={toggleSearch}
        searchQuery={searchQuery}
      />
      <section className="coaching-main">
        <CoachingConversation
          activeSession={activeSession}
          attachments={attachments}
          draft={draft}
          isReplyPending={
            (pendingReplyCounts[activeSession?.id ?? ""] ?? 0) > 0
          }
          onAddAttachments={addAttachments}
          onDraftChange={setDraft}
          onRemoveAttachment={removeAttachment}
          onSendMessage={sendMessage}
          onUsePrompt={setDraft}
          prompts={suggestedPrompts}
        />
      </section>
    </main>
  );
}
