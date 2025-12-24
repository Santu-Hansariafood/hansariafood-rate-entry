import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const useSaudaData = () => {
  const [companies, setCompanies] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);
  const [rateData, setRateData] = useState([]);
  const [saudaStatusMap, setSaudaStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");

  const today = useMemo(
    () => new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
    []
  );

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
    setLoading(true);
    try {
      const companiesRes = await axiosInstance.get(`/companies?limit=10000`);
      const fetchedAllCompanies = companiesRes.data.companies || [];
      setAllCompanies(fetchedAllCompanies);

      const companyNames = fetchedAllCompanies.map((c) => c.name);
      if (companyNames.length === 0) return;

      const ratesRes = await axiosInstance.get(`/rate`);
      const allRates = ratesRes.data || [];
      setRateData(allRates);

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

          const allNosFilled = values.every((entries) =>
            entries.every(
              (e) =>
                e.saudaNo !== null &&
                e.saudaNo !== undefined &&
                String(e.saudaNo).trim() !== ""
            )
          );

          if (hasSauda && allNosFilled) status = "blue";
          else if (hasSauda) status = "yellow";
        }

        saudaStatuses[company] = status;
      });

      setSaudaStatusMap(saudaStatuses);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load sauda data");
    } finally {
      setLoading(false);
    }
  }, [today]);

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

  return {
    companies,
    rateData,
    saudaStatusMap,
    loading,
    hasRate,
    updateCompanyStatus,
    filterType,
    setFilterType,
    refreshSaudaData: fetchAllData,
  };
};

export default useSaudaData;
