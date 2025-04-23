"use client";

import { useEffect, useState, useMemo } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

export default function useCompany() {
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);

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

        const [companyList, locationList] = await Promise.all([
          fetchPaginated("/companies", "companies"),
          fetchPaginated("/location", "locations"),
        ]);

        setCompanies(companyList);
        setLocations(locationList);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch companies or locations");
      }
    };

    fetchAll();
  }, []);

  const companyOptions = useMemo(
    () =>
      companies.map((comp) => ({
        label: comp.name,
        value: comp.name,
      })),
    [companies]
  );

  const locationOptions = useMemo(
    () =>
      locations.map((loc) => ({
        label: loc.name,
        value: loc.name,
      })),
    [locations]
  );

  return {
    companies,
    locations,
    companyOptions,
    locationOptions,
  };
}
