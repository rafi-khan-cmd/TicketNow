import { app } from "./app.js";
import { env } from "./config/env.js";
import { initDb } from "./db/initDb.js";

function startServerWithFallback(startPort, maxAttempts = 10) {
  return new Promise((resolve, reject) => {
    function tryPort(port, attemptsLeft) {
      const server = app.listen(port, () => {
        console.log(`API server running on port ${port}`);
        resolve(server);
      });

      server.on("error", (err) => {
        if (err.code === "EADDRINUSE" && attemptsLeft > 0) {
          console.warn(`Port ${port} is in use, trying ${port + 1}...`);
          tryPort(port + 1, attemptsLeft - 1);
          return;
        }
        reject(err);
      });
    }

    tryPort(startPort, maxAttempts);
  });
}

async function bootstrap() {
  await initDb();
  await startServerWithFallback(env.port);
}

bootstrap().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
