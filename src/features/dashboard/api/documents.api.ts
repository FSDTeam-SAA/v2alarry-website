import { z } from "zod";

import { api } from "@/lib/api";

const documentSchema = z.object({
  id: z.string(),
  title: z.string(),
  filename: z.string(),
  file_type: z.string(),
  category: z.string().nullable().optional(),
  file_size_bytes: z.number().int().nullable().optional(),
  uploaded_at: z.string(),
  status: z.string(),
  chunk_count: z.number().int(),
  is_active: z.boolean(),
});

const documentStatsSchema = z.object({ total_documents: z.number().int() });

export type DashboardDocument = {
  id: string;
  name: string;
  size: string;
  category: string;
  uploadedAt: string;
  status: string;
};

const formatFileSize = (bytes: number | null | undefined) => {
  if (!bytes) return "—";
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

function toDashboardDocument(
  value: z.infer<typeof documentSchema>,
): DashboardDocument {
  return {
    id: value.id,
    name: value.title,
    size: formatFileSize(value.file_size_bytes),
    category: value.category || value.file_type.toUpperCase(),
    uploadedAt: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value.uploaded_at)),
    status: value.status,
  };
}

export async function getDocuments(): Promise<DashboardDocument[]> {
  const response = await api.get("/admin/documents/", {
    params: { skip: 0, limit: 100 },
  });
  return z.array(documentSchema).parse(response.data).map(toDashboardDocument);
}

export async function getDocumentStats(): Promise<number> {
  const response = await api.get("/admin/documents/stats");
  return documentStatsSchema.parse(response.data).total_documents;
}

export async function uploadDocument(input: {
  title: string;
  category: string;
  file: File;
}): Promise<void> {
  const formData = new FormData();
  formData.append("file", input.file);
  formData.append("title", input.title);
  formData.append("category", input.category);
  await api.post("/admin/documents/upload", formData);
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`/admin/documents/${id}`);
}
