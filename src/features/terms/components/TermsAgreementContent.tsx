import React from "react";
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Users,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
} from "lucide-react";

export function TermsAgreementContent() {
  return (
    <div className="terms-content space-y-6 text-[#2D2D2D] leading-relaxed text-sm md:text-base">
      {/* Introduction Card */}
      <section className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-5 md:p-6 transition-all">
        <div className="flex items-start gap-3.5">
          <div className="p-2 bg-amber-500/10 text-amber-700 rounded-lg shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-semibold text-[#1B1818] mb-1.5">
              Welcome to LeaderCoach
            </h2>
            <p className="text-[#4A4242] mb-3 leading-normal">
              LeaderCoach is an AI-supported leadership coaching companion
              designed to help you think more clearly, explore what may be
              influencing a situation, identify choices available to you, and
              determine useful next steps.
            </p>
            <p className="text-[#4A4242] leading-normal">
              LeaderCoach is designed around professional coaching principles,
              including respect for your autonomy, confidentiality, thoughtful
              inquiry, and your responsibility for your own decisions and
              actions.
            </p>
          </div>
        </div>
      </section>

      {/* Your Agency */}
      <section className="bg-white border border-[#E5E0DA] rounded-xl p-5 md:p-6 shadow-sm hover:border-[#D9D1CB] transition-all">
        <div className="flex items-start gap-3.5">
          <div className="p-2 bg-blue-500/10 text-blue-700 rounded-lg shrink-0 mt-0.5">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="space-y-2.5">
            <h2 className="text-base md:text-lg font-semibold text-[#1B1818]">
              Your Agency
            </h2>
            <p className="text-[#4A4242]">
              LeaderCoach will help you explore questions, perspectives,
              choices, and possible actions. It is not intended to make
              important decisions for you.
            </p>
            <p className="text-[#4A4242] font-medium">
              You remain responsible for your choices, decisions, and actions.
            </p>
            <div className="bg-gray-50 border-l-4 border-gray-300 p-3 rounded-r-lg text-xs md:text-sm text-[#5C5454]">
              LeaderCoach is a coaching and developmental resource. It is not a
              substitute for therapy or for medical, legal, financial, or other
              licensed professional advice.
            </div>
          </div>
        </div>
      </section>

      {/* Privacy and Confidentiality */}
      <section className="bg-white border border-[#E5E0DA] rounded-xl p-5 md:p-6 shadow-sm hover:border-[#D9D1CB] transition-all">
        <div className="flex items-start gap-3.5">
          <div className="p-2 bg-emerald-500/10 text-emerald-700 rounded-lg shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-3">
            <h2 className="text-base md:text-lg font-semibold text-[#1B1818]">
              Privacy and Confidentiality
            </h2>
            <p className="text-[#4A4242]">
              Your coaching conversations are private and will be treated as
              confidential within the boundaries described below.
            </p>
            <p className="text-[#4A4242]">
              LeaderCoach will not intentionally share the substance of your
              coaching conversations with other users or people outside the
              authorized coaching and administrative relationship.
            </p>
            <p className="text-[#4A4242]">
              To provide continuity from one conversation to another,
              LeaderCoach may retain your conversation history and create a
              developmental coaching summary capturing information such as:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {[
                "What you were working through",
                "Important insights or discoveries",
                "Clarity you gained",
                "Commitments or actions you chose",
                "Issues that remain unresolved",
                "Useful context for a future coaching conversation",
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 text-xs md:text-sm text-[#4A4242] bg-stone-50/80 p-2.5 rounded-lg border border-stone-200/60"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs md:text-sm text-[#6E6663] italic pt-1">
              This allows LeaderCoach to remember your developmental journey
              rather than treating every session as a new conversation.
            </p>
          </div>
        </div>
      </section>

      {/* Human Coaching and Supervision */}
      <section className="bg-white border border-[#E5E0DA] rounded-xl p-5 md:p-6 shadow-sm hover:border-[#D9D1CB] transition-all">
        <div className="flex items-start gap-3.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-700 rounded-lg shrink-0 mt-0.5">
            <Users className="w-5 h-5" />
          </div>
          <div className="space-y-2.5">
            <h2 className="text-base md:text-lg font-semibold text-[#1B1818]">
              Human Coaching and Supervision
            </h2>
            <p className="text-[#4A4242]">
              During this pilot, authorized coaching supervision is part of the
              LeaderCoach experience.
            </p>
            <p className="text-[#4A4242]">
              Your designated human coach/supervisor—or, when no individual
              supervisor has been designated, the authorized LeaderCoach
              administrator—may review your developmental coaching summaries
              and, when reasonably necessary for coaching quality, continuity,
              safety, or system improvement, relevant portions of your coaching
              record.
            </p>
            <p className="text-[#4A4242]">
              This access is intended to support your development, maintain
              continuity between AI-supported and human coaching, and help
              ensure LeaderCoach is functioning as an effective and responsible
              coaching tool.
            </p>
            <div className="bg-amber-50/50 border border-amber-200/60 rounded-lg p-3 text-xs md:text-sm text-[#5C5454]">
              <strong>Note:</strong> Your information will not be used to
              secretly evaluate your job performance or distributed to managers,
              employers, colleagues, or other parties beyond the authorized
              coaching relationship unless that use has been clearly disclosed
              and agreed to beforehand.
            </div>
          </div>
        </div>
      </section>

      {/* Limits of Confidentiality */}
      <section className="bg-white border border-[#E5E0DA] rounded-xl p-5 md:p-6 shadow-sm hover:border-[#D9D1CB] transition-all">
        <div className="flex items-start gap-3.5">
          <div className="p-2 bg-rose-500/10 text-rose-700 rounded-lg shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base md:text-lg font-semibold text-[#1B1818]">
              Limits of Confidentiality
            </h2>
            <p className="text-[#4A4242]">
              Confidentiality may have exceptions when disclosure is required by
              applicable law or legal process, or when there is an imminent or
              likely risk of serious harm to you or another person.
            </p>
          </div>
        </div>
      </section>

      {/* Your Agreement */}
      <section className="bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-xl p-5 md:p-6 shadow-md">
        <div className="flex items-start gap-3.5">
          <div className="p-2 bg-white/10 text-amber-300 rounded-lg shrink-0 mt-0.5">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div className="space-y-3">
            <h2 className="text-base md:text-lg font-semibold text-white">
              Your Agreement
            </h2>
            <p className="text-stone-300 text-xs md:text-sm">
              By checking &ldquo;I agree&rdquo; or creating an account, you
              acknowledge that you understand:
            </p>
            <ul className="space-y-2">
              {[
                "The nature and purpose of LeaderCoach;",
                "That you retain responsibility for your decisions and actions;",
                "That coaching conversations and developmental summaries may be retained to provide continuity;",
                "That authorized coaching supervision may have access as described above; and",
                "The privacy and confidentiality boundaries of the LeaderCoach pilot.",
              ].map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs md:text-sm text-stone-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t border-white/15 text-xs md:text-sm font-medium text-amber-300">
              I have read and agree to the LeaderCoach Pilot Coaching & Privacy
              Agreement.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
