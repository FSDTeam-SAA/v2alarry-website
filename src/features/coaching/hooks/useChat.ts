"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteConversation,
  getConversationMessages,
  getConversations,
} from "../api/chat.api";

export const chatKeys = {
  conversations: ["chat", "conversations"] as const,
  messages: (conversationId: string) =>
    ["chat", "conversations", conversationId, "messages"] as const,
};

export function useConversations() {
  return useQuery({
    queryKey: chatKeys.conversations,
    queryFn: getConversations,
  });
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    enabled: Boolean(conversationId),
    queryKey: chatKeys.messages(conversationId ?? "new"),
    queryFn: () => getConversationMessages(conversationId!),
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConversation,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations }),
  });
}
