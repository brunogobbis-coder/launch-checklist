import type { Request, Response } from "express";
import { CheckStatus } from "@prisma/client";
import {
  createChecklist,
  listChecklists,
  getChecklist,
  updateChecklist,
  deleteChecklist,
  updateCheckStatus,
  getCheckDetail,
  getRegistryAllDefinitions,
} from "../services/checklistService.js";

function getStoreId(req: Request): bigint {
  if (!req.storeId) throw new Error("Unauthenticated");
  return req.storeId;
}

export async function handleCreateChecklist(req: Request, res: Response) {
  try {
    const { name, checkTypes } = req.body;
    if (!name || !Array.isArray(checkTypes)) {
      res.status(400).json({ error: "name and checkTypes[] are required" });
      return;
    }
    const checklist = await createChecklist(getStoreId(req), name, checkTypes);
    res.status(201).json(checklist);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    res.status(400).json({ error: message });
  }
}

export async function handleListChecklists(req: Request, res: Response) {
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const checklists = await listChecklists(getStoreId(req), search);
  res.json(checklists);
}

export async function handleGetChecklist(req: Request<{ id: string }>, res: Response) {
  const checklist = await getChecklist(getStoreId(req), req.params.id);
  if (!checklist) {
    res.status(404).json({ error: "Checklist not found" });
    return;
  }
  res.json(checklist);
}

export async function handleUpdateChecklist(req: Request<{ id: string }>, res: Response) {
  const { name } = req.body;
  const updated = await updateChecklist(getStoreId(req), req.params.id, { name });
  if (!updated) {
    res.status(404).json({ error: "Checklist not found" });
    return;
  }
  res.json(updated);
}

export async function handleDeleteChecklist(req: Request<{ id: string }>, res: Response) {
  const deleted = await deleteChecklist(getStoreId(req), req.params.id);
  if (!deleted) {
    res.status(404).json({ error: "Checklist not found" });
    return;
  }
  res.status(204).send();
}

export async function handleUpdateCheckStatus(req: Request<{ id: string; checkId: string }>, res: Response) {
  const { status } = req.body;
  const validStatuses = Object.values(CheckStatus);
  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({
      error: `status must be one of: ${validStatuses.join(", ")}`,
    });
    return;
  }

  const updated = await updateCheckStatus(
    getStoreId(req),
    req.params.id,
    req.params.checkId,
    status as CheckStatus
  );

  if (!updated) {
    res.status(404).json({ error: "Check not found" });
    return;
  }
  res.json(updated);
}

export async function handleGetCheckDetail(req: Request<{ id: string; checkId: string }>, res: Response) {
  const detail = await getCheckDetail(
    getStoreId(req),
    req.params.id,
    req.params.checkId
  );
  if (!detail) {
    res.status(404).json({ error: "Check not found" });
    return;
  }
  res.json(detail);
}

export async function handleGetRegistry(_req: Request, res: Response) {
  const sections = getRegistryAllDefinitions();
  res.json(sections);
}
