"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getProfile, updatePassword, updateProfile } from "../api/profile.api";

const profileKey = ["profile"] as const;
export function useProfile() {
  return useQuery({ queryKey: profileKey, queryFn: getProfile });
}
export function useProfileMutations() {
  const client = useQueryClient();
  return {
    update: useMutation({
      mutationFn: updateProfile,
      onSuccess: () => client.invalidateQueries({ queryKey: profileKey }),
    }),
    password: useMutation({ mutationFn: updatePassword }),
  };
}
