import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/lib/axiosInstance/axiosInstance';

export default function useRateNotifications(type) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/rate-notifications', {
        params: { type }
      });
      if (res.data?.success) {
        setNotifications(res.data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchNotifications();
    
    // WebSocket Integration
    let socket = null;
    let reconnectTimer = null;

    const connectWS = () => {
      if (typeof window === "undefined" || !window.WebSocket) return;
      const getWsUrl = () => {
        if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.hostname;
        return `${protocol}//${host}:3000`;
      };
      const wsUrl = getWsUrl();
      try {
        socket = new window.WebSocket(wsUrl);

        socket.onopen = () => {
          console.log(`[Rate] WebSocket Connected for ${type}`);
          socket.send(JSON.stringify({ action: "subscribe", type }));
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "rate_updated" || data.type === "notification") {
              fetchNotifications();
            }
          } catch (err) {
            console.error("[Rate] WebSocket message error:", err);
          }
        };

        socket.onclose = () => {
          console.log(`[Rate] WebSocket Disconnected for ${type}. Reconnecting...`);
          reconnectTimer = setTimeout(connectWS, 5000);
        };

        socket.onerror = (err) => {
          console.error("[Rate] WebSocket error:", err);
          socket.close();
        };
      } catch (err) {
        console.error("[Rate] WebSocket connection error:", err);
        reconnectTimer = setTimeout(connectWS, 5000);
      }
    };

    connectWS();

    return () => {
      if (socket) socket.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [fetchNotifications, type]);

  return { notifications, loading, refreshNotifications: fetchNotifications };
}
