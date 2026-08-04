"use client";

import { useState } from "react";
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

export function CoachingSidebar({
  activeConversationId,
  accountName,
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
  const historyTitle = isSearchOpen ? "Search sessions" : "Coaching History";
  const conversationGroups = groupConversations(filteredConversations);

  async function confirmDelete() {
    if (!conversationToDelete) return;
    await onDeleteConversation(conversationToDelete.id);
    setConversationToDelete(null);
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
            aria-expanded={isSearchOpen}
            className="coaching-nav-button"
            onClick={onToggleSearch}
            type="button"
          >
            <Search aria-hidden="true" size={24} />
            <span>Search Sessions</span>
          </button>
        </nav>
        <section
          className={`coaching-history${isSearchOpen ? " coaching-history-search" : ""}`}
          aria-labelledby="coaching-history-title"
        >
          <h2 id="coaching-history-title">{historyTitle}</h2>
          {isSearchOpen ? (
            <div className="coaching-search-field">
              <label className="sr-only" htmlFor="session-search">
                Search session titles
              </label>
              <Search aria-hidden="true" size={16} />
              <input
                autoFocus
                id="session-search"
                onChange={(event) => onSearchQueryChange(event.target.value)}
                onKeyDown={(event) =>
                  event.key === "Escape" && onToggleSearch()
                }
                placeholder="Search session titles"
                type="search"
                value={searchQuery}
              />
              <button
                aria-label="Close session search"
                onClick={onToggleSearch}
                type="button"
              >
                <X aria-hidden="true" size={16} />
              </button>
            </div>
          ) : null}
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
                          title={conversation.title}
                          type="button"
                        >
                          <span>{conversation.title}</span>
                        </button>
                        <button
                          aria-label={`Delete session: ${conversation.title}`}
                          className="coaching-history-delete"
                          disabled={isStreaming}
                          onClick={() => setConversationToDelete(conversation)}
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
