"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { getConversationMessages, streamChat } from "../api/chat.api";
import type { CoachingMessage } from "../types";
import {
  chatKeys,
  useConversationMessages,
  useConversations,
  useDeleteConversation,
} from "./useChat";

function createTemporaryId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createConversationTitle(message: string) {
  const words = message.trim().split(/\s+/).slice(0, 5).join(" ");
  return words || "New coaching session";
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Unable to complete the response";
}

export function useCoachingWorkspace() {
  const queryClient = useQueryClient();
  const conversationsQuery = useConversations();
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const messagesQuery = useConversationMessages(activeConversationId);
  const deleteConversation = useDeleteConversation();
  const [draft, setDraft] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [optimisticMessages, setOptimisticMessages] = useState<
    CoachingMessage[]
  >([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const streamController = useRef<AbortController | null>(null);

  useEffect(() => () => streamController.current?.abort(), []);

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

    return (conversationsQuery.data ?? []).filter((conversation) => {
      const loadedMessages =
        conversation.id === activeConversationId
          ? messages
          : queryClient.getQueryData<CoachingMessage[]>(
              chatKeys.messages(conversation.id),
            );
      const messageText =
        loadedMessages?.map((message) => message.content).join(" ") ?? "";

      return `${conversation.title} ${messageText}`
        .toLocaleLowerCase()
        .includes(query);
    });
  }, [
    activeConversationId,
    conversationsQuery.data,
    messages,
    queryClient,
    searchQuery,
  ]);

  function createNewSession() {
    setActiveConversationId(null);
    setOptimisticMessages([]);
    setDraft("");
    setStreamError(null);
    setIsSearchOpen(false);
  }

  function selectSession(conversationId: string) {
    if (isStreaming) return;
    setActiveConversationId(conversationId);
    setOptimisticMessages([]);
    setDraft("");
    setStreamError(null);
    setIsSearchOpen(false);
  }

  function toggleSearch() {
    setIsSearchOpen((isOpen) => !isOpen);
    setSearchQuery("");
  }

  async function refreshActiveConversation() {
    if (!activeConversationId) return;
    await queryClient.invalidateQueries({
      queryKey: chatKeys.messages(activeConversationId),
    });
    await messagesQuery.refetch();
    setOptimisticMessages([]);
    setStreamError(null);
  }

  async function removeConversation(conversationId: string) {
    await deleteConversation.mutateAsync(conversationId);
    queryClient.removeQueries({ queryKey: chatKeys.messages(conversationId) });

    if (activeConversationId === conversationId) {
      createNewSession();
    }
  }

  async function sendMessage() {
    const content = draft.trim();
    if (!content || isStreaming) return false;

    const conversationId = activeConversationId;
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
    let receivedToken = false;
    const completionRef = {
      current: null as { conversationId: string } | null,
    };

    streamController.current = controller;
    setDraft("");
    setIsStreaming(true);
    setStreamError(null);
    setOptimisticMessages([userMessage, assistantMessage]);

    try {
      await streamChat(
        {
          conversationId: conversationId ?? undefined,
          message: content,
          stream: true,
        },
        {
          onDone: (event) => {
            completionRef.current = { conversationId: event.conversationId };
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

      if (!completionRef.current) {
        throw new Error("The response ended before it was saved");
      }
      const completion = completionRef.current;

      setActiveConversationId(completion.conversationId);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: chatKeys.conversations }),
        queryClient.invalidateQueries({
          queryKey: chatKeys.messages(completion.conversationId),
        }),
      ]);
      await queryClient.fetchQuery({
        queryKey: chatKeys.messages(completion.conversationId),
        queryFn: () => getConversationMessages(completion.conversationId),
      });
      setOptimisticMessages([]);
    } catch (error) {
      if (controller.signal.aborted) return false;

      setDraft(content);
      setStreamError(
        receivedToken
          ? "The response was interrupted. Refresh this conversation to check what was saved."
          : getErrorMessage(error),
      );
      if (!receivedToken) {
        setOptimisticMessages([]);
      }
      if (conversationId) {
        await queryClient.invalidateQueries({
          queryKey: chatKeys.messages(conversationId),
        });
      }
      return false;
    } finally {
      if (streamController.current === controller) {
        streamController.current = null;
      }
      setIsStreaming(false);
    }

    return true;
  }

  return {
    activeConversationId,
    activeTitle:
      activeConversation?.title ??
      createConversationTitle(messages[0]?.content ?? ""),
    conversationsError: conversationsQuery.isError,
    createNewSession,
    draft,
    filteredConversations,
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
    setDraft,
    setSearchQuery,
    streamError,
    toggleSearch,
  };
}
