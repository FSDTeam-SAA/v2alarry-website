import { z } from "zod";

import { api } from "@/lib/api";
import type { DashboardData } from "../types";
import { toDashboardUser } from "./users.api";

const userSchema = z.object({
  id: z.number().int(),
  email: z.string().email(),
  full_name: z.string(),
  role: z.enum(["admin", "user"]),
  registered_at: z.string(),
  last_coaching_activity: z.string().nullable(),
  is_enabled: z.boolean(),
  session_count: z.number().int().nonnegative(),
  summary_count: z.number().int().nonnegative(),
});
const activitySchema = z.object({
  date: z.string(),
  active_users: z.number().int().nonnegative(),
});
const dashboardSchema = z.object({
  totals: z.object({
    users: z.number().int().nonnegative(),
    active_users: z.number().int().nonnegative(),
    coaching_sessions: z.number().int().nonnegative(),
    documents: z.number().int().nonnegative(),
  }),
  current_week: z.array(activitySchema).length(7),
  previous_week: z.array(activitySchema).length(7),
  recent_users: z.array(userSchema),
});

export async function getDashboard(): Promise<DashboardData> {
  const response = await api.get("/admin/dashboard");
  const data = dashboardSchema.parse(response.data);
  const activity = (values: z.infer<typeof activitySchema>[]) =>
    values.map((value) => ({
      date: value.date,
      activeUsers: value.active_users,
    }));
  return {
    totals: {
      users: data.totals.users,
      activeUsers: data.totals.active_users,
      coachingSessions: data.totals.coaching_sessions,
      documents: data.totals.documents,
    },
    currentWeek: activity(data.current_week),
    previousWeek: activity(data.previous_week),
    recentUsers: data.recent_users.map(toDashboardUser),
  };
}
