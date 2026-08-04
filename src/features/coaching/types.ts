export type CoachingMessage = {
  content: string;
  createdAt: string;
  id: string;
  isStreaming?: boolean;
  role: "assistant" | "user";
};

export type CoachingConversation = {
  createdAt: string;
  id: string;
  messageCount: number;
  title: string;
  updatedAt: string;
};
