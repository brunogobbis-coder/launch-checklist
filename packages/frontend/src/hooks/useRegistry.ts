import { useQuery } from "@tanstack/react-query";
import { fetchRegistry } from "../services/api";

export function useRegistry() {
  return useQuery({
    queryKey: ["registry"],
    queryFn: fetchRegistry,
    staleTime: Infinity,
  });
}
