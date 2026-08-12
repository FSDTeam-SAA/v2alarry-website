"use client";

import {
  KeyboardEvent,
  type RefObject,
  useMemo,
  useRef,
  useState,
  memo,
  useCallback,
  useEffect,
} from "react";
import Image from "next/image";
import { LogOut, Plus, Search, Trash2, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { logout } from "@/features/auth/lib/logout";

import type { CoachingConversation } from "../types";

// --- Types ---
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

// --- Utilities ---
const getGroupForDate = (
  date: Date,
  startOfToday: Date,
  previousWeek: Date,
): string => {
  if (date >= startOfToday) return "Today";
  if (date >= previousWeek) return "Previous 7 days";
  return "Earlier";
};

// --- Sub-Components ---
const HighlightedTitle = memo(function HighlightedTitle({
  title,
  query,
}: {
  title: string;
  query: string;
}) {
  if (!query.trim()) return <>{title}</>;

  const searchTerm = query.trim().toLowerCase();
  const matchIndex = title.toLowerCase().indexOf(searchTerm);

  if (matchIndex === -1) return <>{title}</>;

  const matchEnd = matchIndex + searchTerm.length;
  return (
    <>
      {title.slice(0, matchIndex)}
      <mark className="bg-primary/20 text-primary">
        {title.slice(matchIndex, matchEnd)}
      </mark>
      {title.slice(matchEnd)}
    </>
  );
});

type ConversationItemProps = {
  conversation: CoachingConversation;
  isActive: boolean;
  isFirstResult: boolean;
  isStreaming: boolean;
  searchQuery: string;
  onSelect: (id: string) => void;
  onDeleteRequest: (conversation: CoachingConversation) => void;
  firstResultRef?: RefObject<HTMLButtonElement | null>;
};

const ConversationItem = memo(function ConversationItem({
  conversation,
  isActive,
  isFirstResult,
  isStreaming,
  searchQuery,
  onSelect,
  onDeleteRequest,
  firstResultRef,
}: ConversationItemProps) {
  const handleSelect = useCallback(
    () => onSelect(conversation.id),
    [onSelect, conversation.id],
  );
  const handleDeleteRequest = useCallback(
    () => onDeleteRequest(conversation),
    [onDeleteRequest, conversation],
  );

  return (
    <li className="coaching-history-row">
      <button
        aria-current={isActive ? "page" : undefined}
        className={`coaching-history-item${isActive ? " coaching-history-item-active" : ""}`}
        onClick={handleSelect}
        ref={isFirstResult ? firstResultRef : undefined}
        title={conversation.title}
        type="button"
      >
        <span className="truncate">
          <HighlightedTitle query={searchQuery} title={conversation.title} />
        </span>
      </button>
      <button
        aria-label={`Delete session: ${conversation.title}`}
        className="coaching-history-delete"
        disabled={isStreaming}
        onClick={handleDeleteRequest}
        type="button"
      >
        <Trash2 aria-hidden="true" size={16} />
      </button>
    </li>
  );
});

// --- Main Component ---
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
  const [isMounted, setIsMounted] = useState(false);
  const [conversationToDelete, setConversationToDelete] =
    useState<CoachingConversation | null>(null);

  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const firstSearchResultRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Prevent hydration mismatches by standardizing date logic post-mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const conversationGroups = useMemo(() => {
    if (!isMounted) return []; // Fallback for SSR

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const previousWeek = new Date(
      startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000,
    );

    const groups = new Map<string, CoachingConversation[]>([
      ["Today", []],
      ["Previous 7 days", []],
      ["Earlier", []],
    ]);

    for (const conversation of filteredConversations) {
      const updatedAt = new Date(conversation.updatedAt);
      if (isNaN(updatedAt.getTime())) continue; // Boundary check for invalid dates

      const groupName = getGroupForDate(updatedAt, startOfToday, previousWeek);
      groups.get(groupName)?.push(conversation);
    }

    return Array.from(groups).filter(([, items]) => items.length > 0);
  }, [filteredConversations, isMounted]);

  const searchSummary = useMemo(() => {
    if (!isSearchOpen) return null;
    if (searchQuery)
      return `${filteredConversations.length} of ${conversationCount} saved sessions match your search.`;
    return `${conversationCount} saved sessions. Search by title to narrow results.`;
  }, [
    isSearchOpen,
    searchQuery,
    filteredConversations.length,
    conversationCount,
  ]);

  const confirmDelete = useCallback(async () => {
    if (!conversationToDelete) return;
    try {
      await onDeleteConversation(conversationToDelete.id);
    } finally {
      setConversationToDelete(null);
    }
  }, [conversationToDelete, onDeleteConversation]);

  const closeSearch = useCallback(() => {
    onSearchQueryChange("");
    onToggleSearch();
    setTimeout(() => searchTriggerRef.current?.focus(), 0);
  }, [onToggleSearch, onSearchQueryChange]);

  const handleSearchKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSearch();
        return;
      }
      if (event.key === "ArrowDown" && filteredConversations.length > 0) {
        event.preventDefault();
        firstSearchResultRef.current?.focus();
      }
    },
    [closeSearch, filteredConversations.length],
  );

  return (
    <aside className="coaching-sidebar" aria-label="Coaching navigation">
      <div className="coaching-sidebar-top">
        <div className="coaching-logo">
          <Image
            alt="LeaderCoach"
            className="coaching-logo-image"
            height={48}
            priority
            src="/images/leader-coach-logo.png"
            width={150}
            sizes="(max-width: 768px) 100vw, 150px"
          />
        </div>

        <nav className="coaching-nav" aria-label="Coaching sessions">
          <button
            className="coaching-nav-button coaching-nav-button-primary focus-visible:ring-2 focus-visible:ring-offset-2"
            disabled={isStreaming}
            onClick={onCreateSession}
            type="button"
          >
            <Plus aria-hidden="true" size={20} />
            <span>New Coaching Session</span>
          </button>

          <button
            aria-controls="coaching-history"
            aria-expanded={isSearchOpen}
            className="coaching-nav-button focus-visible:ring-2"
            onClick={onToggleSearch}
            ref={searchTriggerRef}
            type="button"
          >
            <Search aria-hidden="true" size={20} />
            <span>Search Sessions</span>
          </button>
        </nav>

        <section
          className={`coaching-history${isSearchOpen ? " coaching-history-search" : ""}`}
          id="coaching-history"
          aria-labelledby="coaching-history-title"
        >
          <div className="coaching-history-heading">
            <h2 id="coaching-history-title">
              {isSearchOpen ? "Search sessions" : "Coaching History"}
            </h2>

            {isSearchOpen && (
              <>
                <div className="coaching-search-field">
                  <label className="sr-only" htmlFor="session-search">
                    Search session titles
                  </label>
                  <Search aria-hidden="true" size={16} />
                  <input
                    autoFocus
                    id="session-search"
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search session titles"
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                  />
                  <button
                    aria-label="Clear and close search"
                    onClick={closeSearch}
                    type="button"
                  >
                    <X aria-hidden="true" size={16} />
                  </button>
                </div>
                {searchSummary && (
                  <p
                    className="coaching-search-summary text-sm text-muted-foreground"
                    role="status"
                  >
                    {searchSummary}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="coaching-history-results">
            {isHistoryLoading && (
              <div
                aria-busy="true"
                aria-label="Loading coaching history"
                className="coaching-history-skeletons"
              >
                <span className="animate-pulse bg-muted rounded h-8 w-full block mb-2" />
                <span className="animate-pulse bg-muted rounded h-8 w-3/4 block mb-2" />
                <span className="animate-pulse bg-muted rounded h-8 w-5/6 block" />
              </div>
            )}

            {conversationsError && (
              <p
                className="coaching-search-empty text-destructive"
                role="alert"
              >
                Unable to load coaching history. Refresh the page to try again.
              </p>
            )}

            {isMounted &&
              !isHistoryLoading &&
              !conversationsError &&
              filteredConversations.length > 0 &&
              conversationGroups.map(([groupName, conversations]) => (
                <section className="coaching-history-group" key={groupName}>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    {groupName}
                  </h3>
                  <ul>
                    {conversations.map((conversation, index) => (
                      <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        isActive={activeConversationId === conversation.id}
                        isFirstResult={
                          index === 0 && groupName === conversationGroups[0][0]
                        }
                        isStreaming={isStreaming}
                        searchQuery={searchQuery}
                        onSelect={onSelectSession}
                        onDeleteRequest={setConversationToDelete}
                        firstResultRef={firstSearchResultRef}
                      />
                    ))}
                  </ul>
                </section>
              ))}

            {isMounted &&
              !isHistoryLoading &&
              !conversationsError &&
              filteredConversations.length === 0 && (
                <p className="coaching-search-empty" role="status">
                  {searchQuery
                    ? `No session titles match “${searchQuery}”.`
                    : "No coaching sessions yet."}
                </p>
              )}
          </div>
        </section>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <button
            className="coaching-profile hover:bg-muted/50 transition-colors"
            type="button"
          >
            <span className="flex flex-col items-start">
              <strong className="text-sm font-semibold">{accountName}</strong>
              <span className="text-xs text-muted-foreground">Account</span>
            </span>
          </button>
        </DialogTrigger>
        <DialogContent className="coaching-account-dialog sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Account</DialogTitle>
            <DialogDescription>Your Jess Mode account.</DialogDescription>
          </DialogHeader>
          <dl className="space-y-4 my-4">
            <div className="flex justify-between items-center border-b pb-2">
              <dt className="text-sm font-medium">Conversations</dt>
              <dd className="text-sm text-muted-foreground">
                Saved to your account
              </dd>
            </div>
          </dl>
          <button
            className="coaching-dialog-button coaching-dialog-button-danger w-full flex items-center justify-center gap-2 mt-4"
            onClick={() => void logout()}
            type="button"
          >
            <LogOut aria-hidden size={16} /> Log out
          </button>
        </DialogContent>
      </Dialog>

      <Dialog
        open={conversationToDelete !== null}
        onOpenChange={(open) => !open && setConversationToDelete(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this coaching session?</DialogTitle>
            <DialogDescription>
              This removes the conversation and its messages from your account
              permanently.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end mt-4">
            <button
              className="coaching-dialog-button px-4 py-2 text-sm"
              onClick={() => setConversationToDelete(null)}
              type="button"
              disabled={isDeletingConversation}
            >
              Cancel
            </button>
            <button
              className="coaching-dialog-button coaching-dialog-button-danger px-4 py-2 text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeletingConversation || isStreaming}
              onClick={confirmDelete}
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
