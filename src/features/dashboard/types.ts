export type DashboardView =
  | "overview"
  | "users"
  | "coaching-summaries"
  | "knowledge-base"
  | "settings";

export type User = {
  id: string;
  name: string;
  email: string;
  registeredAt: string;
  lastActive: string;
  sessions: number;
  role: "admin" | "user";
  isEnabled: boolean;
  summaryCount: number;
};

export type DailyActivity = {
  date: string;
  activeUsers: number;
};

export type DashboardData = {
  totals: {
    users: number;
    activeUsers: number;
    coachingSessions: number;
    documents: number;
  };
  currentWeek: DailyActivity[];
  previousWeek: DailyActivity[];
  recentUsers: User[];
};

export type KnowledgeDocument = {
  id: string;
  name: string;
  size: string;
  category: string;
  uploadedAt: string;
};
