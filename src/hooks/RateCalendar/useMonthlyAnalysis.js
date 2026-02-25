import { useState, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export default function useMonthlyAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchMonthlyAnalysis = useCallback(async (commodity, startDate, endDate) => {
    if (!commodity) return;
    
    setLoading(true);
    try {
      const res = await axiosInstance.get("/rate-analysis/monthly", {
        params: {
          commodity,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString()
        }
      });
      setData(res.data);
    } catch (error) {
      console.error("Error fetching monthly analysis:", error);
      toast.error("Failed to fetch monthly analysis report");
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, fetchMonthlyAnalysis };
}
