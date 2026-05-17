import { useState, useEffect, useMemo } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

// Simple cache to avoid multiple requests for the same user list in the same session
let cachedUsers = null;
let usersPromise = null;

const useRateEntries = () => {
  const [rates, setRates] = useState([]);
  const [saudas, setSaudas] = useState([]);
  const [users, setUsers] = useState(cachedUsers || []);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");

  useEffect(() => {
    const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
    setDate(today);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if(!date) return;
      
      setLoading(true);
      try {
        // Use existing promise if a request is already in flight
        if (!usersPromise && !cachedUsers) {
          usersPromise = axiosInstance.get("/auth/register?minimal=true").then(res => {
            const userData = res.data?.users || res.data || [];
            cachedUsers = Array.isArray(userData) ? userData : [];
            return cachedUsers;
          }).finally(() => {
            usersPromise = null;
          });
        }

        const [ratesRes, saudaRes, fetchedUsers] = await Promise.all([
          axiosInstance.get("/rate?todayOnly=true"),
          axiosInstance.get(`/sauda/today?date=${date}`),
          usersPromise || Promise.resolve(cachedUsers)
        ]);

        const safeRates = Array.isArray(ratesRes.data) ? ratesRes.data : [];

        setRates(
          safeRates.filter((r) => r?.newRate && r?.mobile)
        );

        const safeSaudas = Array.isArray(saudaRes.data) ? saudaRes.data : [];
        setSaudas(safeSaudas);

        setUsers(fetchedUsers || []);
      } catch (error) {
        toast.error("Failed to fetch rate entries");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date]);

  const mobileToName = useMemo(() => {
    const safeUsers = Array.isArray(users) ? users : [];

    return safeUsers.reduce((acc, user) => {
      const mobileKey = String(user.mobile);
      if (mobileKey) {
        acc[mobileKey] = user.name || "Unknown User";
      }
      return acc;
    }, {});
  }, [users]);

  const groupedRates = useMemo(() => {
    const safeRates = Array.isArray(rates) ? rates : [];
    const safeSaudas = Array.isArray(saudas) ? saudas : [];

    const grouped = {};

    // Group Rates
    safeRates.forEach((rate) => {
      if (!rate.mobile) return;
      const mobileKey = String(rate.mobile);
      if (!grouped[mobileKey]) grouped[mobileKey] = { rates: [], saudas: [] };
      grouped[mobileKey].rates.push(rate);
    });

    // Group Saudas
    safeSaudas.forEach((sauda) => {
      if (!sauda.mobile) return;
      const mobileKey = String(sauda.mobile);
      if (!grouped[mobileKey]) grouped[mobileKey] = { rates: [], saudas: [] };
      grouped[mobileKey].saudas.push(sauda);
    });

    return grouped;
  }, [rates, saudas]);

  return { groupedRates, mobileToName, loading, date, setDate };
};

export default useRateEntries;
