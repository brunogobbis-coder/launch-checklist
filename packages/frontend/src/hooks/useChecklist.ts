import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchChecklist,
  updateCheckStatus as apiUpdateCheckStatus,
  updateChecklist as apiUpdateChecklist,
} from "../services/api";

export function useChecklist(id: string) {
  return useQuery({
    queryKey: ["checklist", id],
    queryFn: () => fetchChecklist(id),
    enabled: !!id,
  });
}

export function useUpdateCheckStatus(checklistId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ checkId, status }: { checkId: string; status: string }) =>
      apiUpdateCheckStatus(checklistId, checkId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist", checklistId] });
    },
  });
}

export function useUpdateChecklist(checklistId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => apiUpdateChecklist(checklistId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist", checklistId] });
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
    },
  });
}
