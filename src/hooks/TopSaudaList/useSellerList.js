"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const useSellerList = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/save-sauda/sauda-descriptions");
        const sellersResp = Array.isArray(res.data.sellers)
          ? res.data.sellers
          : [];
        const normalized = sellersResp.map((s) =>
          typeof s === "string" ? { name: s, latestDate: null } : s
        );
        setSellers(normalized);
      } catch (err) {
        console.error("Error fetching sellers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, []);

  return { sellers, loading };
};

export default useSellerList;
