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
  conversationsError: boolean;
  filteredConversations: CoachingConversation[];
  isDeletingConversation: boolean;
  isHistoryLoading: boolean;
  isSearchOpen: boolean;
  onCreateSession: () => void;
  onDeleteConversation: (conversationId: string) => Promise<void>;
  onSearchQueryChange: (query: string) => void;
  onSelectSession: (conversationId: string) => void;
  onToggleSearch: () => void;
  searchQuery: string;
};

function formatConversationDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function CoachingSidebar({
  activeConversationId,
  conversationsError,
  filteredConversations,
  isDeletingConversation,
  isHistoryLoading,
  isSearchOpen,
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
                Search loaded coaching sessions
              </label>
              <Search aria-hidden="true" size={16} />
              <input
                autoFocus
                id="session-search"
                onChange={(event) => onSearchQueryChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") onToggleSearch();
                }}
                placeholder="Search titles and loaded messages"
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
          ) : conversationsError ? (
            <p className="coaching-search-empty" role="alert">
              Unable to load coaching history. Refresh the page to try again.
            </p>
          ) : filteredConversations.length > 0 ? (
            <ul>
              {filteredConversations.map((conversation) => (
                <li className="coaching-history-row" key={conversation.id}>
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
                    <time dateTime={conversation.updatedAt}>
                      {formatConversationDate(conversation.updatedAt)}
                    </time>
                  </button>
                  <button
                    aria-label={`Delete ${conversation.title}`}
                    className="coaching-history-delete"
                    onClick={() => setConversationToDelete(conversation)}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" size={16} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="coaching-search-empty" role="status">
              {searchQuery
                ? `No loaded sessions match “${searchQuery}”.`
                : "No coaching sessions yet."}
            </p>
          )}
        </section>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <button className="coaching-profile" type="button">
            <Image
              alt="Jane Cooper"
              height={40}
              src="/images/jane-cooper-avatar.png"
              width={40}
            />
            <span>
              <strong>Jane Cooper</strong>
              <span>Free</span>
            </span>
          </button>
        </DialogTrigger>
        <DialogContent className="coaching-account-dialog">
          <DialogHeader>
            <DialogTitle>Account</DialogTitle>
            <DialogDescription>
              Jane Cooper is currently on the Free plan.
            </DialogDescription>
          </DialogHeader>
          <dl>
            <div>
              <dt>Plan</dt>
              <dd>Free</dd>
            </div>
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
              This permanently removes the conversation and its messages from
              your account.
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
              disabled={isDeletingConversation}
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
