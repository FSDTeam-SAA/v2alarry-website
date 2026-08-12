"use client";

import { signOut } from "next-auth/react";

import { clearSessionDraft } from "./session-expiry";

export async function logout(): Promise<void> {
  clearSessionDraft();
  await signOut({ callbackUrl: "/login" });
}
