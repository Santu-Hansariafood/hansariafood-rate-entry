import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const CACHE_DURATION = 2 * 60 * 1000;
const CACHE_KEYS = {
  companies: "sauda_companies_cache",
  rates: "sauda_rates_cache",
  saudaStatus: "sauda_status_cache",
};

const useSaudaData = () => {
  const [companies, setCompanies] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);
  const [rateData, setRateData] = useState([]);
  const [saudaStatusMap, setSaudaStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const isFetchingRef = useRef(false);
  const cacheTimestampRef = useRef({});

  const today = useMemo(
    () => new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
    []
  );

  const getCachedData = useCallback((key) => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
      localStorage.removeItem(key);
      return null;
    } catch {
      return null;
    }
  }, []);

  const setCachedData = useCallback((key, data) => {
    try {
      localStorage.setItem(
        key,
        JSON.stringify({ data, timestamp: Date.now() })
      );
    } catch (err) {
      console.warn("Failed to cache data:", err);
    }
  }, []);

  const hasRate = useCallback(
    (companyName) =>
      rateData.some(
        (rate) =>
          rate.company === companyName &&
          rate.hasNewRateToday &&
          rate.newRate !== null &&
          rate.newRate !== undefined &&
          rate.newRate !== "" &&
          !isNaN(rate.newRate)
      ),
    [rateData]
  );

  const updateCompanyStatus = useCallback((companyName, status) => {
    setSaudaStatusMap((prev) => ({
      ...prev,
      [companyName]: status,
    }));
  }, []);

  const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  const fetchAllData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      setLoading(true);
      const cachedCompanies = getCachedData(CACHE_KEYS.companies);
      const cachedRates = getCachedData(CACHE_KEYS.rates);
      const cachedStatus = getCachedData(`${CACHE_KEYS.saudaStatus}_${today}`);

      if (cachedCompanies && cachedRates && cachedStatus) {
        setAllCompanies(cachedCompanies);
        setRateData(cachedRates);
        setSaudaStatusMap(cachedStatus);
        setLoading(false);
        isFetchingRef.current = false;
        return;
      }
      const [companiesRes, ratesRes] = await Promise.all([
        axiosInstance.get(`/companies?limit=10000`),
        axiosInstance.get(`/rate`),
      ]);

      const fetchedAllCompanies = companiesRes.data.companies || [];
      const allRates = ratesRes.data || [];

      setAllCompanies(fetchedAllCompanies);
      setRateData(allRates);
      setCachedData(CACHE_KEYS.companies, fetchedAllCompanies);
      setCachedData(CACHE_KEYS.rates, allRates);

      const companyNames = fetchedAllCompanies.map((c) => c.name);
      if (companyNames.length === 0) {
        setLoading(false);
        isFetchingRef.current = false;
        return;
      }

      if (!cachedStatus) {
        const saudaChunks = chunkArray(companyNames, 100);
        const saudaRequests = saudaChunks.map((chunk) =>
          axiosInstance
            .get(`/save-sauda?companies=${chunk.join(",")}&date=${today}`)
            .then((res) => res.data?.entries || {})
            .catch(() => ({}))
        );

        const responses = await Promise.all(saudaRequests);
        const allSaudaEntries = Object.assign({}, ...responses);

        const saudaStatuses = {};
        for (const company of companyNames) {
          let status = "green";
          const entry = allSaudaEntries[company];

          if (entry?.saudaEntries) {
            const values = Object.values(entry.saudaEntries);
            let hasSauda = false;
            let allNosFilled = true;

            for (const entries of values) {
              for (const e of entries) {
                if (
                  (e.tons && Number(e.tons) > 0) ||
                  (e.description && e.description.trim() !== "")
                ) {
                  hasSauda = true;
                }
                if (
                  !e.saudaNo ||
                  e.saudaNo === null ||
                  String(e.saudaNo).trim() === ""
                ) {
                  allNosFilled = false;
                }
              }
              if (hasSauda && !allNosFilled) break;
            }

            if (hasSauda && allNosFilled) status = "blue";
            else if (hasSauda) status = "yellow";
          }

          saudaStatuses[company] = status;
        }

        setSaudaStatusMap(saudaStatuses);
        setCachedData(`${CACHE_KEYS.saudaStatus}_${today}`, saudaStatuses);
      } else {
        setSaudaStatusMap(cachedStatus);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load sauda data");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [today, getCachedData, setCachedData]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (allCompanies.length === 0) {
      setCompanies([]);
      return;
    }

    let filtered = allCompanies;
    if (filterType !== "all") {
      filtered = allCompanies.filter((company) => {
        const types = Array.isArray(company.type)
          ? company.type
          : [company.type];
        return types.some((t) => t?.toLowerCase() === filterType.toLowerCase());
      });
    }
    setCompanies(filtered);
  }, [allCompanies, filterType]);

  const refreshSaudaData = useCallback(() => {
    Object.values(CACHE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem(`${CACHE_KEYS.saudaStatus}_${today}`);
    fetchAllData();
  }, [fetchAllData, today]);

  useEffect(() => {
    const handleSaudaUpdate = () => {
      localStorage.removeItem(`${CACHE_KEYS.saudaStatus}_${today}`);
      fetchAllData();
    };
    window.addEventListener("sauda_updated", handleSaudaUpdate);
    return () => window.removeEventListener("sauda_updated", handleSaudaUpdate);
  }, [fetchAllData, today]);

  return {
    companies,
    rateData,
    saudaStatusMap,
    loading,
    hasRate,
    updateCompanyStatus,
    filterType,
    setFilterType,
    refreshSaudaData,
  };
};

export default useSaudaData;
