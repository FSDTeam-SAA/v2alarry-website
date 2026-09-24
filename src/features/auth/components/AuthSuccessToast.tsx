"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { consumeLoginSuccessToast } from "@/features/auth/lib/login-success";

export function AuthSuccessToast() {
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && consumeLoginSuccessToast()) {
      toast.success("Welcome back.");
    }
  }, [status]);

  return null;
}
