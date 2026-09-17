"use client";

import { RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { useCoachingSummaries } from "../hooks/useCoachingSummaries";
import { useUsers } from "../hooks/useUsers";
import { DashboardShell } from "./DashboardShell";

const summaryFields = [
  ["presenting_focus", "Presenting focus"],
  ["primary_discovery", "Primary discovery"],
  ["developmental_theme", "Supported developmental theme"],
  ["commitment", "Commitment"],
  ["next_experiment", "Next experiment"],
  ["follow_up_question", "Follow-up question"],
  ["prior_session_continuity", "Prior-session continuity"],
] as const;

export function CoachingSummariesPage() {
  const searchParams = useSearchParams();
  const [selectedUserId, setSelectedUserId] = useState(
    searchParams.get("user") ?? "",
  );
  const users = useUsers();
  const summaries = useCoachingSummaries(selectedUserId || undefined);
  const selectedUser = users.data?.find((user) => user.id === selectedUserId);
  const chronological = useMemo(
    () => [...(summaries.data ?? [])].reverse(),
    [summaries.data],
  );

  return (
    <DashboardShell title="Coaching Summaries">
      <div className="space-y-6 p-6">
        <section className="rounded-lg border border-[#e5e7eb] bg-white p-5">
          <label
            className="block max-w-lg text-sm font-medium"
            htmlFor="summary-user"
          >
            Select a user
          </label>
          <select
            id="summary-user"
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.target.value)}
            className="mt-2 min-h-12 w-full max-w-lg rounded-lg border border-[#dfe3e8] bg-white px-3"
          >
            <option value="">Choose a user</option>
            {(users.data ?? []).map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          {users.isError ? (
            <p className="mt-3 text-sm text-red-700" role="alert">
              Unable to load users.{" "}
              <button className="underline" onClick={() => users.refetch()}>
                Retry
              </button>
            </p>
          ) : null}
        </section>

        {!selectedUserId ? (
          <div className="rounded-lg border border-dashed p-10 text-center text-[#6a717f]">
            Select a user to review their structured coaching summaries.
          </div>
        ) : summaries.isLoading ? (
          <div className="rounded-lg border p-10 text-center" aria-busy="true">
            Loading summaries…
          </div>
        ) : summaries.isError ? (
          <div className="rounded-lg border p-10 text-center" role="alert">
            <p className="mb-3 text-red-700">Unable to load summaries.</p>
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4"
              onClick={() => summaries.refetch()}
            >
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        ) : chronological.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center text-[#6a717f]">
            {selectedUser?.name ?? "This user"} has no coaching summaries yet.
          </div>
        ) : (
          <ol
            className="space-y-4"
            aria-label={`Coaching summaries for ${selectedUser?.name ?? "selected user"}`}
          >
            {chronological.map((summary) => (
              <li
                key={summary.id}
                className="rounded-lg border border-[#e5e7eb] bg-white p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                  <time className="font-semibold" dateTime={summary.updated_at}>
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                    }).format(new Date(summary.updated_at))}
                  </time>
                  {summary.generation_status !== "current" ? (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
                      Summary may be stale
                    </span>
                  ) : null}
                </div>
                <dl className="mt-4 grid gap-4 md:grid-cols-2">
                  {summaryFields.map(([field, label]) =>
                    summary[field] ? (
                      <div key={field}>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-[#6a717f]">
                          {label}
                        </dt>
                        <dd className="mt-1 whitespace-pre-wrap text-sm text-[#1f2937]">
                          {summary[field]}
                        </dd>
                      </div>
                    ) : null,
                  )}
                </dl>
              </li>
            ))}
          </ol>
        )}
      </div>
    </DashboardShell>
  );
}
