"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSession } from "next-auth/react";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { data: session } = useSession();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Only connect if we're in the browser and have a session (optional)
    if (typeof window === "undefined") return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
    
    const socketInstance = io(socketUrl, {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      // Add authentication token if needed
      auth: {
        token: session?.user?.id || null,
      },
    });

    socketInstance.on("connect", () => {
      console.log("WebSocket connected:", socketInstance.id);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("WebSocket connection error:", err.message);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [session?.user?.id]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
