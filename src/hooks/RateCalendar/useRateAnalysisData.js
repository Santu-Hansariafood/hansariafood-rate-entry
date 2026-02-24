import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

export default function useRateAnalysisData() {
  const [companies, setCompanies] = useState([]);
  const [allRates, setAllRates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/rate-analysis", {
          signal: controller.signal,
        });
        const data = res.data || {};
        const listCompanies = Array.isArray(data.companies)
          ? data.companies
          : [];
        const listRates = Array.isArray(data.rates) ? data.rates : [];
        setCompanies(listCompanies);
        setAllRates(listRates);
      } catch (error) {
        if (error.name !== "CanceledError" && error.name !== "AbortError") {
          console.error("Error fetching rate analysis data:", error);
          setCompanies([]);
          setAllRates([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, []);

  return { companies, allRates, loading };
}

