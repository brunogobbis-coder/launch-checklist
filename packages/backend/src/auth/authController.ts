import type { Request, Response } from "express";
import { exchangeCodeForToken, saveStoreCredentials } from "./authService.js";

const ADMIN_DOMAINS: Record<string, string> = {
  br: "https://admin.nuvemshop.com.br",
  ar: "https://admin.tiendanube.com",
  default: "https://admin.tiendanube.com",
};

function getAdminAppUrl(): string {
  const clientId = process.env.CLIENT_ID;
  const country = (process.env.STORE_COUNTRY ?? "br").toLowerCase();
  const adminBase = ADMIN_DOMAINS[country] ?? ADMIN_DOMAINS.default;
  return `${adminBase}/apps/${clientId}`;
}

export async function handleInstall(req: Request, res: Response): Promise<void> {
  const clientId = process.env.CLIENT_ID;
  if (!clientId) {
    res.status(500).json({ error: "Missing CLIENT_ID in environment" });
    return;
  }

  const authorizationUrl = `https://www.tiendanube.com/apps/${encodeURIComponent(clientId)}/authorize`;
  res.redirect(authorizationUrl);
}

export async function handleCallback(req: Request, res: Response): Promise<void> {
  const code = req.query.code as string | undefined;

  if (!code) {
    res.status(400).json({ error: "Missing authorization code" });
    return;
  }

  try {
    const tokenData = await exchangeCodeForToken(code);

    const storeId = BigInt(tokenData.user_id);
    await saveStoreCredentials(
      storeId,
      tokenData.access_token,
      tokenData.scope ?? null,
      tokenData.token_type ?? null,
      BigInt(tokenData.user_id)
    );

    res.redirect(getAdminAppUrl());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("OAuth callback error:", message);
    res.status(500).json({ error: "Failed to complete app installation" });
  }
}
