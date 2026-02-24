import axios from "axios";
import { getSessionToken } from "@tiendanube/nexo";
import nexo from "../nexoClient";
import type {
  ChecklistSummary,
  ChecklistDetail,
  CheckDetail,
  RegistrySection,
} from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await getSessionToken(nexo);
    config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // In dev mode without Nexo, requests proceed without auth
  }
  return config;
});

export async function fetchRegistry(): Promise<RegistrySection[]> {
  const { data } = await api.get<RegistrySection[]>("/api/registry");
  return data;
}

export async function fetchChecklists(
  search?: string
): Promise<ChecklistSummary[]> {
  const params = search ? { search } : undefined;
  const { data } = await api.get<ChecklistSummary[]>("/api/checklists", {
    params,
  });
  return data;
}

export async function fetchChecklist(id: string): Promise<ChecklistDetail> {
  const { data } = await api.get<ChecklistDetail>(`/api/checklists/${id}`);
  return data;
}

export async function createChecklist(
  name: string,
  checkTypes: string[]
): Promise<ChecklistDetail> {
  const { data } = await api.post<ChecklistDetail>("/api/checklists", {
    name,
    checkTypes,
  });
  return data;
}

export async function updateChecklist(
  id: string,
  name: string
): Promise<void> {
  await api.patch(`/api/checklists/${id}`, { name });
}

export async function deleteChecklist(id: string): Promise<void> {
  await api.delete(`/api/checklists/${id}`);
}

export async function updateCheckStatus(
  checklistId: string,
  checkId: string,
  status: string
): Promise<void> {
  await api.patch(`/api/checklists/${checklistId}/checks/${checkId}`, {
    status,
  });
}

export async function fetchCheckDetail(
  checklistId: string,
  checkId: string
): Promise<CheckDetail> {
  const { data } = await api.get<CheckDetail>(
    `/api/checklists/${checklistId}/checks/${checkId}`
  );
  return data;
}

export default api;
