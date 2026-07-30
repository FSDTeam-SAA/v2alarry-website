"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { initialCoachingSessions } from "../coaching-data";
import type { CoachingMessage, CoachingSession } from "../types";

const storageKey = "leader-coach-sessions";

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createSessionTitle(message: string) {
  const words = message.trim().split(/\s+/).slice(0, 5).join(" ");

  return words
    ? `${words}${message.trim().split(/\s+/).length > 5 ? "…" : ""}`
    : "New coaching session";
}

function createCoachingReply(message: string) {
  const lowerCaseMessage = message.toLowerCase();

  if (lowerCaseMessage.includes("decision")) {
    return "Let’s make the decision more concrete. What are the two or three options you are weighing, and what matters most in choosing between them?";
  }

  if (lowerCaseMessage.includes("team") || lowerCaseMessage.includes("trust")) {
    return "Trust grows through clear expectations and reliable follow-through. What is one behavior you could model for the team this week?";
  }

  if (
    lowerCaseMessage.includes("conversation") ||
    lowerCaseMessage.includes("feedback")
  ) {
    return "Before the conversation, name the outcome you want and the one thing you need to say plainly. What would that sound like?";
  }

  return "That sounds worth exploring. What feels most important about this situation, and what would a useful next step look like?";
}

function isCoachingMessage(value: unknown): value is CoachingMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Record<string, unknown>;

  return (
    typeof message.id === "string" &&
    typeof message.content === "string" &&
    (message.role === "assistant" || message.role === "user") &&
    (message.attachments === undefined ||
      (Array.isArray(message.attachments) &&
        message.attachments.every(
          (attachment) => typeof attachment === "string",
        )))
  );
}

function isCoachingSession(value: unknown): value is CoachingSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as Record<string, unknown>;

  return (
    typeof session.id === "string" &&
    typeof session.title === "string" &&
    typeof session.dateLabel === "string" &&
    Array.isArray(session.messages) &&
    session.messages.every(isCoachingMessage)
  );
}

function readStoredSessions() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = window.localStorage.getItem(storageKey);

    if (!value) {
      return null;
    }

    const parsed: unknown = JSON.parse(value);

    return Array.isArray(parsed) && parsed.every(isCoachingSession)
      ? parsed
      : null;
  } catch {
    return null;
  }
}

export function useCoachingWorkspace() {
  const [sessions, setSessions] = useState<CoachingSession[]>(
    initialCoachingSessions,
  );
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingReplyCounts, setPendingReplyCounts] = useState<
    Record<string, number>
  >({});
  const [hasLoadedSessions, setHasLoadedSessions] = useState(false);
  const replyTimeouts = useRef<number[]>([]);

  useEffect(() => {
    const loadTimeout = window.setTimeout(() => {
      const storedSessions = readStoredSessions();

      if (storedSessions) {
        setSessions(storedSessions);
      }

      setHasLoadedSessions(true);
    });

    return () => window.clearTimeout(loadTimeout);
  }, []);

  useEffect(() => {
    if (hasLoadedSessions) {
      window.localStorage.setItem(storageKey, JSON.stringify(sessions));
    }
  }, [hasLoadedSessions, sessions]);

  useEffect(() => {
    const timeouts = replyTimeouts.current;

    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, []);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [activeSessionId, sessions],
  );

  const filteredSessions = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();

    if (!query) {
      return sessions;
    }

    return sessions.filter((session) => {
      const messageText = session.messages
        .map((message) => message.content)
        .join(" ");

      return `${session.title} ${messageText}`
        .toLocaleLowerCase()
        .includes(query);
    });
  }, [searchQuery, sessions]);

  function createNewSession() {
    setActiveSessionId(null);
    setDraft("");
    setAttachments([]);
    setIsSearchOpen(false);
  }

  function selectSession(sessionId: string) {
    setActiveSessionId(sessionId);
    setDraft("");
    setAttachments([]);
    setIsSearchOpen(false);
  }

  function toggleSearch() {
    setIsSearchOpen((isOpen) => !isOpen);
    setSearchQuery("");
  }

  function removeAttachment(attachment: string) {
    setAttachments((currentAttachments) =>
      currentAttachments.filter((item) => item !== attachment),
    );
  }

  function addAttachments(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    setAttachments((currentAttachments) => [
      ...currentAttachments,
      ...Array.from(files).map((file) => file.name),
    ]);
  }

  function sendMessage(message = draft) {
    const content = message.trim();

    if (!content && attachments.length === 0) {
      return false;
    }

    const userMessage: CoachingMessage = {
      attachments,
      content: content || "Shared a file for reflection.",
      id: createId("message"),
      role: "user",
    };
    const sessionId = activeSessionId ?? createId("session");

    setSessions((currentSessions) => {
      const existingSession = currentSessions.find(
        (session) => session.id === sessionId,
      );

      if (!existingSession) {
        return [
          {
            dateLabel: "Just now",
            id: sessionId,
            messages: [userMessage],
            title: createSessionTitle(content),
          },
          ...currentSessions,
        ];
      }

      const updatedSession = {
        ...existingSession,
        dateLabel: "Just now",
        messages: [...existingSession.messages, userMessage],
        title:
          existingSession.messages.length === 0
            ? createSessionTitle(content)
            : existingSession.title,
      };

      return [
        updatedSession,
        ...currentSessions.filter((session) => session.id !== sessionId),
      ];
    });

    setActiveSessionId(sessionId);
    setDraft("");
    setAttachments([]);
    setPendingReplyCounts((currentCounts) => ({
      ...currentCounts,
      [sessionId]: (currentCounts[sessionId] ?? 0) + 1,
    }));

    const timeout = window.setTimeout(() => {
      setSessions((currentSessions) =>
        currentSessions.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                messages: [
                  ...session.messages,
                  {
                    content: createCoachingReply(content),
                    id: createId("reply"),
                    role: "assistant",
                  },
                ],
              }
            : session,
        ),
      );
      setPendingReplyCounts((currentCounts) => {
        const count = currentCounts[sessionId] ?? 0;

        if (count <= 1) {
          const remainingCounts = { ...currentCounts };

          delete remainingCounts[sessionId];

          return remainingCounts;
        }

        return { ...currentCounts, [sessionId]: count - 1 };
      });
    }, 550);

    replyTimeouts.current.push(timeout);

    return true;
  }

  return {
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
    sessions,
    setDraft,
    setSearchQuery,
    toggleSearch,
  };
}
