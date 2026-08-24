"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Check,
  ChevronDown,
  Globe,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
  User as UserIcon,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { DashboardDocument } from "../api/documents.api";
import { useDocumentMutations, useDocuments } from "../hooks/useDocuments";
import { useUsers } from "../hooks/useUsers";
import { DataTable } from "./DataTable";
import { DashboardShell } from "./DashboardShell";

const uploadSchema = z.object({
  title: z.string().trim().min(1, "Document name is required").max(255),
  category: z.string().trim().max(100).optional(),
  user_email: z.string().trim().optional(),
  file: z.instanceof(File, { message: "Choose a document to upload" }),
});
type UploadValues = z.infer<typeof uploadSchema>;

const columns: ColumnDef<DashboardDocument>[] = [
  {
    accessorKey: "name",
    header: "Document name",
    cell: ({ row }) => (
      <div>
        <p className="font-semibold text-black">{row.original.name}</p>
        <p className="text-xs text-[#76777d]">{row.original.size}</p>
      </div>
    ),
  },
  {
    accessorKey: "targetUserEmail",
    header: "Access Scope",
    cell: ({ row }) => {
      const email = row.original.targetUserEmail;
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold ${
            email
              ? "bg-[#e6f4ea] text-[#137333]"
              : "bg-[#e8f0fe] text-[#1a73e8]"
          }`}
        >
          {email ? (
            <>
              <UserIcon size={12} /> {email}
            </>
          ) : (
            <>
              <Globe size={12} /> Global
            </>
          )}
        </span>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ getValue }) => (
      <span className="inline-flex rounded bg-[#efedef] px-3 py-2 text-xs font-medium">
        {String(getValue())}
      </span>
    ),
  },
  { accessorKey: "uploadedAt", header: "Date" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => (
      <span className="capitalize">{String(getValue())}</span>
    ),
  },
];

export function KnowledgeBasePage() {
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [siteSearch, setSiteSearch] = useState("");
  const [candidateDropdownOpen, setCandidateDropdownOpen] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const documents = useDocuments();
  const { upload, remove } = useDocumentMutations();
  const { data: userList = [] } = useUsers();

  const form = useForm<UploadValues>({
    defaultValues: {
      title: "",
      category: "",
      user_email: "",
    },
  });

  const selectedFile = useWatch({ control: form.control, name: "file" });
  const currentSelectedEmail = useWatch({
    control: form.control,
    name: "user_email",
  });

  // Close candidate dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setCandidateDropdownOpen(false);
      }
    }
    if (candidateDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [candidateDropdownOpen]);

  // Filter candidates by candidateSearch
  const filteredUsers = useMemo(() => {
    const query = candidateSearch.trim().toLowerCase();
    if (!query) return userList;
    return userList.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query),
    );
  }, [userList, candidateSearch]);

  const selectedUserObject = useMemo(() => {
    if (!currentSelectedEmail) return null;
    return userList.find(
      (u) => u.email.toLowerCase() === currentSelectedEmail.toLowerCase(),
    );
  }, [userList, currentSelectedEmail]);

  const onSubmit = async (values: UploadValues) => {
    const result = uploadSchema.safeParse(values);
    if (!result.success) {
      result.error.issues.forEach((issue) =>
        form.setError(issue.path[0] as keyof UploadValues, {
          message: issue.message,
        }),
      );
      return;
    }
    const extension = result.data.file.name.split(".").pop()?.toLowerCase();
    if (
      !extension ||
      !["pdf", "docx", "txt", "md"].includes(extension) ||
      result.data.file.size > 10 * 1024 * 1024
    ) {
      form.setError("file", {
        message: "Choose a PDF, DOCX, TXT, or MD file no larger than 10 MB.",
      });
      return;
    }
    try {
      await upload.mutateAsync({
        title: result.data.title,
        category: result.data.category || "General",
        user_email: result.data.user_email || undefined,
        is_global: !result.data.user_email,
        file: result.data.file,
      });
      form.reset();
      setUploadOpen(false);
      setCandidateDropdownOpen(false);
      setCandidateSearch("");
      toast.success("Document uploaded successfully.");
    } catch {
      toast.error("Unable to upload document. Please try again.");
    }
  };

  const removeDocument = async (id: string) => {
    try {
      await remove.mutateAsync(id);
      toast.success("Document deleted.");
    } catch {
      toast.error("Unable to delete document. Please try again.");
    }
  };

  const handleSelectCandidate = (email: string) => {
    form.setValue("user_email", email, { shouldValidate: true });
    setCandidateDropdownOpen(false);
    setCandidateSearch("");
  };

  return (
    <DashboardShell title="Knowledge Base">
      <div className="p-6">
        {/* Top Action Bar with Site Search & Upload Button */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex max-w-[420px] flex-1 items-center rounded-full bg-[#f7f8fa] px-5">
            <label className="sr-only" htmlFor="knowledge-search">
              Search knowledge base
            </label>
            <input
              id="knowledge-search"
              value={siteSearch}
              onChange={(event) => setSiteSearch(event.target.value)}
              placeholder="Search documents by title, category, or scope..."
              className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <Search className="text-[#64748b]" size={20} />
          </div>

          <button
            type="button"
            onClick={() => {
              form.reset();
              setCandidateSearch("");
              setCandidateDropdownOpen(false);
              setUploadOpen(true);
            }}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#f7b626] px-5 font-semibold text-black shadow-sm transition-colors hover:bg-[#ffc84c]"
          >
            <Plus size={22} />
            Upload Document
          </button>
        </div>

        <section className="overflow-hidden rounded-xl border border-[#f3f4f6] shadow-sm">
          {documents.isLoading ? (
            <div
              className="p-8 text-center text-sm text-[#76777d]"
              aria-busy="true"
            >
              Loading documents…
            </div>
          ) : documents.isError ? (
            <div className="p-8 text-center">
              <p className="mb-3 text-[#b42318]">Unable to load documents.</p>
              <button
                type="button"
                onClick={() => documents.refetch()}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium hover:bg-slate-50"
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </div>
          ) : (
            <DataTable
              columns={[
                ...columns,
                {
                  id: "actions",
                  header: "Actions",
                  cell: ({ row }) => (
                    <button
                      type="button"
                      aria-label={`Delete ${row.original.name}`}
                      disabled={remove.isPending}
                      onClick={() => void removeDocument(row.original.id)}
                      className="grid size-11 place-items-center rounded-md text-[#ff0033] hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={20} />
                    </button>
                  ),
                },
              ]}
              data={documents.data ?? []}
              search={siteSearch}
              emptyMessage="No documents found."
            />
          )}
        </section>
      </div>

      {isUploadOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-8 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-title"
          >
            <button
              type="button"
              onClick={() => setUploadOpen(false)}
              aria-label="Close upload dialog"
              className="absolute right-4 top-4 grid size-11 place-items-center rounded-md text-[#6a717f] hover:bg-muted"
            >
              <X size={20} />
            </button>

            <h2
              id="upload-title"
              className="mb-6 text-xl font-bold text-[#023337]"
            >
              Upload Document
            </h2>

            {/* Target Candidate Email with Dropdown and Search */}
            <div className="relative mb-5" ref={dropdownRef}>
              <label className="mb-1.5 block text-sm font-medium text-[#111827]">
                Target Candidate Email (Optional)
              </label>

              {/* Trigger Input / Dropdown Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCandidateDropdownOpen((prev) => !prev)}
                  className="flex h-12 w-full items-center justify-between rounded-lg border border-[#eadfca] bg-[#fdfaf4] px-4 text-left text-sm transition-colors focus:border-[#f7b626] focus:outline-none"
                >
                  <span className="flex items-center gap-2 truncate">
                    {currentSelectedEmail ? (
                      selectedUserObject ? (
                        <>
                          <span className="grid size-6 place-items-center rounded-full bg-[#dae2fd] text-[10px] font-bold text-black">
                            {selectedUserObject.name
                              .split(" ")
                              .map((p) => p[0])
                              .join("")}
                          </span>
                          <span className="font-semibold text-black">
                            {selectedUserObject.name}
                          </span>
                          <span className="text-xs text-[#76777d]">
                            ({currentSelectedEmail})
                          </span>
                        </>
                      ) : (
                        <>
                          <UserIcon size={16} className="text-[#023337]" />
                          <span className="font-semibold text-black">
                            {currentSelectedEmail}
                          </span>
                        </>
                      )
                    ) : (
                      <>
                        <Globe size={16} className="text-[#1a73e8]" />
                        <span className="text-[#6a717f]">
                          🌐 Global (Leave blank for all candidates)
                        </span>
                      </>
                    )}
                  </span>
                  <div className="flex items-center gap-1 text-[#76777d]">
                    {currentSelectedEmail && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCandidate("");
                        }}
                        className="rounded p-1 hover:bg-slate-200 hover:text-black"
                        title="Clear target candidate"
                      >
                        <X size={14} />
                      </span>
                    )}
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${
                        candidateDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>
              </div>

              <span className="mt-1 block text-xs text-[#76777d]">
                If specified, only this candidate will receive responses with
                this context.
              </span>

              {/* Popover Dropdown Menu */}
              {candidateDropdownOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-[#e5e7eb] bg-white p-2 shadow-2xl">
                  {/* Dropdown Search Bar */}
                  <div className="mb-2 flex items-center rounded-lg border border-[#e5e7eb] bg-[#f7f8fa] px-3">
                    <Search size={16} className="text-[#64748b]" />
                    <input
                      type="text"
                      value={candidateSearch}
                      onChange={(e) => setCandidateSearch(e.target.value)}
                      placeholder="Search existing users by name or email..."
                      className="h-10 w-full bg-transparent px-2 text-xs outline-none"
                      autoFocus
                    />
                    {candidateSearch && (
                      <button
                        type="button"
                        onClick={() => setCandidateSearch("")}
                        className="text-[#64748b] hover:text-black"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="max-h-56 overflow-y-auto space-y-1">
                    {/* Global Option */}
                    <button
                      type="button"
                      onClick={() => handleSelectCandidate("")}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-[#f9edc9] ${
                        !currentSelectedEmail
                          ? "bg-[#f9edc9]/60 font-semibold text-black"
                          : "text-[#374151]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="grid size-7 place-items-center rounded-full bg-[#e8f0fe] text-[#1a73e8]">
                          <Globe size={14} />
                        </div>
                        <div>
                          <p className="font-semibold text-black">
                            Global Context
                          </p>
                          <p className="text-[11px] text-[#6a717f]">
                            Available to all candidates
                          </p>
                        </div>
                      </div>
                      {!currentSelectedEmail && (
                        <Check size={16} className="text-[#023337]" />
                      )}
                    </button>

                    <div className="my-1 border-t border-[#f3f4f6] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">
                      Registered Candidates
                    </div>

                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u) => {
                        const isSelected =
                          currentSelectedEmail?.toLowerCase() ===
                          u.email.toLowerCase();
                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => handleSelectCandidate(u.email)}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-[#f9edc9] ${
                              isSelected
                                ? "bg-[#f9edc9]/60 font-semibold text-black"
                                : "text-[#374151]"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="grid size-7 place-items-center rounded-full bg-[#dae2fd] text-[11px] font-bold text-black">
                                {u.name
                                  .split(" ")
                                  .map((p) => p[0])
                                  .join("")}
                              </div>
                              <div>
                                <p className="font-semibold text-black">
                                  {u.name}
                                </p>
                                <p className="text-[11px] text-[#6a717f]">
                                  {u.email}
                                </p>
                              </div>
                            </div>
                            {isSelected && (
                              <Check size={16} className="text-[#023337]" />
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-3 py-2 text-center text-xs text-[#6a717f]">
                        No users found matching &quot;{candidateSearch}&quot;
                      </div>
                    )}

                    {/* Custom typed email option if user typed something not matching */}
                    {candidateSearch.includes("@") &&
                      !userList.some(
                        (u) =>
                          u.email.toLowerCase() ===
                          candidateSearch.trim().toLowerCase(),
                      ) && (
                        <button
                          type="button"
                          onClick={() =>
                            handleSelectCandidate(candidateSearch.trim())
                          }
                          className="flex w-full items-center gap-2 rounded-lg border border-dashed border-[#f7b626] bg-[#fffdfa] px-3 py-2 text-left text-xs hover:bg-[#f9edc9]"
                        >
                          <UserIcon size={14} className="text-[#f7b626]" />
                          <span>
                            Use custom email:{" "}
                            <strong className="text-black">
                              {candidateSearch.trim()}
                            </strong>
                          </span>
                        </button>
                      )}
                  </div>
                </div>
              )}
            </div>

            <label className="mb-4 block text-sm font-medium text-[#111827]">
              Document Name
              <input
                {...form.register("title")}
                placeholder="e.g. Leadership Assessment 2024"
                className="mt-1.5 h-12 w-full rounded-lg border border-[#eadfca] bg-[#fdfaf4] px-4 font-normal outline-none focus:border-[#f7b626]"
              />
              {form.formState.errors.title && (
                <span className="mt-1 block text-xs text-red-600">
                  {form.formState.errors.title.message}
                </span>
              )}
            </label>

            <label className="mb-4 block text-sm font-medium text-[#111827]">
              Category
              <input
                {...form.register("category")}
                placeholder="e.g. Coaching History, Assessment, Framework"
                className="mt-1.5 h-12 w-full rounded-lg border border-[#eadfca] bg-[#fdfaf4] px-4 font-normal outline-none focus:border-[#f7b626]"
              />
              {form.formState.errors.category && (
                <span className="mt-1 block text-xs text-red-600">
                  {form.formState.errors.category.message}
                </span>
              )}
            </label>

            <label className="mb-4 grid min-h-24 cursor-pointer place-items-center rounded-lg border border-dashed border-[#e6ad00] bg-[#fdfbf7] p-4 text-center text-sm text-[#728078] hover:bg-[#fffbee]">
              <input
                type="file"
                accept=".pdf,.docx,.txt,.md"
                className="sr-only"
                onChange={(event) =>
                  form.setValue("file", event.target.files?.[0] as File, {
                    shouldValidate: true,
                  })
                }
              />
              <UploadCloud className="mb-1 text-[#e6ad00]" size={28} />
              {selectedFile?.name ? (
                <span className="font-semibold text-black">
                  📄 {selectedFile.name}
                </span>
              ) : (
                "Drag & drop files here or click to browse (PDF, DOCX, TXT, MD)"
              )}
            </label>
            {form.formState.errors.file && (
              <p className="mb-3 text-xs text-red-600">
                {form.formState.errors.file.message}
              </p>
            )}

            <button
              disabled={upload.isPending}
              className="min-h-12 w-full rounded-xl bg-[#f7b626] text-sm font-bold text-black transition-colors hover:bg-[#ffc84c] disabled:opacity-50"
            >
              {upload.isPending ? "UPLOADING…" : "UPLOAD DOCUMENT"}
            </button>
          </form>
        </div>
      )}
    </DashboardShell>
  );
}
