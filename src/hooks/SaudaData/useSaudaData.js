import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const useSaudaData = () => {
  const [companies, setCompanies] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]); // Store all companies
  const [rateData, setRateData] = useState([]);
  const [saudaStatusMap, setSaudaStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all"); // Start with "all" to show everything initially

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

  // Helper function to chunk array into smaller arrays
  const chunkArray = (array, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };

  // Fetch all data upfront - only runs once on mount
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Step 1: Fetch ALL companies (no filter) upfront
        const companiesRes = await axiosInstance.get(`/companies?limit=10000`);
        const fetchedAllCompanies = companiesRes.data.companies || [];
        setAllCompanies(fetchedAllCompanies);

        const companyNames = fetchedAllCompanies.map((c) => c.name);
        if (companyNames.length === 0) {
          setLoading(false);
          return;
        }

        // Step 2: Fetch all rates at once (no company filter = all rates)
        const ratesRes = await axiosInstance.get(`/rate`);
        const allRates = ratesRes.data || [];
        setRateData(allRates);

        // Step 3: Fetch all sauda data in parallel batches (using new batch endpoint)
        const saudaChunks = chunkArray(companyNames, 100); // Larger chunks for sauda
        const saudaRequests = saudaChunks.map((chunk) =>
          axiosInstance
            .get(
              `/save-sauda?companies=${chunk.join(",")}&date=${today}`
            )
            .then((res) => res.data?.entries || {})
            .catch((err) => {
              console.error("Error fetching sauda batch:", err);
              return {};
            })
        );

        const saudaResponses = await Promise.all(saudaRequests);
        const allSaudaEntries = Object.assign({}, ...saudaResponses);

        // Process sauda statuses
        const saudaStatuses = {};
        companyNames.forEach((company) => {
          let status = "green";
          const entry = allSaudaEntries[company];
          if (entry?.saudaEntries) {
            const values = Object.values(entry.saudaEntries);

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

    fetchAllData();
  }, [today]); // Only depend on today, not filterType

  // Filter companies based on filterType (client-side filtering, no API call)
  useEffect(() => {
    if (allCompanies.length === 0) {
      setCompanies([]);
      return;
    }

    let filtered = allCompanies;
    if (filterType !== "all") {
      filtered = allCompanies.filter((company) => {
        const types = Array.isArray(company.type) ? company.type : [company.type];
        return types.some(t => t?.toLowerCase() === filterType.toLowerCase());
      });
    }
    setCompanies(filtered);
  }, [allCompanies, filterType]);

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