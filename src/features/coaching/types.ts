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

export type CoachingStreamStage =
  | "accepted"
  | "retrieving_context"
  | "building_context"
  | "generating_response";

export type SubmissionState =
  | { status: "idle" }
  | { draftSnapshot: string; status: "sending" }
  | {
      conversationId?: string;
      draftSnapshot: string;
      stage?: CoachingStreamStage;
      status: "streaming";
    }
  | { status: "completed" }
  | {
      conversationId?: string;
      draftSnapshot: string;
      status: "outcome-unknown";
    }
  | { draftSnapshot: string; status: "failed-before-response" };

export type CoachingConversation = {
  createdAt: string;
  id: string;
  messageCount: number;
  title: string;
  updatedAt: string;
};
