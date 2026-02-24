import { useQuery } from "@tanstack/react-query";
import { fetchCheckDetail } from "../services/api";

export function useCheckDetail(checklistId: string, checkId: string | null) {
  return useQuery({
    queryKey: ["checkDetail", checklistId, checkId],
    queryFn: () => fetchCheckDetail(checklistId, checkId!),
    enabled: !!checklistId && !!checkId,
  });
}
