import { z } from "zod";

import { api } from "@/lib/api";

const summarySchema = z.object({
  id: z.string(),
  conversation_id: z.string(),
  presenting_focus: z.string().nullable(),
  primary_discovery: z.string().nullable(),
  developmental_theme: z.string().nullable(),
  commitment: z.string().nullable(),
  next_experiment: z.string().nullable(),
  follow_up_question: z.string().nullable(),
  coach_notes: z.string().nullable(),
  prior_session_continuity: z.string().nullable(),
  source_turn_count: z.number().int().nonnegative(),
  generation_status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CoachingSummary = z.infer<typeof summarySchema>;

export async function getCoachingSummaries(userId: string) {
  const response = await api.get(`/admin/users/${userId}/coaching-summaries`);
  return z.array(summarySchema).parse(response.data);
}
