"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export default function useWebSocketNotifications(type) {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:9000";
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log(`WebSocket Connected for type: ${type}`);
      setIsConnected(true);
      // Send type filter to server if needed
      if (type) {
        socket.send(JSON.stringify({ action: "subscribe", type }));
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "notification") {
          const newNotification = data.payload;
          
          // Check if it matches the current type filter
          if (!type || matchesType(newNotification, type)) {
            setNotifications((prev) => [newNotification, ...prev].slice(0, 100));
          }
        } else if (data.type === "initial_notifications") {
          setNotifications(data.payload);
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket Disconnected. Reconnecting...");
      setIsConnected(false);
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    socket.onerror = (err) => {
      console.error("WebSocket Error:", err);
      socket.close();
    };

    socketRef.current = socket;
  }, [type]);

  useEffect(() => {
    connect();
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  const matchesType = (notification, filterType) => {
    if (!filterType || filterType === "all") return true;
    
    const commodity = (notification.commodity || "").toUpperCase();
    
    if (filterType === "MDOC") {
      return /M\s?DOC|Maize Ddgs Doc/i.test(commodity);
    }
    if (filterType === "DDGS") {
      return /DDGS/i.test(commodity);
    }
    if (filterType === "Soya") {
      return /SBM/i.test(commodity);
    }
    
    return commodity.includes(filterType.toUpperCase());
  };

  return { notifications, isConnected, setNotifications };
}
