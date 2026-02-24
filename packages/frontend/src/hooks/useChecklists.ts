import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchChecklists,
  createChecklist,
  deleteChecklist,
} from "../services/api";

export function useChecklists(search?: string) {
  return useQuery({
    queryKey: ["checklists", search],
    queryFn: () => fetchChecklists(search),
  });
}

export function useCreateChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, checkTypes }: { name: string; checkTypes: string[] }) =>
      createChecklist(name, checkTypes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
    },
  });
}

export function useDeleteChecklist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteChecklist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklists"] });
    },
  });
}
