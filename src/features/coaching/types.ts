export type CoachingMessage = {
  content: string;
  createdAt: string;
  id: string;
  isStreaming?: boolean;
  role: "assistant" | "user";
};

export type CoachingStarter = {
  draft: string;
  label: string;
};

export type SubmissionState =
  | { status: "idle" }
  | { draftSnapshot: string; status: "sending" }
  | { conversationId?: string; draftSnapshot: string; status: "streaming" }
  | { status: "completed" }
  | {
      conversationId?: string;
      draftSnapshot: string;
      status: "outcome-unknown";
    }
  | { draftSnapshot: string; status: "failed-before-accepted" };

export type CoachingConversation = {
  createdAt: string;
  id: string;
  messageCount: number;
  title: string;
  updatedAt: string;
};
