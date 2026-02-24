import { Router } from "express";
import { authMiddleware } from "./middleware/auth.js";
import { handleInstall, handleCallback } from "./auth/authController.js";
import { handleWebhook } from "./webhooks/webhookController.js";
import {
  handleCreateChecklist,
  handleListChecklists,
  handleGetChecklist,
  handleUpdateChecklist,
  handleDeleteChecklist,
  handleUpdateCheckStatus,
  handleGetCheckDetail,
  handleGetRegistry,
} from "./checklist/controllers/checklistController.js";

const router = Router();

router.get("/auth/install", handleInstall);
router.get("/auth/callback", handleCallback);

router.post("/webhooks", handleWebhook);

router.use("/api", authMiddleware);

router.get("/api/registry", handleGetRegistry);
router.post("/api/checklists", handleCreateChecklist);
router.get("/api/checklists", handleListChecklists);
router.get("/api/checklists/:id", handleGetChecklist);
router.patch("/api/checklists/:id", handleUpdateChecklist);
router.delete("/api/checklists/:id", handleDeleteChecklist);
router.patch("/api/checklists/:id/checks/:checkId", handleUpdateCheckStatus);
router.get("/api/checklists/:id/checks/:checkId", handleGetCheckDetail);

export default router;
