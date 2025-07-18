import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

export const useInactiveDescriptions = (days) => {
  const [descriptions, setDescriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInactive = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          `/save-sauda/description-stats?days=${days}`
        );
        if (res.status !== 200) throw new Error("Failed to fetch data");
        setDescriptions(res.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setDescriptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInactive();
  }, [days]);

  return { descriptions, loading };
};
