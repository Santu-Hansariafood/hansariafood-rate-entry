"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export default function useCompaniesWithRateUpdate(open) {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await axiosInstance.get("/managecompany?limit=5000");
        const companyList = res.data?.companies || [];
        setCompanies(companyList);

        const todayRes = await axiosInstance.get("/rateupdate");
        const today = new Date().toISOString().split("T")[0];
        const todayUpdate = todayRes.data?.data?.find((u) => u.date === today);

        setSelectedCompanies(todayUpdate ? todayUpdate.companies : []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load companies or updates");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open]);

  return { companies, selectedCompanies, setSelectedCompanies, loading };
}
