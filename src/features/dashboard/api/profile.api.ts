import { z } from "zod";

import { api } from "@/lib/api";

const profileSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  full_name: z.string(),
  role: z.string(),
  is_active: z.boolean(),
});

export type Profile = {
  id: string;
  fullName: string;
  email: string;
  role: string;
};
const toProfile = (value: z.infer<typeof profileSchema>): Profile => ({
  id: String(value.id),
  fullName: value.full_name,
  email: value.email,
  role: value.role,
});

export async function getProfile(): Promise<Profile> {
  const response = await api.get("/users/me");
  return toProfile(profileSchema.parse(response.data));
}
export async function updateProfile(
  input: Pick<Profile, "fullName" | "email">,
): Promise<Profile> {
  const response = await api.patch("/users/me", {
    full_name: input.fullName,
    email: input.email,
  });
  return toProfile(profileSchema.parse(response.data));
}
export async function updatePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await api.post("/users/me/password", {
    current_password: input.currentPassword,
    new_password: input.newPassword,
  });
}
