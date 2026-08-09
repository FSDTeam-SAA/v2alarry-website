"use client";

import { KeyboardEvent, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Plus, Search, Trash2, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import type { CoachingConversation } from "../types";

type CoachingSidebarProps = {
  activeConversationId: string | null;
  accountName: string;
  conversationCount: number;
  conversationsError: boolean;
  filteredConversations: CoachingConversation[];
  isDeletingConversation: boolean;
  isHistoryLoading: boolean;
  isSearchOpen: boolean;
  isStreaming: boolean;
  onCreateSession: () => void;
  onDeleteConversation: (conversationId: string) => Promise<void>;
  onSearchQueryChange: (query: string) => void;
  onSelectSession: (conversationId: string) => void;
  onToggleSearch: () => void;
  searchQuery: string;
};

function groupConversations(conversations: CoachingConversation[]) {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const previousWeek = new Date(startOfToday);
  previousWeek.setDate(previousWeek.getDate() - 7);
  const groups = new Map<string, CoachingConversation[]>([
    ["Today", []],
    ["Previous 7 days", []],
    ["Earlier", []],
  ]);

  conversations.forEach((conversation) => {
    const updatedAt = new Date(conversation.updatedAt);
    const group =
      updatedAt >= startOfToday
        ? "Today"
        : updatedAt >= previousWeek
          ? "Previous 7 days"
          : "Earlier";
    groups.get(group)?.push(conversation);
  });

  return Array.from(groups).filter(([, items]) => items.length > 0);
}

function HighlightedConversationTitle({
  title,
  query,
}: {
  title: string;
  query: string;
}) {
  const searchTerm = query.trim();
  const matchIndex = title
    .toLocaleLowerCase()
    .indexOf(searchTerm.toLocaleLowerCase());

  if (!searchTerm || matchIndex === -1) return title;

  const matchEnd = matchIndex + searchTerm.length;
  return (
    <>
      {title.slice(0, matchIndex)}
      <mark>{title.slice(matchIndex, matchEnd)}</mark>
      {title.slice(matchEnd)}
    </>
  );
}

export function CoachingSidebar({
  activeConversationId,
  accountName,
  conversationCount,
  conversationsError,
  filteredConversations,
  isDeletingConversation,
  isHistoryLoading,
  isSearchOpen,
  isStreaming,
  onCreateSession,
  onDeleteConversation,
  onSearchQueryChange,
  onSelectSession,
  onToggleSearch,
  searchQuery,
}: CoachingSidebarProps) {
  const [conversationToDelete, setConversationToDelete] =
    useState<CoachingConversation | null>(null);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const firstSearchResultRef = useRef<HTMLButtonElement>(null);
  const historyTitle = isSearchOpen ? "Search sessions" : "Coaching History";
  const conversationGroups = useMemo(
    () => groupConversations(filteredConversations),
    [filteredConversations],
  );
  const searchSummary = isSearchOpen
    ? searchQuery
      ? `${filteredConversations.length} of ${conversationCount} saved sessions match your search.`
      : `${conversationCount} saved sessions. Search by title to narrow results.`
    : null;

  async function confirmDelete() {
    if (!conversationToDelete) return;
    await onDeleteConversation(conversationToDelete.id);
    setConversationToDelete(null);
  }

  function closeSearch() {
    searchTriggerRef.current?.focus();
    onToggleSearch();
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSearch();
      return;
    }

    if (event.key === "ArrowDown" && filteredConversations.length > 0) {
      event.preventDefault();
      firstSearchResultRef.current?.focus();
    }
  }

  return (
    <aside className="coaching-sidebar" aria-label="Coaching navigation">
      <div className="coaching-sidebar-top">
        <div className="coaching-logo">
          <Image
            alt="LeaderCoach"
            className="coaching-logo-image"
            height={1024}
            priority
            src="/images/leader-coach-logo.png"
            width={1536}
          />
        </div>
        <nav className="coaching-nav" aria-label="Coaching sessions">
          <button
            className="coaching-nav-button coaching-nav-button-primary"
            disabled={isStreaming}
            onClick={onCreateSession}
            type="button"
          >
            <Plus aria-hidden="true" size={24} />
            <span>New Coaching Session</span>
          </button>
          <button
            aria-controls="coaching-history"
            aria-expanded={isSearchOpen}
            className="coaching-nav-button"
            onClick={onToggleSearch}
            ref={searchTriggerRef}
            type="button"
          >
            <Search aria-hidden="true" size={24} />
            <span>Search Sessions</span>
          </button>
        </nav>
        <section
          className={`coaching-history${isSearchOpen ? " coaching-history-search" : ""}`}
          id="coaching-history"
          aria-labelledby="coaching-history-title"
        >
          <div className="coaching-history-heading">
            <h2 id="coaching-history-title">{historyTitle}</h2>
            {isSearchOpen ? (
              <>
                <div className="coaching-search-field">
                  <label className="sr-only" htmlFor="session-search">
                    Search session titles
                  </label>
                  <Search aria-hidden="true" size={16} />
                  <input
                    autoFocus
                    id="session-search"
                    onChange={(event) =>
                      onSearchQueryChange(event.target.value)
                    }
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search session titles"
                    type="search"
                    value={searchQuery}
                  />
                  <button
                    aria-label="Close session search"
                    onClick={closeSearch}
                    type="button"
                  >
                    <X aria-hidden="true" size={16} />
                  </button>
                </div>
                {searchSummary ? (
                  <p className="coaching-search-summary" role="status">
                    {searchSummary}
                  </p>
                ) : null}
              </>
            ) : null}
          </div>
          <div className="coaching-history-results">
            {isHistoryLoading ? (
              <div
                aria-busy="true"
                aria-label="Loading coaching history"
                className="coaching-history-skeletons"
              >
                <span />
                <span />
                <span />
              </div>
            ) : null}
            {conversationsError ? (
              <p className="coaching-search-empty" role="alert">
                Unable to load coaching history. Refresh the page to try again.
              </p>
            ) : null}
            {!isHistoryLoading &&
            !conversationsError &&
            filteredConversations.length > 0
              ? conversationGroups.map(([groupName, conversations]) => (
                  <section className="coaching-history-group" key={groupName}>
                    <h3>{groupName}</h3>
                    <ul>
                      {conversations.map((conversation) => (
                        <li
                          className="coaching-history-row"
                          key={conversation.id}
                        >
                          <button
                            aria-current={
                              activeConversationId === conversation.id
                                ? "page"
                                : undefined
                            }
                            className={`coaching-history-item${activeConversationId === conversation.id ? " coaching-history-item-active" : ""}`}
                            onClick={() => onSelectSession(conversation.id)}
                            ref={
                              conversation.id === filteredConversations[0]?.id
                                ? firstSearchResultRef
                                : undefined
                            }
                            title={conversation.title}
                            type="button"
                          >
                            <span>
                              <HighlightedConversationTitle
                                query={searchQuery}
                                title={conversation.title}
                              />
                            </span>
                          </button>
                          <button
                            aria-label={`Delete session: ${conversation.title}`}
                            className="coaching-history-delete"
                            disabled={isStreaming}
                            onClick={() =>
                              setConversationToDelete(conversation)
                            }
                            type="button"
                          >
                            <Trash2 aria-hidden="true" size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))
              : null}
            {!isHistoryLoading &&
            !conversationsError &&
            filteredConversations.length === 0 ? (
              <p className="coaching-search-empty" role="status">
                {searchQuery
                  ? `No session titles match “${searchQuery}”.`
                  : "No coaching sessions yet."}
              </p>
            ) : null}
          </div>
        </section>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <button className="coaching-profile" type="button">
            <span>
              <strong>{accountName}</strong>
              <span>Account</span>
            </span>
          </button>
        </DialogTrigger>
        <DialogContent className="coaching-account-dialog">
          <DialogHeader>
            <DialogTitle>Account</DialogTitle>
            <DialogDescription>Your Jess Mode account.</DialogDescription>
          </DialogHeader>
          <dl>
            <div>
              <dt>Conversations</dt>
              <dd>Saved to your account</dd>
            </div>
          </dl>
        </DialogContent>
      </Dialog>
      <Dialog
        open={conversationToDelete !== null}
        onOpenChange={(open) => !open && setConversationToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this coaching session?</DialogTitle>
            <DialogDescription>
              This removes the conversation and its messages from your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              className="coaching-dialog-button"
              onClick={() => setConversationToDelete(null)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="coaching-dialog-button coaching-dialog-button-danger"
              disabled={isDeletingConversation || isStreaming}
              onClick={() => void confirmDelete()}
              type="button"
            >
              {isDeletingConversation ? "Deleting…" : "Delete session"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
