"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { acceptCurrentAgreement } from "../api/agreements.api";
import { CURRENT_AGREEMENT_VERSION } from "../agreement";
import { TermsAgreementContent } from "./TermsAgreementContent";

export function AgreementGate() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const accept = async () => {
    setIsSubmitting(true);
    setError(undefined);
    try {
      await acceptCurrentAgreement();
      await update({ acceptedAgreementVersion: CURRENT_AGREEMENT_VERSION });
      router.replace(
        session?.user.role === "admin" ? "/dashboard" : "/coaching/new",
      );
      router.refresh();
    } catch {
      setError("We could not record your acceptance. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f5f2] px-4 py-10 text-[#1b1818]">
      <div className="mx-auto max-w-3xl rounded-xl border border-[#e5e0da] bg-white p-5 shadow-sm md:p-8">
        <h1 className="text-2xl font-semibold">Coaching & Privacy Agreement</h1>
        <p className="mt-2 text-sm text-[#6e6663]">
          Review and accept the current pilot agreement before continuing.
        </p>
        <div className="mt-6 max-h-[62vh] overflow-y-auto pr-2">
          <TermsAgreementContent />
        </div>
        {error ? (
          <p className="mt-4 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end">
          <Button disabled={isSubmitting} onClick={() => void accept()}>
            {isSubmitting ? "Recording acceptance…" : "I Agree & Continue"}
          </Button>
        </div>
      </div>
    </main>
  );
}
