"use client";

import { useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const useSaudaDetails = () => {
  const [saudaDetails, setSaudaDetails] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchSaudaDetails = async (sellerName, page = 1) => {
    try {
      setLoading(true);
      setSelectedSeller(sellerName);
      setCurrentPage(page);

      const url = `/save-sauda/sauda-descriptions?sellerName=${encodeURIComponent(
        sellerName
      )}&page=${page}`;

      const res = await axiosInstance.get(url);
      setSaudaDetails(res.data.data || []);
    } catch (err) {
      console.error("Error fetching sauda details:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    saudaDetails,
    selectedSeller,
    currentPage,
    loading,
    fetchSaudaDetails,
    setSelectedSeller,
    setSaudaDetails,
  };
};

export default useSaudaDetails;
