import { useEffect, useState, useMemo } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const PAGE_SIZE = 100;
const CACHE_DURATION = 60 * 1000;

let referenceDataCache = null;
let referenceDataCacheExpiresAt = 0;
let referenceDataPromise = null;

const fetchPaginated = async (url, key) => {
  const firstResponse = await axiosInstance.get(url, {
    params: { page: 1, limit: PAGE_SIZE },
  });
  const firstPage = Array.isArray(firstResponse.data)
    ? firstResponse.data
    : firstResponse.data[key] || [];
  const totalPages = Math.max(
    1,
    Number(firstResponse.data?.totalPages) || 1
  );

  if (totalPages === 1) return firstPage;

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      axiosInstance.get(url, {
        params: { page: index + 2, limit: PAGE_SIZE },
      })
    )
  );

  return [
    ...firstPage,
    ...remainingPages.flatMap((response) =>
      Array.isArray(response.data) ? response.data : response.data[key] || []
    ),
  ];
};

const getReferenceData = () => {
  if (referenceDataCache && Date.now() < referenceDataCacheExpiresAt) {
    return Promise.resolve(referenceDataCache);
  }

  if (!referenceDataPromise) {
    referenceDataPromise = Promise.all([
      fetchPaginated("/companies", "companies"),
      fetchPaginated("/location", "locations"),
      fetchPaginated("/commodity", "commodities"),
    ])
      .then(([companies, locations, commodities]) => {
        referenceDataCache = { companies, locations, commodities };
        referenceDataCacheExpiresAt = Date.now() + CACHE_DURATION;
        referenceDataPromise = null;
        return referenceDataCache;
      })
      .catch((error) => {
        referenceDataPromise = null;
        throw error;
      });
  }

  return referenceDataPromise;
};

export default function useCompany() {
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [commodities, setCommodities] = useState([]);

  useEffect(() => {
    let active = true;

    getReferenceData()
      .then(({ companies, locations, commodities }) => {
        if (!active) return;
        setCompanies(companies);
        setLocations(locations);
        setCommodities(commodities);
      })
      .catch((error) => {
        console.error("Failed to fetch company form options:", error);
        if (active) {
          toast.error("Failed to fetch companies, locations, or commodities");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const companyOptions = useMemo(
    () =>
      companies.map((comp) => ({
        label: comp.name,
        value: comp.name,
        type: comp.type,
      })),
    [companies]
  );

  const locationOptions = useMemo(
    () => locations.map((loc) => ({ label: loc.name, value: loc.name })),
    [locations]
  );

  const commodityOptions = useMemo(
    () => commodities.map((cmd) => ({ label: cmd.name, value: cmd.name })),
    [commodities]
  );

  return {
    companies,
    locations,
    commodities,
    companyOptions,
    locationOptions,
    commodityOptions,
  };
}
