import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { setIO } from "./src/lib/socket.js";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT) || 16000;

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
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    setIO(io);

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    httpServer.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${port}`);
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