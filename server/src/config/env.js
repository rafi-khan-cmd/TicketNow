import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnvPath = path.resolve(__dirname, "../../../.env");
const localEnvPath = path.resolve(__dirname, "../../.env");

// Prefer root .env for monorepo usage, fallback to server/.env if present.
dotenv.config({ path: rootEnvPath });
dotenv.config({ path: localEnvPath, override: false });

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  agingThresholdHours: Number(process.env.AGING_THRESHOLD_HOURS || 48)
};
