"use client";

import { useQuery } from "@tanstack/react-query";
import { getUsers } from "../api/users.api";
import type { User } from "../types";

export const usersKey = ["admin", "users"] as const;

export function useUsers() {
  return useQuery<User[]>({
    queryKey: usersKey,
    queryFn: getUsers,
  });
}
