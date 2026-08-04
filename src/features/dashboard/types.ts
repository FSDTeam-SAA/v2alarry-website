export type DashboardView =
  | "overview"
  | "users"
  | "knowledge-base"
  | "settings";

export type User = {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
  lastActive: string;
  sessions: number;
};

export type KnowledgeDocument = {
  id: string;
  name: string;
  size: string;
  category: string;
  uploadedAt: string;
};
