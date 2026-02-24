import type { Request, Response } from "express";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { removeStoreCredentials } from "../auth/authService.js";

const prisma = new PrismaClient();

function verifyWebhookSignature(body: string, signature: string): boolean {
  const clientSecret = process.env.CLIENT_SECRET;
  if (!clientSecret) return false;

  const computedHmac = crypto
    .createHmac("sha256", clientSecret)
    .update(body, "utf8")
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(computedHmac, "hex"),
    Buffer.from(signature, "hex")
  );
}

export async function handleWebhook(req: Request, res: Response): Promise<void> {
  const signature = req.headers["x-linkedstore-hmac-sha256"] as string | undefined;
  const rawBody = JSON.stringify(req.body);

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    res.status(401).json({ error: "Invalid webhook signature" });
    return;
  }

  const event = req.body.event as string | undefined;
  const storeId = req.body.store_id as number | undefined;

  if (!event || !storeId) {
    res.status(400).json({ error: "Missing event or store_id" });
    return;
  }

  try {
    switch (event) {
      case "app/installed":
        console.log(`App installed for store ${storeId}`);
        res.status(200).json({ ok: true });
        break;

      case "app/uninstalled":
        await handleUninstall(BigInt(storeId));
        console.log(`App uninstalled for store ${storeId} — data cleaned up`);
        res.status(200).json({ ok: true });
        break;

      default:
        console.log(`Unhandled webhook event: ${event}`);
        res.status(200).json({ ok: true });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Webhook processing error (${event}):`, message);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}

async function handleUninstall(storeId: bigint): Promise<void> {
  await prisma.checklist.deleteMany({ where: { storeId } });
  await removeStoreCredentials(storeId);
}
