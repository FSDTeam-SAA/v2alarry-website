"use client";

import { Pencil, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useProfile, useProfileMutations } from "../hooks/useProfile";
import { DashboardShell } from "./DashboardShell";

const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(255),
  email: z.string().email("Enter a valid email"),
});
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must contain at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match",
  });
type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export function SettingsPage() {
  const [editing, setEditing] = useState(false);
  const profile = useProfile();
  const mutations = useProfileMutations();
  const profileForm = useForm<ProfileValues>();
  const passwordForm = useForm<PasswordValues>();
  useEffect(() => {
    if (profile.data)
      profileForm.reset({
        fullName: profile.data.fullName,
        email: profile.data.email,
      });
  }, [profile.data, profileForm]);
  const saveProfile = async (values: ProfileValues) => {
    const result = profileSchema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue) =>
        profileForm.setError(issue.path[0] as keyof ProfileValues, {
          message: issue.message,
        }),
      );
      return;
    }
    try {
      await mutations.update.mutateAsync(result.data);
      setEditing(false);
      toast.success("Profile updated.");
    } catch {
      toast.error("Unable to update profile. The email may already be in use.");
    }
  };
  const savePassword = async (values: PasswordValues) => {
    const result = passwordSchema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue) =>
        passwordForm.setError(issue.path[0] as keyof PasswordValues, {
          message: issue.message,
        }),
      );
      return;
    }
    try {
      await mutations.password.mutateAsync({
        currentPassword: result.data.currentPassword,
        newPassword: result.data.newPassword,
      });
      passwordForm.reset();
      toast.success("Password changed.");
    } catch {
      toast.error(
        "Unable to change password. Check your current password and try again.",
      );
    }
  };
  return (
    <DashboardShell title="Settings">
      <div className="space-y-6 p-6">
        {profile.isLoading ? (
          <div className="rounded-lg border p-8 text-center" aria-busy="true">
            Loading profile…
          </div>
        ) : profile.isError ? (
          <div className="rounded-lg border p-8 text-center">
            <p className="mb-3 text-[#b42318]">Unable to load profile.</p>
            <button
              type="button"
              onClick={() => profile.refetch()}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        ) : (
          <>
            <section className="flex items-center gap-6 rounded-lg border border-[#dfe3e8] p-5">
              <Image
                src="/images/jane-cooper-avatar.png"
                alt={profile.data?.fullName ?? "Administrator"}
                width={96}
                height={96}
                className="size-24 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[#153326]">
                    {profile.data?.fullName}
                  </p>
                  <span className="rounded-full bg-[#edf0ee] px-2 py-1 text-xs capitalize">
                    {profile.data?.role}
                  </span>
                </div>
                <p className="mt-2 text-[#728078]">{profile.data?.email}</p>
              </div>
            </section>
            <form
              onSubmit={profileForm.handleSubmit(saveProfile)}
              className="rounded-lg border border-[#dfe3e8] p-5"
            >
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-black">
                  Personal Information
                </h2>
                <button
                  type="button"
                  onClick={() => setEditing((value) => !value)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#f7b626] px-5 font-medium hover:bg-[#ffc84c]"
                >
                  <Pencil size={20} />
                  Edit
                </button>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label>
                  Full Name
                  <input
                    disabled={!editing}
                    {...profileForm.register("fullName")}
                    className="mt-2 h-13 w-full rounded-lg border border-[#dfe3e8] bg-[#f7f9fb] px-4 disabled:text-[#91a1ac]"
                  />
                  {profileForm.formState.errors.fullName && (
                    <span className="mt-1 block text-xs text-red-600">
                      {profileForm.formState.errors.fullName.message}
                    </span>
                  )}
                </label>
                <label>
                  Email Address
                  <input
                    disabled={!editing}
                    type="email"
                    {...profileForm.register("email")}
                    className="mt-2 h-13 w-full rounded-lg border border-[#dfe3e8] bg-[#f7f9fb] px-4 disabled:text-[#91a1ac]"
                  />
                  {profileForm.formState.errors.email && (
                    <span className="mt-1 block text-xs text-red-600">
                      {profileForm.formState.errors.email.message}
                    </span>
                  )}
                </label>
              </div>
              {editing && (
                <div className="mt-6 flex justify-end">
                  <button
                    disabled={mutations.update.isPending}
                    className="min-h-12 rounded-lg bg-[#f7b626] px-6 font-semibold hover:bg-[#ffc84c] disabled:opacity-50"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>
            <form
              onSubmit={passwordForm.handleSubmit(savePassword)}
              className="rounded-lg border border-[#dfe3e8] p-5"
            >
              <h2 className="mb-7 text-2xl font-semibold text-black">
                Change password
              </h2>
              <div className="grid gap-5 lg:grid-cols-3">
                {(
                  [
                    ["currentPassword", "Current Password"],
                    ["newPassword", "New Password"],
                    ["confirmPassword", "Confirm New Password"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <input
                      type="password"
                      autoComplete={
                        key === "currentPassword"
                          ? "current-password"
                          : "new-password"
                      }
                      {...passwordForm.register(key)}
                      className="mt-2 h-13 w-full rounded-lg border border-[#dfe3e8] bg-[#f7f9fb] px-4"
                    />
                    {passwordForm.formState.errors[key] && (
                      <span className="mt-1 block text-xs text-red-600">
                        {passwordForm.formState.errors[key]?.message}
                      </span>
                    )}
                  </label>
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  disabled={mutations.password.isPending}
                  className="min-h-12 rounded-lg bg-[#f7b626] px-6 font-semibold hover:bg-[#ffc84c] disabled:opacity-50"
                >
                  Save Change
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
