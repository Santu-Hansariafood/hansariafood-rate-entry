"use client";
import { useState, useEffect } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export default function useCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const { data } = await axiosInstance.get("/managecompany?limit=1000");
      setCompanies(data.companies);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch companies");
    } finally {
      setLoadingCompanies(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return { companies, fetchCompanies, loadingCompanies };
}
