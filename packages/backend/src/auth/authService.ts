import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NUVEMSHOP_AUTH_URL = "https://www.tiendanube.com/apps/authorize/token";

interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  user_id: number;
}

export async function exchangeCodeForToken(code: string): Promise<OAuthTokenResponse> {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing CLIENT_ID or CLIENT_SECRET in environment");
  }

  const response = await fetch(NUVEMSHOP_AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Token exchange failed (${response.status}): ${errorBody}`);
  }

  return response.json() as Promise<OAuthTokenResponse>;
}

export async function saveStoreCredentials(
  storeId: bigint,
  accessToken: string,
  scope: string | null,
  tokenType: string | null,
  userId: bigint | null
): Promise<void> {
  await prisma.store.upsert({
    where: { storeId },
    update: { accessToken, scope, tokenType, userId },
    create: { storeId, accessToken, scope, tokenType, userId },
  });
}

export async function removeStoreCredentials(storeId: bigint): Promise<void> {
  await prisma.store.deleteMany({ where: { storeId } });
}

export async function getStoreAccessToken(storeId: bigint): Promise<string | null> {
  const store = await prisma.store.findUnique({ where: { storeId } });
  return store?.accessToken ?? null;
}
