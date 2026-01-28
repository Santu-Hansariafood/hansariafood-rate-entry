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
    
    // Optional: Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return { notifications, loading, refreshNotifications: fetchNotifications };
}
