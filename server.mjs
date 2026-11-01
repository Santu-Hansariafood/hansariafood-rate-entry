import { createServer } from "http";
import { parse } from "url";
import next from "next";
import cron from "node-cron";
import nextEnv from "@next/env";
import { Server } from "socket.io";
import { setIO } from "./src/lib/socket.js";

try {
  nextEnv.loadEnvConfig(process.cwd());
} catch (err) {
  console.warn("Could not load .env files:", err.message);
}

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT) || 16000;

function scheduleDailyRateReport() {
  if (dev) {
    console.log("Daily rate report scheduler disabled in development.");
    return;
  }

  cron.schedule(
    "0 20 * * *",
    async () => {
      console.log(
        "Running scheduled task: Sending daily rate report at 8 PM IST",
      );
      try {
        const { sendDailyRateReport } =
          await import("./src/lib/reports/dailyRateReport.js");
        await sendDailyRateReport();
      } catch (err) {
        console.error("Scheduled daily rate report failed:", err);
      }
    },
    { timezone: "Asia/Kolkata" },
  );

  console.log("Scheduled daily rate report for 8:00 PM IST.");
}

if (global.serverStarted) {
  console.log("Server already started. Skipping...");
  process.exit(0);
}
global.serverStarted = true;

const app = next({
  dev,
  hostname: "0.0.0.0",
  port: port,
});

const handle = app.getRequestHandler();

async function startServer() {
  try {
    await app.prepare();

    scheduleDailyRateReport();

    const httpServer = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        const { pathname } = parsedUrl;

        if (pathname.startsWith("/api/auth")) {
          console.log(`Auth Request: ${req.method} ${pathname}`);
        }

        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Request Error:", err);
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    });

    const io = new Server(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_SITE_URL || "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    setIO(io);

    io.on("connection", (socket) => {
      const { token } = socket.handshake.auth;
      console.log(
        `Client connected: ${socket.id}${token ? ` (User: ${token})` : ""}`,
      );

      socket.on("disconnect", (reason) => {
        console.log(`Client disconnected: ${socket.id} (Reason: ${reason})`);
      });
    });

    const shutdown = () => {
      console.log("Shutting down server...");
      io.close();
      httpServer.close(() => {
        console.log("HTTP server closed.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

    httpServer.listen(port, "0.0.0.0", () => {
      console.log(
        `🚀 Server running on port ${port} in ${dev ? "development" : "production"} mode`,
      );
    });

    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception:", err);
    });

    process.on("unhandledRejection", (err) => {
      console.error("Unhandled Rejection:", err);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
