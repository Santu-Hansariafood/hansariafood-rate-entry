"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export default function useWebSocketNotifications(type) {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectDelay = 30000; // 30 seconds

  const connect = useCallback(() => {
    if (typeof window === "undefined" || !window.WebSocket) return;
    if (socketRef.current?.readyState === window.WebSocket.OPEN) return;

    const getWsUrl = () => {
      if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
      
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.hostname;
      return `${protocol}//${host}:9000`;
    };

    const wsUrl = getWsUrl();
    if (!wsUrl) return;
    
    try {
      const socket = new window.WebSocket(wsUrl);

      socket.onopen = () => {
        console.log(`[WebSocket] Connected for: ${type || 'all'}`);
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        
        if (type) {
          socket.send(JSON.stringify({ action: "subscribe", type }));
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "notification") {
            setNotifications((prev) => {
              // Deduplicate based on unique content if possible
              const newNotif = data.payload;
              if (!newNotif) return prev;
              
              const isDuplicate = prev.some(n => 
                n && 
                (n.companyName || n.company) === (newNotif.companyName || newNotif.company) && 
                n.location === newNotif.location && 
                (n.rate || n.newRate) === (newNotif.rate || newNotif.newRate) &&
                (n.time || n.updateTime) === (newNotif.time || newNotif.updateTime)
              );
              
              if (isDuplicate) return prev;
              return [newNotif, ...prev].slice(0, 100);
            });
          } else if (data.type === "initial_notifications") {
            setNotifications(data.payload);
          }
        } catch (err) {
          console.error("[WebSocket] Message parsing error:", err);
        }
      };

      socket.onclose = (event) => {
        setIsConnected(false);
        socketRef.current = null;
        
        if (!event.wasClean) {
          // Exponential backoff for reconnection
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), maxReconnectDelay);
          console.log(`[WebSocket] Disconnected. Reconnecting in ${delay/1000}s...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connect();
          }, delay);
        }
      };

      socket.onerror = (err) => {
        console.error("[WebSocket] Error:", err);
        socket.close();
      };

      socketRef.current = socket;
    } catch (err) {
      console.error("[WebSocket] Connection attempt failed:", err);
    }
  }, [type]);

  useEffect(() => {
    connect();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close(1000, "Component unmounted");
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return { notifications, isConnected, setNotifications };
}
