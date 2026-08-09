import { getSession } from "next-auth/react";
import { z } from "zod";

import { api } from "@/lib/api";

import type {
  CoachingConversation,
  CoachingMessage,
  CoachingStreamStage,
} from "../types";

const conversationSchema = z.object({
  created_at: z.string(),
  id: z.string(),
  message_count: z.number().int().nonnegative(),
  title: z.string(),
  updated_at: z.string(),
});

const messageSchema = z.object({
  content: z.string(),
  created_at: z.string(),
  id: z.string(),
  role: z.union([z.literal("assistant"), z.literal("user")]),
});

const streamEventSchema = z.discriminatedUnion("type", [
  z.object({
    status: z.enum([
      "accepted",
      "retrieving_context",
      "building_context",
      "generating_response",
    ]),
    type: z.literal("status"),
  }),
  z.object({ content: z.string(), type: z.literal("token") }),
  z.object({
    assistant_message_id: z.string().min(1),
    conversation_id: z.string().min(1),
    persisted: z.literal(true),
    type: z.literal("done"),
    user_message_id: z.string().min(1),
  }),
  z.object({ content: z.string(), type: z.literal("error") }),
]);

type StreamChatInput = {
  conversationId?: string;
  message: string;
  stream: true;
};

type StreamChatHandlers = {
  onAccepted?: () => void;
  onDone: (event: {
    assistantMessageId: string;
    conversationId: string;
    userMessageId: string;
  }) => void;
  onStatus?: (status: CoachingStreamStage) => void;
  onToken: (token: string) => void;
};

function toConversation(
  value: z.infer<typeof conversationSchema>,
): CoachingConversation {
  return {
    createdAt: value.created_at,
    id: value.id,
    messageCount: value.message_count,
    title: value.title,
    updatedAt: value.updated_at,
  };
}

function toMessage(value: z.infer<typeof messageSchema>): CoachingMessage {
  return {
    content: value.content,
    createdAt: value.created_at,
    id: value.id,
    role: value.role,
  };
}

export async function getConversations(): Promise<CoachingConversation[]> {
  const response = await api.get("/chat/conversations");
  return z.array(conversationSchema).parse(response.data).map(toConversation);
}

export async function getConversationMessages(
  conversationId: string,
): Promise<CoachingMessage[]> {
  const response = await api.get(
    `/chat/conversations/${conversationId}/messages`,
  );
  return z.array(messageSchema).parse(response.data).map(toMessage);
}

export async function deleteConversation(
  conversationId: string,
): Promise<void> {
  await api.delete(`/chat/conversations/${conversationId}`);
}

export async function streamChat(
  input: StreamChatInput,
  handlers: StreamChatHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const session = await getSession();

  if (!apiUrl || !session?.accessToken) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const response = await fetch(`${apiUrl}/chat/`, {
    body: JSON.stringify({
      conversation_id: input.conversationId,
      message: input.message,
      stream: input.stream,
    }),
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    signal,
  });

  if (!response.ok) {
    const payload: unknown = await response.json().catch(() => null);
    const detail = z.object({ detail: z.string() }).safeParse(payload);
    throw new Error(
      detail.success ? detail.data.detail : "Unable to send message",
    );
  }

  handlers.onAccepted?.();

  if (!response.body) {
    throw new Error("The chat stream was unavailable");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bufferedText = "";

  while (true) {
    const { done, value } = await reader.read();
    bufferedText += decoder.decode(value, { stream: !done });

    const frames = bufferedText.split(/\r?\n\r?\n/);
    bufferedText = frames.pop() ?? "";

    for (const frame of frames) {
      const payload = frame
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("\n");

      if (!payload || payload === "[DONE]") {
        continue;
      }

      const event = streamEventSchema.safeParse(JSON.parse(payload));
      if (!event.success) {
        throw new Error("The chat stream returned an invalid event");
      }

      if (event.data.type === "status") {
        handlers.onStatus?.(event.data.status);
      } else if (event.data.type === "token") {
        handlers.onToken(event.data.content);
      } else if (event.data.type === "done") {
        handlers.onDone({
          assistantMessageId: event.data.assistant_message_id,
          conversationId: event.data.conversation_id,
          userMessageId: event.data.user_message_id,
        });
      } else {
        throw new Error(event.data.content);
      }
    }

    if (done) {
      break;
    }
  }
}
