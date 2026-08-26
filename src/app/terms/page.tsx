import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { Metadata } from "next";

import { TermsAgreementContent } from "@/features/terms/components/TermsAgreementContent";

export const metadata: Metadata = {
  title: "Terms & Conditions | LeaderCoach",
  description: "LeaderCoach Pilot Coaching & Privacy Agreement",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1B1818] flex flex-col font-sans selection:bg-amber-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-[#FDFCFB]/90 backdrop-blur-md border-b border-[#E5E0DA]/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/signup" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden flex items-center justify-center">
              <Image
                src="/images/leader-coach-logo.png"
                alt="LeaderCoach Logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-base sm:text-lg text-[#1B1818] tracking-tight">
                LeaderCoach
              </span>
              <span className="text-[11px] text-[#86807B] uppercase tracking-wider font-medium">
                Pilot Program
              </span>
            </div>
          </Link>

          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#4A4242] hover:text-[#1B1818] bg-white border border-[#D9D1CB] hover:border-[#86807B] px-3.5 py-1.5 sm:py-2 rounded-lg transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign Up</span>
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="space-y-3 pb-4 border-b border-[#E5E0DA]">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              Pilot Agreement & Privacy Terms
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#1B1818]">
              Pilot Coaching & Privacy Agreement
            </h1>
            <p className="text-sm sm:text-base text-[#5C5454] max-w-2xl leading-relaxed">
              Please review the terms and confidentiality standards that govern
              your experience as a participant in the LeaderCoach pilot.
            </p>
          </div>

          {/* Terms Content */}
          <TermsAgreementContent />

          {/* Footer actions */}
          <div className="pt-6 pb-8 border-t border-[#E5E0DA] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#86807B]">
              Last updated: February 2026 • LeaderCoach Pilot Program
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-medium bg-[#252222] text-[#FDFCFB] hover:bg-[#3D3737] transition-all shadow-sm"
              >
                Return to Sign Up
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
