export type CoachingMessage = {
  attachments?: string[];
  content: string;
  id: string;
  role: "assistant" | "user";
};

export type CoachingSession = {
  dateLabel: string;
  id: string;
  messages: CoachingMessage[];
  title: string;
};
