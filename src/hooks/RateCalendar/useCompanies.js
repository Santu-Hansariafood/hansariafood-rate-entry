import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

export default function useCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        let allCompanies = [];
        let page = 1;
        let hasMore = true;
        while (hasMore) {
          const response = await axiosInstance.get(
            `/managecompany?page=${page}&limit=50`
          );
          const data = response.data.companies || response.data || [];
          if (Array.isArray(data) && data.length > 0) {
            allCompanies = [...allCompanies, ...data];
            page++;
          } else {
            hasMore = false;
          }
        }
        setCompanies(allCompanies);
      } catch (e) {
        console.error("Error fetching companies:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  return { companies, loading };
}
