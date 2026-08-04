"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Plus, RefreshCw, Trash2, UploadCloud, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { DashboardDocument } from "../api/documents.api";
import { useDocumentMutations, useDocuments } from "../hooks/useDocuments";
import { DataTable } from "./DataTable";
import { DashboardShell } from "./DashboardShell";
import { useState } from "react";

const uploadSchema = z.object({
  title: z.string().trim().min(1, "Document name is required").max(255),
  category: z.string().trim().min(1, "Category is required").max(100),
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
    accessorKey: "category",
    header: "Category",
    cell: ({ getValue }) => (
      <span className="inline-flex rounded bg-[#efedef] px-3 py-2">
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
  const documents = useDocuments();
  const { upload, remove } = useDocumentMutations();
  const form = useForm<UploadValues>();
  const selectedFile = useWatch({ control: form.control, name: "file" });
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
      await upload.mutateAsync(result.data);
      form.reset();
      setUploadOpen(false);
      toast.success("Document uploaded.");
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
  return (
    <DashboardShell title="Knowledge Base">
      <div className="p-6">
        <div className="mb-12 flex justify-end">
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#f7b626] px-5 font-semibold hover:bg-[#ffc84c]"
          >
            <Plus size={22} />
            Upload Document
          </button>
        </div>
        <section className="overflow-hidden rounded-xl border border-[#f3f4f6] shadow-sm">
          {documents.isLoading ? (
            <div className="p-8 text-center" aria-busy="true">
              Loading documents…
            </div>
          ) : documents.isError ? (
            <div className="p-8 text-center">
              <p className="mb-3 text-[#b42318]">Unable to load documents.</p>
              <button
                type="button"
                onClick={() => documents.refetch()}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4"
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
              emptyMessage="No documents uploaded."
            />
          )}
        </section>
      </div>
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="relative w-full max-w-md rounded-xl bg-white p-8 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-title"
          >
            <button
              type="button"
              onClick={() => setUploadOpen(false)}
              aria-label="Close upload dialog"
              className="absolute right-4 top-4 grid size-11 place-items-center rounded-md hover:bg-muted"
            >
              <X />
            </button>
            <h2 id="upload-title" className="mb-6 font-medium text-[#023337]">
              Upload Document
            </h2>
            <label className="mb-4 block text-sm font-medium">
              Document Name
              <input
                {...form.register("title")}
                className="mt-2 h-12 w-full rounded-lg border border-[#eadfca] bg-[#fdfaf4] px-4 font-normal outline-none focus:border-[#f7b626]"
              />
              {form.formState.errors.title && (
                <span className="mt-1 block text-xs text-red-600">
                  {form.formState.errors.title.message}
                </span>
              )}
            </label>
            <label className="mb-4 block text-sm font-medium">
              Category
              <input
                {...form.register("category")}
                className="mt-2 h-12 w-full rounded-lg border border-[#eadfca] bg-[#fdfaf4] px-4 font-normal outline-none focus:border-[#f7b626]"
              />
              {form.formState.errors.category && (
                <span className="mt-1 block text-xs text-red-600">
                  {form.formState.errors.category.message}
                </span>
              )}
            </label>
            <label className="mb-4 grid min-h-24 cursor-pointer place-items-center rounded-lg border border-dashed border-[#e6ad00] p-4 text-center text-sm text-[#728078]">
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
              <UploadCloud className="mb-1 text-[#e6ad00]" />
              {selectedFile?.name ??
                "Drag & drop files here or click to browse"}
            </label>
            {form.formState.errors.file && (
              <p className="mb-3 text-xs text-red-600">
                {form.formState.errors.file.message}
              </p>
            )}
            <button
              disabled={upload.isPending}
              className="min-h-12 w-full rounded-xl bg-[#f7b626] text-sm font-bold hover:bg-[#ffc84c] disabled:opacity-50"
            >
              {upload.isPending ? "UPLOADING…" : "UPLOAD DOCUMENT"}
            </button>
          </form>
        </div>
      )}
    </DashboardShell>
  );
}
