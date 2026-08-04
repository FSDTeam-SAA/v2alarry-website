"use client";

import { useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";

import { getConversationMessages, streamChat } from "../api/chat.api";
import type { CoachingMessage, SubmissionState } from "../types";
import {
  chatKeys,
  useConversationMessages,
  useConversations,
  useDeleteConversation,
} from "./useChat";

const NEW_SESSION_KEY = "new";

function createTemporaryId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Jess couldn’t respond just now.";
}

function getGreetingName(name: string | null | undefined) {
  const trimmedName = name?.trim();
  return trimmedName ? trimmedName.split(/\s+/u)[0] : null;
}

export function useCoachingWorkspace() {
  const router = useRouter();
  const params = useParams<{ conversationId?: string | string[] }>();
  const queryClient = useQueryClient();
  const { data: session, status: sessionStatus } = useSession();
  const conversationsQuery = useConversations();
  const activeConversationId =
    typeof params.conversationId === "string" ? params.conversationId : null;
  const messagesQuery = useConversationMessages(activeConversationId);
  const deleteConversation = useDeleteConversation();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [optimisticMessages, setOptimisticMessages] = useState<
    CoachingMessage[]
  >([]);
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    status: "idle",
  });
  const [streamError, setStreamError] = useState<string | null>(null);
  const streamController = useRef<AbortController | null>(null);
  const draftKey = activeConversationId ?? NEW_SESSION_KEY;
  const draft = drafts[draftKey] ?? "";

  const activeConversation = useMemo(
    () =>
      conversationsQuery.data?.find(
        (conversation) => conversation.id === activeConversationId,
      ) ?? null,
    [activeConversationId, conversationsQuery.data],
  );

  const messages = useMemo(
    () => [...(messagesQuery.data ?? []), ...optimisticMessages],
    [messagesQuery.data, optimisticMessages],
  );

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return conversationsQuery.data ?? [];

    return (conversationsQuery.data ?? []).filter((conversation) =>
      conversation.title.toLocaleLowerCase().includes(query),
    );
  }, [conversationsQuery.data, searchQuery]);

  const isStreaming =
    submissionState.status === "sending" ||
    submissionState.status === "streaming";

  function setDraft(value: string) {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [draftKey]: value,
    }));
  }

  function createNewSession() {
    if (isStreaming) return;
    setOptimisticMessages([]);
    setStreamError(null);
    setSubmissionState({ status: "idle" });
    setIsSearchOpen(false);
    router.push("/coaching/new");
  }

  function selectSession(conversationId: string) {
    if (isStreaming) return;
    setOptimisticMessages([]);
    setStreamError(null);
    setSubmissionState({ status: "idle" });
    setIsSearchOpen(false);
    router.push(`/coaching/${conversationId}`);
  }

  function toggleSearch() {
    setIsSearchOpen((isOpen) => !isOpen);
    setSearchQuery("");
  }

  async function refreshActiveConversation() {
    if (!activeConversationId) return;

    const refreshedMessages = await queryClient.fetchQuery({
      queryKey: chatKeys.messages(activeConversationId),
      queryFn: () => getConversationMessages(activeConversationId),
      staleTime: 0,
    });

    if (submissionState.status === "outcome-unknown") {
      const wasSaved = refreshedMessages.some(
        (message) =>
          message.role === "user" &&
          message.content === submissionState.draftSnapshot,
      );

      if (wasSaved) {
        setDraft("");
        setSubmissionState({ status: "idle" });
        setStreamError(null);
      } else {
        setDraft(submissionState.draftSnapshot);
        setSubmissionState({
          draftSnapshot: submissionState.draftSnapshot,
          status: "failed-before-accepted",
        });
      }
    }

    setOptimisticMessages([]);
  }

  async function removeConversation(conversationId: string) {
    await deleteConversation.mutateAsync(conversationId);
    queryClient.removeQueries({ queryKey: chatKeys.messages(conversationId) });
    setDrafts((currentDrafts) => {
      const remainingDrafts = { ...currentDrafts };
      delete remainingDrafts[conversationId];
      return remainingDrafts;
    });

    if (activeConversationId === conversationId) {
      createNewSession();
    }
  }

  async function copySubmittedMessage() {
    if (submissionState.status !== "outcome-unknown" || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(submissionState.draftSnapshot);
  }

  async function sendMessage() {
    const content = draft.trim();
    if (
      !content ||
      isStreaming ||
      submissionState.status === "outcome-unknown"
    ) {
      return false;
    }

    const conversationId = activeConversationId ?? undefined;
    const submissionDraftKey = draftKey;
    const userMessage: CoachingMessage = {
      content,
      createdAt: new Date().toISOString(),
      id: createTemporaryId("message"),
      role: "user",
    };
    const assistantMessage: CoachingMessage = {
      content: "",
      createdAt: new Date().toISOString(),
      id: createTemporaryId("reply"),
      isStreaming: true,
      role: "assistant",
    };
    const controller = new AbortController();
    let requestAccepted = false;
    let receivedToken = false;
    let completion:
      | {
          assistantMessageId: string;
          conversationId: string;
          userMessageId: string;
        }
      | undefined;

    streamController.current = controller;
    setSubmissionState({ draftSnapshot: content, status: "sending" });
    setStreamError(null);
    setOptimisticMessages([userMessage, assistantMessage]);

    try {
      await streamChat(
        { conversationId, message: content, stream: true },
        {
          onAccepted: () => {
            requestAccepted = true;
            setDrafts((currentDrafts) => ({
              ...currentDrafts,
              [submissionDraftKey]: "",
            }));
            setSubmissionState({
              conversationId,
              draftSnapshot: content,
              status: "streaming",
            });
          },
          onDone: (event) => {
            completion = event;
          },
          onToken: (token) => {
            receivedToken = true;
            setOptimisticMessages((currentMessages) =>
              currentMessages.map((message) =>
                message.id === assistantMessage.id
                  ? { ...message, content: `${message.content}${token}` }
                  : message,
              ),
            );
          },
        },
        controller.signal,
      );

      const persistedCompletion = completion;
      if (!persistedCompletion) {
        throw new Error("The response ended before it was saved");
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: chatKeys.conversations }),
        queryClient.invalidateQueries({
          queryKey: chatKeys.messages(persistedCompletion.conversationId),
        }),
      ]);
      await queryClient.fetchQuery({
        queryKey: chatKeys.messages(persistedCompletion.conversationId),
        queryFn: () =>
          getConversationMessages(persistedCompletion.conversationId),
        staleTime: 0,
      });
      setOptimisticMessages([]);
      setSubmissionState({ status: "completed" });
      router.replace(`/coaching/${persistedCompletion.conversationId}`);
      return true;
    } catch (error) {
      if (requestAccepted || receivedToken || controller.signal.aborted) {
        setSubmissionState({
          conversationId,
          draftSnapshot: content,
          status: "outcome-unknown",
        });
        setStreamError(
          "The connection was interrupted. Jess may have saved part of this exchange.",
        );
      } else {
        setOptimisticMessages([]);
        setDrafts((currentDrafts) => ({
          ...currentDrafts,
          [submissionDraftKey]: content,
        }));
        setSubmissionState({
          draftSnapshot: content,
          status: "failed-before-accepted",
        });
        setStreamError(getErrorMessage(error));
      }
      return false;
    } finally {
      if (streamController.current === controller) {
        streamController.current = null;
      }
    }
  }

  return {
    activeConversationId,
    activeTitle: activeConversation?.title ?? "New coaching session",
    accountName:
      sessionStatus === "authenticated" ? session.user.name : "Account",
    conversationsError: conversationsQuery.isError,
    copySubmittedMessage,
    createNewSession,
    draft,
    filteredConversations,
    greetingName:
      sessionStatus === "authenticated"
        ? getGreetingName(session.user.name)
        : null,
    hasActiveConversation:
      Boolean(activeConversationId) || optimisticMessages.length > 0,
    isDeletingConversation: deleteConversation.isPending,
    isHistoryLoading: conversationsQuery.isLoading,
    isSearchOpen,
    isStreaming,
    isTranscriptError: messagesQuery.isError,
    isTranscriptLoading:
      Boolean(activeConversationId) && messagesQuery.isLoading,
    messages,
    refreshActiveConversation,
    removeConversation,
    searchQuery,
    selectSession,
    sendMessage,
    sessionStatus,
    setDraft,
    setSearchQuery,
    streamError,
    submissionState,
    toggleSearch,
  };
}
