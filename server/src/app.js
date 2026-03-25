import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { mockAuth } from "./middleware/auth.js";
import { apiRouter } from "./routes/index.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const isConfiguredClient = origin === env.clientUrl;
      const isLocalViteOrigin = /^http:\/\/localhost:5\d{3}$/.test(origin);
      if (isConfiguredClient || isLocalViteOrigin) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin not allowed"));
    },
    methods: ["GET", "POST", "PATCH"],
    credentials: false
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);
app.use(mockAuth);

app.use("/api", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
