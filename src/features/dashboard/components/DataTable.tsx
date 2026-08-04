"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type DataTableProps<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  emptyMessage: string;
  search?: string;
};

export function DataTable<TData>({
  columns,
  data,
  emptyMessage,
  search = "",
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  // TanStack Table manages mutable table state internally and is intentionally
  // excluded from React Compiler memoization.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns,
    data,
    state: { globalFilter: search, sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: "includesString",
  });
  const rows = table.getRowModel().rows;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left">
        <thead className="bg-[#f0f3ff] text-xs font-semibold uppercase tracking-[0.04em] text-[#45464d]">
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th key={header.id} className="px-6 py-5">
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      className="inline-flex items-center gap-1 font-inherit hover:text-[#023337] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7b626]"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getIsSorted() === "asc" ? (
                        <ChevronUp size={14} />
                      ) : header.column.getIsSorted() === "desc" ? (
                        <ChevronDown size={14} />
                      ) : null}
                    </button>
                  ) : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-[#e5e7eb] text-sm text-[#45464d]">
          {rows.length ? (
            rows.map((row) => (
              <tr key={row.id} className="bg-white">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                className="px-6 py-12 text-center text-[#6a717f]"
                colSpan={columns.length}
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
