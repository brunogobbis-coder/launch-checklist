import type { Request, Response } from "express";
import { exchangeCodeForToken, saveStoreCredentials } from "./authService.js";

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

    const adminUrl = `https://admin.nuvemshop.com.br`;
    res.redirect(adminUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("OAuth callback error:", message);
    res.status(500).json({ error: "Failed to complete app installation" });
  }
}
