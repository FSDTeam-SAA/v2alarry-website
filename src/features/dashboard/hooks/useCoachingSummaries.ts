"use client";

import { useQuery } from "@tanstack/react-query";
import { getCoachingSummaries } from "../api/coaching-summaries.api";

export function useCoachingSummaries(userId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "users", userId, "coaching-summaries"],
    queryFn: () => getCoachingSummaries(userId as string),
    enabled: Boolean(userId),
  });
}
