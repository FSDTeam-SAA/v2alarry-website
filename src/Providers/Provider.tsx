// src/Providers/Provider.tsx

"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

import { SessionExpiryBoundary } from "@/features/auth/components/SessionExpiryBoundary";
import { AuthSuccessToast } from "@/features/auth/components/AuthSuccessToast";

export default function Provider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthSuccessToast />
      <SessionExpiryBoundary>{children}</SessionExpiryBoundary>
    </SessionProvider>
  );
}
