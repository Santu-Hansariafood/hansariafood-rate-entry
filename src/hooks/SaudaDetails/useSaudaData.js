import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

export const useSaudaData = (companyName) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState([]);
  const [sellerInfo, setSellerInfo] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (!companyName) return;

    const fetchSaudaData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axiosInstance.get(
          `/save-sauda/sauda-descriptions?companyName=${encodeURIComponent(
            companyName
          )}&page=1`
        );
        const results = res?.data?.data?.[0];
        const days = results?.days || [];
        const sellerInfo = res?.data?.sellerInfo || null;
        console.log("Seller Info received:", sellerInfo); // Debug log
        
        if (mounted) {
          setData(days);
          setSellerInfo(sellerInfo);
        }
      } catch (e) {
        if (mounted) setError("Failed to load sauda details");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSaudaData();

    return () => {
      mounted = false;
    };
  }, [companyName]);

  return { loading, error, data, sellerInfo };
};
