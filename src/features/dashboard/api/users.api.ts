import { z } from "zod";

import { api } from "@/lib/api";
import type { User } from "../types";

const backendUserSchema = z.object({
  id: z.number().int(),
  email: z.string().email(),
  full_name: z.string().nullable().optional(),
  role: z.string(),
  is_active: z.boolean(),
  created_at: z.string().nullable().optional(),
});

export type BackendUser = z.infer<typeof backendUserSchema>;

export async function getUsers(): Promise<User[]> {
  try {
    const response = await api.get("/users/");
    const parsed = z.array(backendUserSchema).parse(response.data);

    return parsed.map((item) => ({
      id: String(item.id),
      name: item.full_name || item.email.split("@")[0],
      email: item.email,
      registeredAt: item.created_at
        ? new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(new Date(item.created_at))
        : "Recently",
      lastActive: item.is_active ? "Active" : "Inactive",
      sessions: 0,
    }));
  } catch (error) {
    console.error("Failed to fetch users from backend:", error);
    return [];
  }
}
