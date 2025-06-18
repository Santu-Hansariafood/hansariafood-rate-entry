"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export function useCompanyData(name) {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(`/managecompany?q=${name}`);
        const first = data?.companies?.[0];
        if (!first) toast.error("Company details not found");
        if (mounted) setCompany(first ?? null);
      } catch {
        toast.error("Failed to load company details");
      } finally {
        mounted && setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [name]);

  return { company, loading };
}
