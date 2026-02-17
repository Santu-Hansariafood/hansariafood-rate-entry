import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

export default function useRateAnalysisData() {
  const [companies, setCompanies] = useState([]);
  const [allRates, setAllRates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/rate-analysis");
        const data = res.data || {};
        const listCompanies = Array.isArray(data.companies)
          ? data.companies
          : [];
        const listRates = Array.isArray(data.rates) ? data.rates : [];
        setCompanies(listCompanies);
        setAllRates(listRates);
      } catch (error) {
        console.error("Error fetching rate analysis data:", error);
        setCompanies([]);
        setAllRates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { companies, allRates, loading };
}

