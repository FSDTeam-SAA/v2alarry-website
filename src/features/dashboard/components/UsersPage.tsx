"use client";
import type { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { users } from "../dashboard-data";
import type { User } from "../types";
import { useUsers } from "../hooks/useUsers";
import { DataTable } from "./DataTable";
import { DashboardShell } from "./DashboardShell";

export function UsersPage() {
  const [search, setSearch] = useState("");
  const { data: userList = users, isLoading } = useUsers();
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
        id: "actions",
        header: "Actions",
        cell: () => <span className="text-[#76777d]">—</span>,
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
          {isLoading ? (
            <div className="p-8 text-center" aria-busy="true">
              Loading users…
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
