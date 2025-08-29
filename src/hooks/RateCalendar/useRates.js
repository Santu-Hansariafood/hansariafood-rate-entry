import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

export default function useRates({ company, commodity }) {
  const [allRates, setAllRates] = useState([]);
  const [scopedRates, setScopedRates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllRates = async () => {
      try {
        const res = await axiosInstance.get(`/rate`);
        setAllRates(res.data || []);
      } catch (e) {
        console.error("Error fetching all rates:", e);
      }
    };
    fetchAllRates();
  }, []);

  useEffect(() => {
    if (!company || !commodity) {
      setScopedRates([]);
      return;
    }
    const fetchScopedRates = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          `/rate?company=${encodeURIComponent(
            company
          )}&commodity=${encodeURIComponent(commodity)}`
        );
        setScopedRates(res.data || []);
      } catch (e) {
        console.error("Error fetching scoped rates:", e);
        setScopedRates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchScopedRates();
  }, [company, commodity]);

  return { allRates, scopedRates, loading };
}
