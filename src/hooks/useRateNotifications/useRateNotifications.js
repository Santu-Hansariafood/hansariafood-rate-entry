import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/lib/axiosInstance/axiosInstance';
import { io } from 'socket.io-client';

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://hansariafood.in/');

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
    
    const socket = io(socketUrl);

    socket.on('notification', (payload) => {
      if (payload.type === 'rate') {
        // If it's a rate notification, we might want to refresh or just add it
        // To ensure consistency with the backend logic, refreshing is safer
        fetchNotifications();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchNotifications]);

  return { notifications, loading, refreshNotifications: fetchNotifications };
}
