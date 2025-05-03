import { useEffect, useState, useMemo } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export default function useCompany() {
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [commodities, setCommodities] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const fetchPaginated = async (url, key) => {
          let allData = [];
          let page = 1;
          let hasMore = true;

          while (hasMore) {
            const res = await axiosInstance.get(`${url}?page=${page}`);
            const data = Array.isArray(res.data)
              ? res.data
              : res.data[key] || [];

            if (data.length > 0) {
              allData = [...allData, ...data];
              page++;
            } else {
              hasMore = false;
            }
          }

          return allData;
        };

        const [companyList, locationList, commodityList] = await Promise.all([
          fetchPaginated("/companies", "companies"),
          fetchPaginated("/location", "locations"),
          fetchPaginated("/commodity", "commodities"),
        ]);

        setCompanies(companyList);
        setLocations(locationList);
        setCommodities(commodityList);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch companies, locations, or commodities");
      }
    };

    fetchAll();
  }, []);

  const companyOptions = useMemo(
    () => companies.map((comp) => ({ label: comp.name, value: comp.name })),
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
