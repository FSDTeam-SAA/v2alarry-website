import { z } from "zod";

import { api } from "@/lib/api";
import type { User } from "../types";

const backendUserSchema = z.object({
  id: z.number().int(),
  email: z.string().email(),
  full_name: z.string().nullable().optional(),
  role: z.enum(["admin", "user"]),
  is_enabled: z.boolean(),
  registered_at: z.string(),
  last_coaching_activity: z.string().nullable(),
  session_count: z.number().int().nonnegative(),
  summary_count: z.number().int().nonnegative(),
});

export type BackendUser = z.infer<typeof backendUserSchema>;

export async function getUsers(): Promise<User[]> {
  const response = await api.get("/admin/users");
  return z.array(backendUserSchema).parse(response.data).map(toDashboardUser);
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function toDashboardUser(item: BackendUser): User {
  return {
    id: String(item.id),
    name: item.full_name || item.email.split("@")[0],
    email: item.email,
    registeredAt: dateFormatter.format(new Date(item.registered_at)),
    lastActive: item.last_coaching_activity
      ? dateFormatter.format(new Date(item.last_coaching_activity))
      : "Never",
    sessions: item.session_count,
    role: item.role,
    isEnabled: item.is_enabled,
    summaryCount: item.summary_count,
  };
}
