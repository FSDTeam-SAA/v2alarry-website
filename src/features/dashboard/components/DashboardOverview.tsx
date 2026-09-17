"use client";

import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { User } from "../types";
import { useDashboard } from "../hooks/useDashboard";
import { DataTable } from "./DataTable";
import { DashboardShell } from "./DashboardShell";
import type { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "User name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-full bg-[#dae2fd] text-xs font-bold text-black">
          {row.original.name
            .split(" ")
            .map((part) => part[0])
            .join("")}
        </span>
        <div>
          <p className="font-semibold text-black">{row.original.name}</p>
          <p className="text-xs text-[#76777d]">{row.original.email}</p>
        </div>
      </div>
    ),
  },
  { accessorKey: "registeredAt", header: "Registration" },
  { accessorKey: "lastActive", header: "Last active" },
  { accessorKey: "sessions", header: "Sessions" },
];

export function DashboardOverview() {
  const [period, setPeriod] = useState<"week" | "last-week">("week");
  const dashboard = useDashboard();
  const currentActivity = useMemo(
    () =>
      period === "week"
        ? (dashboard.data?.currentWeek ?? [])
        : (dashboard.data?.previousWeek ?? []),
    [dashboard.data, period],
  );
  const maximum = Math.max(
    1,
    ...currentActivity.map((item) => item.activeUsers),
  );
  const points = useMemo(
    () =>
      currentActivity
        .map(
          (item, index) =>
            `${(index / Math.max(1, currentActivity.length - 1)) * 100},${92 - (item.activeUsers / maximum) * 78}`,
        )
        .join(" "),
    [currentActivity, maximum],
  );

  return (
    <DashboardShell title="Dashboard">
      <div className="space-y-4 p-6">
        {dashboard.isLoading ? (
          <div className="rounded-lg border p-8 text-center" aria-busy="true">
            Loading dashboard…
          </div>
        ) : dashboard.isError || !dashboard.data ? (
          <div className="rounded-lg border p-8 text-center" role="alert">
            <p className="mb-3 text-[#b42318]">
              Unable to load dashboard data.
            </p>
            <button
              type="button"
              onClick={() => dashboard.refetch()}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4"
            >
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                [dashboard.data.totals.users.toLocaleString(), "Total Users"],
                [
                  dashboard.data.totals.activeUsers.toLocaleString(),
                  "Active Users",
                ],
                [
                  dashboard.data.totals.coachingSessions.toLocaleString(),
                  "Coaching Sessions",
                ],
                [
                  dashboard.data.totals.documents.toLocaleString(),
                  "Knowledge Documents",
                ],
              ].map(([value, label]) => (
                <article
                  key={label}
                  className="rounded-lg border border-[#e5e7eb] bg-white px-6 py-7 text-center shadow-sm"
                >
                  <p className="text-4xl font-semibold text-[#023337]">
                    {value}
                  </p>
                  <p className="mt-3 font-semibold">{label}</p>
                </article>
              ))}
            </section>
            <section className="rounded-lg border border-[#e5e7eb] bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-semibold">User Activity</h2>
                <div className="ml-auto flex rounded-xl bg-[#f9edc9] p-1 text-xs">
                  <button
                    onClick={() => setPeriod("week")}
                    className={`rounded-lg px-3 py-2 ${period === "week" ? "bg-white font-medium text-[#f7a900]" : "text-[#6a717f]"}`}
                  >
                    This week
                  </button>
                  <button
                    onClick={() => setPeriod("last-week")}
                    className={`rounded-lg px-3 py-2 ${period === "last-week" ? "bg-white font-medium text-[#f7a900]" : "text-[#6a717f]"}`}
                  >
                    Last week
                  </button>
                </div>
              </div>
              <div className="mt-8 h-60">
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="h-full w-full"
                  role="img"
                  aria-label={`${period === "week" ? "This" : "Last"} week's user activity chart`}
                >
                  <defs>
                    <linearGradient
                      id="activity-gradient"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop stopColor="#f7b626" stopOpacity=".28" />
                      <stop offset="1" stopColor="#f7b626" stopOpacity=".03" />
                    </linearGradient>
                  </defs>
                  {points ? (
                    <>
                      <path
                        d={`M 0,100 L ${points} L 100,100 Z`}
                        fill="url(#activity-gradient)"
                      />
                      <polyline
                        points={points}
                        fill="none"
                        stroke="#f7b626"
                        strokeWidth=".55"
                        vectorEffect="non-scaling-stroke"
                      />
                    </>
                  ) : null}
                </svg>
              </div>
              <div className="flex justify-between pl-9 text-xs text-[#8aa1aa]">
                {currentActivity.map((item) => (
                  <span key={item.date}>
                    {new Intl.DateTimeFormat("en-US", {
                      weekday: "short",
                      timeZone: "UTC",
                    }).format(new Date(`${item.date}T00:00:00Z`))}
                  </span>
                ))}
              </div>
            </section>
            <section className="overflow-hidden rounded-xl border border-[#f3f4f6] bg-white shadow-sm">
              <div className="flex items-center justify-between px-6 py-6">
                <h2 className="text-xl">Recent Users</h2>
                <Link
                  className="font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f7b626]"
                  href="/dashboard/users"
                >
                  View All Users
                </Link>
              </div>
              <DataTable
                columns={columns}
                data={dashboard.data.recentUsers}
                emptyMessage="No users found."
              />
            </section>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
