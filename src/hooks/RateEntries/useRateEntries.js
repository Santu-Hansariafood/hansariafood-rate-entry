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

        const safeRates = Array.isArray(ratesRes.data) ? ratesRes.data : [];

        setRates(
          safeRates.filter((r) => r?.newRate && r?.mobile)
        );

        const safeUsers = Array.isArray(usersRes.data) ? usersRes.data : [];

        setUsers(safeUsers);
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
    const safeUsers = Array.isArray(users) ? users : [];

    return safeUsers.reduce((acc, user) => {
      if (user.mobile) {
        acc[user.mobile] = user.name || "Unknown User";
      }
      return acc;
    }, {});
  }, [users]);

  const groupedRates = useMemo(() => {
    const safeRates = Array.isArray(rates) ? rates : [];

    return safeRates.reduce((acc, rate) => {
      if (!rate.mobile) return acc;
      if (!acc[rate.mobile]) acc[rate.mobile] = [];
      acc[rate.mobile].push(rate);
      return acc;
    }, {});
  }, [rates]);

  return { groupedRates, mobileToName, loading };
};

export default useRateEntries;
