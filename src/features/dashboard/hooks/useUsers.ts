"use client";

import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../api/users.api";
import { users as fallbackUsers } from "../dashboard-data";
import type { User } from "../types";

export const usersKey = ["admin", "users"] as const;

export function useUsers() {
  return useQuery<User[]>({
    queryKey: usersKey,
    queryFn: async () => {
      const backendUsers = await getUsers();
      if (backendUsers && backendUsers.length > 0) {
        // Merge real backend users with demo users (avoiding duplicates by email)
        const emails = new Set(backendUsers.map((u) => u.email.toLowerCase()));
        const uniqueFallback = fallbackUsers.filter(
          (u) => !emails.has(u.email.toLowerCase()),
        );
        return [...backendUsers, ...uniqueFallback];
      }
      return fallbackUsers;
    },
  });
}
