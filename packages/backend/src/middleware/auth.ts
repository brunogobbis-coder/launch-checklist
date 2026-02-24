import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      storeId?: bigint;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }

  const token = authHeader.slice(7);
  const clientSecret = process.env.CLIENT_SECRET;

  if (!clientSecret) {
    res.status(500).json({ error: "Server misconfiguration: missing CLIENT_SECRET" });
    return;
  }

  try {
    const decoded = jwt.verify(token, clientSecret) as jwt.JwtPayload;
    const storeId = decoded.store_id;

    if (!storeId) {
      res.status(401).json({ error: "Token missing store_id claim" });
      return;
    }

    req.storeId = BigInt(storeId);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
