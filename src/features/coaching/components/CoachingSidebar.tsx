"use client";

import Image from "next/image";
import { Plus, Search, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import type { CoachingSession } from "../types";

type CoachingSidebarProps = {
  activeSessionId: string | null;
  filteredSessions: CoachingSession[];
  isSearchOpen: boolean;
  onCreateSession: () => void;
  onSearchQueryChange: (query: string) => void;
  onSelectSession: (sessionId: string) => void;
  onToggleSearch: () => void;
  searchQuery: string;
};

export function CoachingSidebar({
  activeSessionId,
  filteredSessions,
  isSearchOpen,
  onCreateSession,
  onSearchQueryChange,
  onSelectSession,
  onToggleSearch,
  searchQuery,
}: CoachingSidebarProps) {
  const historyTitle = isSearchOpen ? "Search sessions" : "Coaching History";

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
          {isSearchOpen && (
            <div className="coaching-search-field">
              <label className="sr-only" htmlFor="session-search">
                Search coaching sessions
              </label>
              <Search aria-hidden="true" size={16} />
              <input
                autoFocus
                id="session-search"
                onChange={(event) => onSearchQueryChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    onToggleSearch();
                  }
                }}
                placeholder="Search by topic or message"
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
          )}
          {filteredSessions.length > 0 ? (
            <ul>
              {filteredSessions.map((session) => (
                <li key={session.id}>
                  <button
                    aria-current={
                      activeSessionId === session.id ? "page" : undefined
                    }
                    className={`coaching-history-item${activeSessionId === session.id ? " coaching-history-item-active" : ""}`}
                    onClick={() => onSelectSession(session.id)}
                    title={session.title}
                    type="button"
                  >
                    <span>{session.title}</span>
                    <time>{session.dateLabel}</time>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="coaching-search-empty" role="status">
              No sessions match “{searchQuery}”. Try a different topic.
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
              <dd>Stored in this browser</dd>
            </div>
          </dl>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
