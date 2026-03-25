import pg from "pg";
import { env } from "../config/env.js";

const { Pool } = pg;

if (!env.databaseUrl) {
  // Helpful error early in startup instead of opaque pg failures.
  throw new Error("DATABASE_URL is required");
}

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.nodeEnv === "production" ? { rejectUnauthorized: false } : false
});
