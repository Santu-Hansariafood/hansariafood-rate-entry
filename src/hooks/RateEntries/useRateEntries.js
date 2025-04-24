import { useState, useEffect, useMemo } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const useRateEntries = () => {
  const [rates, setRates] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ratesRes, usersRes] = await Promise.all([
          axiosInstance.get("/rate"),
          axiosInstance.get("/auth/register"),
        ]);
        setRates(ratesRes.data.filter((r) => r.newRate && r.mobile));
        setUsers(usersRes.data);
      } catch (error) {
        toast.error("Failed to fetch rate entries");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const mobileToName = useMemo(() => {
    return users.reduce((acc, user) => {
      acc[user.mobile] = user.name;
      return acc;
    }, {});
  }, [users]);

  const groupedRates = useMemo(() => {
    return rates.reduce((acc, rate) => {
      if (!acc[rate.mobile]) acc[rate.mobile] = [];
      acc[rate.mobile].push(rate);
      return acc;
    }, {});
  }, [rates]);

  return { groupedRates, mobileToName, loading };
};

export default useRateEntries;
