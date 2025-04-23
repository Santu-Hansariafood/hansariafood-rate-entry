"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import { toast } from "react-toastify";

const ITEMS_PER_PAGE = 10;

export const useCompaniesData = (currentPage) => {
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  const fetchAllData = async () => {
    try {
      const [companyRes, locationRes, categoryRes] = await Promise.all([
        axiosInstance.get(
          `/managecompany?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
        ),
        axiosInstance.get("/location"),
        axiosInstance.get("/categories"),
      ]);

      const formattedCompanies = (companyRes.data.companies || []).map((c) => ({
        ...c,
        location: Array.isArray(c.location)
          ? c.location.map((loc) => {
              const locationName = typeof loc === "string" ? loc : loc.name;
              const matchingMobile = c.mobileNumbers?.find(
                (mob) => mob.location === locationName
              );

              return {
                name: locationName,
                state: typeof loc === "string" ? "" : loc.state,
                mobileNumbers: matchingMobile
                  ? [
                      {
                        primary: matchingMobile.primaryMobile || "",
                        secondary: matchingMobile.secondaryMobile || "",
                      },
                    ]
                  : [{ primary: "", secondary: "" }],
              };
            })
          : [],
      }));

      setCompanies(formattedCompanies);
      setTotalItems(companyRes.data.total || 0);
      setLocations(locationRes.data.locations || []);
      setCategories(categoryRes.data.categories || []);
    } catch (err) {
      toast.error("Failed to fetch initial data");
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [currentPage]);

  return {
    companies,
    setCompanies,
    locations,
    categories,
    totalItems,
    fetchAllData,
  };
};
