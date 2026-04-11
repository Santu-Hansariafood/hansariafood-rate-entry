import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/lib/axiosInstance/axiosInstance';
import { useSocket } from '@/context/SocketContext';

export default function useRateNotifications(type) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const socket = useSocket();

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
    
    if (!socket) return;

    const handleNotification = (payload) => {
      if (payload.type === 'rate') {
        fetchNotifications();
      }
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [fetchNotifications, socket]);

  return { notifications, loading, refreshNotifications: fetchNotifications };
}
