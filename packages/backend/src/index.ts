import "dotenv/config";
import express from "express";
import path from "node:path";
import fs from "node:fs";
import cors from "cors";
import router from "./routes.js";

const app = express();
const PORT = parseInt(process.env.PORT ?? "3400", 10);
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const ALLOWED_ORIGINS = [
  /^https:\/\/.*\.nuvemshop\.com\.br$/,
  /^https:\/\/.*\.mitiendanube\.com$/,
  /^https:\/\/.*\.mynuvemshop\.com$/,
  /^https:\/\/admin\.nuvemshop\.com\.br$/,
  /^https:\/\/admin\.tiendanube\.com$/,
];

if (!IS_PRODUCTION) {
  ALLOWED_ORIGINS.push(/^http:\/\/localhost:\d+$/);
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.some((pattern) => pattern.test(origin))) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(router);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

if (IS_PRODUCTION) {
  const frontendDist = path.resolve(__dirname, "../../frontend/dist");

  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));

    app.get("*", (_req, res) => {
      res.sendFile(path.join(frontendDist, "index.html"));
    });
  }
}

app.listen(PORT, () => {
  console.log(`Launch Checklist API running on http://localhost:${PORT}`);
});
