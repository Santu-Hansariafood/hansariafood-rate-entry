"use client";

import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

export function useSellers({ initialPage = 1, limit = 50 } = {}) {
  const [sellers, setSellers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** 🔹 Fetch sellers from API */
  const fetchSellers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/sellers", {
        params: { page, limit, search },
      });

      const sellerDocs = res?.data?.sellers || [];
      setSellers(sellerDocs.map((s) => s.sellerName));
      setCompanies(
        sellerDocs.flatMap((s) => s.companies).filter(Boolean)
      );
      setTotal(res?.data?.total || 0);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to fetch sellers");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  /** 🔹 Create new seller */
  const createSeller = useCallback(async (sellerName, companies = []) => {
    try {
      const res = await axiosInstance.post("/sellers", {
        sellerName,
        companies,
      });
      await fetchSellers(); // refresh after create
      return res.data;
    } catch (err) {
      throw new Error(err?.response?.data?.error || "Failed to create seller");
    }
  }, [fetchSellers]);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  return {
    sellers,       // ["Seller A", "Seller B"]
    companies,     // ["Company X", "Company Y"]
    total,
    page,
    setPage,
    search,
    setSearch,
    loading,
    error,
    fetchSellers,
    createSeller,
  };
}
