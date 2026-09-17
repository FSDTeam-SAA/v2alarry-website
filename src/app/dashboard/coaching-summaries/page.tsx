import { Suspense } from "react";
import { CoachingSummariesPage } from "@/features/dashboard/components/CoachingSummariesPage";

export default function CoachingSummariesRoute() {
  return (
    <Suspense fallback={<div className="p-8">Loading summaries…</div>}>
      <CoachingSummariesPage />
    </Suspense>
  );
}
