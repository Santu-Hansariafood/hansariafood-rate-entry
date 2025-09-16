import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const useSaudaData = () => {
  const [companies, setCompanies] = useState([]);
  const [rateData, setRateData] = useState([]);
  const [saudaStatusMap, setSaudaStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");

  const today = useMemo(() => {
    return new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let query = `/companies?limit=10000`;
        if (filterType !== "all") {
          query += `&type=${filterType}`;
        }

        const res = await axiosInstance.get(query);
        const fetchedCompanies = res.data.companies || [];
        setCompanies(fetchedCompanies);

        const companyNames = fetchedCompanies.map((c) => c.name);
        if (companyNames.length === 0) return;
        
        // Process companies in batches to avoid 431 errors (header too large)
        const BATCH_SIZE = 20;
        let allRateData = [];
        let allSaudaRes = [];
        
        // Process rates in batches
        for (let i = 0; i < companyNames.length; i += BATCH_SIZE) {
          const batchCompanies = companyNames.slice(i, i + BATCH_SIZE);
          try {
            const batchRateRes = await axiosInstance.get(`/rate?company=${batchCompanies[0]}&commodity=all`);
            allRateData = [...allRateData, ...(batchRateRes.data || [])];
          } catch (err) {
            console.error(`Failed to fetch rates for batch ${i}:`, err);
          }
        }
        
        // Process sauda entries in batches
        for (let i = 0; i < companyNames.length; i += BATCH_SIZE) {
          const batchCompanies = companyNames.slice(i, i + BATCH_SIZE);
          const batchPromises = batchCompanies.map(company =>
            axiosInstance
              .get(`/save-sauda?company=${company}&date=${today}`)
              .then((res) => ({
                company,
                entry: res.data?.entry?.saudaEntries,
              }))
              .catch(() => ({
                company,
                entry: null,
              }))
          );
          
          const batchResults = await Promise.all(batchPromises);
          allSaudaRes = [...allSaudaRes, ...batchResults];
        }
        
        setRateData(allRateData || []);

        const saudaStatuses = {};
        allSaudaRes.forEach(({ company, entry }) => {
          let status = "green";
          if (entry) {
            const values = Object.values(entry);

            const hasSauda = values.some((entries) =>
              entries.some(
                (e) =>
                  (e.tons && Number(e.tons) > 0) ||
                  (e.description && e.description.trim() !== "")
              )
            );

            const allSaudaNosFilled = values.every((entries) =>
              entries.every(
                (e) =>
                  e.saudaNo !== null &&
                  e.saudaNo !== undefined &&
                  String(e.saudaNo).trim() !== ""
              )
            );

            if (hasSauda && allSaudaNosFilled) status = "blue";
            else if (hasSauda) status = "yellow";
          }

          saudaStatuses[company] = status;
        });

        setSaudaStatusMap(saudaStatuses);
      } catch (err) {
        console.error("Failed to fetch sauda data", err);
        toast.error("Failed to load company or rate data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [today, filterType]);

  return {
    companies,
    rateData,
    saudaStatusMap,
    loading,
    hasRate,
    updateCompanyStatus,
    filterType,
    setFilterType,
  };
};

export default useSaudaData;
