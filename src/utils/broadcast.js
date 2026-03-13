/**
 * Internal helper to broadcast messages through the WebSocket server
 */
export async function broadcast(type, payload) {
  try {
    const wsUrl = process.env.WS_INTERNAL_URL || "http://localhost:9000/broadcast";
    const wsSecret = process.env.WS_SECRET || "change-me-in-production";
    
    await fetch(wsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${wsSecret}`,
      },
      body: JSON.stringify({
        type,
        payload,
      }),
    });
  } catch (err) {
    console.error("Internal broadcast failed:", err);
  }
}
