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

  // Helper function to chunk array into smaller arrays
  const chunkArray = (array, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };

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

        // Chunk company names to avoid URL length issues
        const companyChunks = chunkArray(companyNames, 50); // Adjust chunk size as needed
        
        // Fetch rates in chunks
        const rateRequests = companyChunks.map(chunk => 
          axiosInstance.get(`/rate?companies=${chunk.join(",")}`)
        );
        
        const rateResponses = await Promise.all(rateRequests);
        const allRates = rateResponses.flatMap(response => response.data || []);
        setRateData(allRates);

        // Fetch sauda data for each company
        const saudaRequests = companyNames.map((company) =>
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

        const saudaResults = await Promise.all(saudaRequests);

        const saudaStatuses = {};
        saudaResults.forEach(({ company, entry }) => {
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