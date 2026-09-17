"use client";
import type { ColumnDef } from "@tanstack/react-table";
import { RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { User } from "../types";
import { useUsers } from "../hooks/useUsers";
import { DataTable } from "./DataTable";
import { DashboardShell } from "./DashboardShell";

export function UsersPage() {
  const [search, setSearch] = useState("");
  const users = useUsers();
  const userList = users.data ?? [];
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: "User name",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-black">{row.original.name}</p>
            <p className="text-xs text-[#76777d]">{row.original.email}</p>
          </div>
        ),
      },
      { accessorKey: "registeredAt", header: "Registration" },
      { accessorKey: "lastActive", header: "Last active" },
      { accessorKey: "sessions", header: "Sessions" },
      {
        accessorKey: "isEnabled",
        header: "Account",
        cell: ({ row }) => (row.original.isEnabled ? "Enabled" : "Disabled"),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) =>
          row.original.summaryCount > 0 ? (
            <Link
              className="font-medium text-[#023337] underline-offset-4 hover:underline"
              href={`/dashboard/coaching-summaries?user=${row.original.id}`}
            >
              View summaries ({row.original.summaryCount})
            </Link>
          ) : (
            <span className="text-[#76777d]">No summaries</span>
          ),
      },
    ],
    [],
  );
  return (
    <DashboardShell title="Users">
      <div className="p-6">
        <div className="mb-4 ml-auto flex max-w-[404px] items-center rounded-full bg-[#f7f8fa] px-5">
          <label className="sr-only" htmlFor="user-search">
            Search users
          </label>
          <input
            id="user-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search data, users, or reports"
            className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          <Search className="text-[#64748b]" size={22} />
        </div>
        <section className="overflow-hidden rounded-xl border border-[#f3f4f6] shadow-sm">
          {users.isLoading ? (
            <div className="p-8 text-center" aria-busy="true">
              Loading users…
            </div>
          ) : users.isError ? (
            <div className="p-8 text-center" role="alert">
              <p className="mb-3 text-[#b42318]">Unable to load users.</p>
              <button
                type="button"
                onClick={() => users.refetch()}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4"
              >
                <RefreshCw size={16} /> Retry
              </button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={userList}
              search={search}
              emptyMessage="No matching users."
            />
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
