const WebSocket = require("ws");
const http = require("http");
const fs = require("fs");
const path = require("path");

// Load environment variables from .env or .env.local
try {
  const envPath = fs.existsSync(path.join(__dirname, "../.env.local"))
    ? path.join(__dirname, "../.env.local")
    : path.join(__dirname, "../.env");
  
  require("dotenv").config({ path: envPath });
  console.log(`Loaded environment from: ${envPath}`);
} catch (e) {
  console.warn("Could not load .env file, using defaults");
}

const PORT = process.env.WS_PORT || 9000;
const WS_SECRET = process.env.WS_SECRET || "change-me-in-production";

const server = http.createServer((req, res) => {
  // Simple health check
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", clients: wss.clients.size }));
    return;
  }

  // Secure internal broadcast endpoint
  if (req.method === "POST" && req.url === "/broadcast") {
    const authHeader = req.headers["authorization"];
    if (authHeader !== `Bearer ${WS_SECRET}`) {
      console.warn(`Unauthorized broadcast attempt from ${req.socket.remoteAddress}`);
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }

    let body = "";
    req.on("data", (chunk) => { body += chunk.toString(); });
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        broadcast(data);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

const wss = new WebSocket.Server({ 
  server,
  // Add some basic protections
  clientTracking: true,
  maxPayload: 1024 * 1024 // 1MB
});

// Broadcast to relevant clients based on their subscriptions
function broadcast(data) {
  const message = JSON.stringify(data);
  const dataType = data.type; // e.g., 'rate_updated', 'sauda_notification', etc.
  const payload = data.payload || {};
  const commodity = (payload.commodity || "").toUpperCase();

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      // If client has a specific subscription, check if message matches
      if (client.subscriptionType) {
        let shouldSend = false;
        const sub = client.subscriptionType;

        if (sub === "all_notifications" || sub === "all_rates") {
          shouldSend = true;
        } else if (sub === "sauda" && (dataType === "sauda_notification" || dataType === "sauda_updated")) {
          shouldSend = true;
        } else if (sub === "MDOC" && /M\s?DOC|Maize Ddgs Doc/i.test(commodity)) {
          shouldSend = true;
        } else if (sub === "DDGS" && /DDGS/i.test(commodity)) {
          shouldSend = true;
        } else if (sub === "Soya" && /SBM/i.test(commodity)) {
          shouldSend = true;
        } else if (commodity.includes(sub.toUpperCase())) {
          shouldSend = true;
        }

        if (shouldSend) client.send(message);
      } else {
        // No subscription filter, broadcast to all for backward compatibility
        client.send(message);
      }
    }
  });
}

// Heartbeat to detect dead connections
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`[${new Date().toISOString()}] New client connected from ${ip}`);
  
  ws.isAlive = true;
  ws.on("pong", () => { ws.isAlive = true; });

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.action === "subscribe") {
        ws.subscriptionType = data.type;
        console.log(`Client subscribed to type: ${data.type}`);
        return;
      }

      // Allow clients to trigger broadcasts if necessary (e.g., chat)
      broadcast(data);
    } catch (err) {
      console.error("Error processing message:", err);
    }
  });

  ws.on("close", () => {
    console.log(`Client from ${ip} disconnected`);
  });

  ws.onerror = (err) => {
    console.error(`WebSocket error from ${ip}:`, err);
  };
});

wss.on("close", () => {
  clearInterval(interval);
});

// Graceful shutdown
function shutdown() {
  console.log("Shutting down WebSocket server...");
  clearInterval(interval);
  wss.clients.forEach((client) => client.close());
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
  
  // Force exit after 5 seconds if not closed gracefully
  setTimeout(() => process.exit(1), 5000);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

server.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] WebSocket & Broadcast server running on port ${PORT}`);
  console.log(`Internal broadcast endpoint: http://localhost:${PORT}/broadcast`);
});
