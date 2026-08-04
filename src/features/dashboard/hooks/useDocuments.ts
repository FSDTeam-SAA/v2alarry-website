"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteDocument,
  getDocuments,
  getDocumentStats,
  uploadDocument,
} from "../api/documents.api";

const documentsKey = ["admin", "documents"] as const;
const documentStatsKey = ["admin", "document-stats"] as const;

export function useDocuments() {
  return useQuery({ queryKey: documentsKey, queryFn: getDocuments });
}
export function useDocumentStats() {
  return useQuery({ queryKey: documentStatsKey, queryFn: getDocumentStats });
}
export function useDocumentMutations() {
  const client = useQueryClient();
  const invalidate = () =>
    Promise.all([
      client.invalidateQueries({ queryKey: documentsKey }),
      client.invalidateQueries({ queryKey: documentStatsKey }),
    ]);
  return {
    upload: useMutation({ mutationFn: uploadDocument, onSuccess: invalidate }),
    remove: useMutation({ mutationFn: deleteDocument, onSuccess: invalidate }),
  };
}
