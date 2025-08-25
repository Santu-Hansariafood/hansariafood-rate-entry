"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

export function useSellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchSellers = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get("/seller");
        if (mounted && data?.sellers) {
          setSellers(data.sellers);
        }
      } catch (error) {
        console.error("Failed to fetch sellers:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchSellers();

    return () => {
      mounted = false;
    };
  }, []);

  return { sellers, loading };
}
