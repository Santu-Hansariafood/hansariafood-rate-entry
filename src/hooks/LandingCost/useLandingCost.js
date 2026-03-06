"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const VALID_COMMODITIES = ["soya", "sbm", "ddgs", "m doc", "mdoc"];

const getFreightCommodityKey = (commodity) => {
  if (!commodity) return "";
  const lower = commodity.toLowerCase();
  if (lower.includes("sbm") || lower.includes("soya")) return "Soya";
  if (lower.includes("ddgs")) return "Maize DDGS";
  if (lower.includes("mdoc") || lower.includes("m doc")) return "M DOC";
  return commodity;
};

export default function useLandingCost() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const [rates, setRates] = useState([]);
  const [ratesLoading, setRatesLoading] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [freightMap, setFreightMap] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get("/categories?limit=1000");
        setCategories(res.data?.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchAllRates = async () => {
      if (!selectedCommodity) {
        setRates([]);
        return;
      }

      try {
        setRatesLoading(true);
        const dateStr = new Date().toISOString().split("T")[0];

        const query = new URLSearchParams({
          commodity: selectedCommodity,
          date: dateStr,
        });
        if (selectedLocation) {
          query.set("destination", selectedLocation);
        }

        const res = await axiosInstance.get(
          `/ratehistory/by-commodity?${query.toString()}`
        );

        const allItems = Array.isArray(res.data) ? res.data : [];

        const seen = new Set();
        const items = allItems.filter((r) => {
          const key = `${String(r.companyId || "")}|${r.location}|${
            r.commodity
          }|${r.date}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        const filteredSorted = items
          .filter((r) => {
            const base = Number(r.newRate) || Number(r.oldRate) || 0;
            const hasTemp =
              Array.isArray(r.tempRates) &&
              r.tempRates.some((t) => Number(t.rate) > 0);
            return base > 0 || hasTemp;
          })
          .sort((a, b) => {
            const rateA =
              Number(a.landedRate) ||
              Number(a.newRate) ||
              Number(a.oldRate) ||
              0;
            const rateB =
              Number(b.landedRate) ||
              Number(b.newRate) ||
              Number(b.oldRate) ||
              0;
            return rateA - rateB;
          });

        setRates(filteredSorted);
      } catch (error) {
        console.error("Error fetching all rates:", error);
        setRates([]);
      } finally {
        setRatesLoading(false);
      }
    };

    fetchAllRates();
  }, [selectedCommodity, selectedLocation]);

  useEffect(() => {
    const fetchFreightRates = async () => {
      if (!selectedCommodity || !selectedLocation) {
        setFreightMap({});
        return;
      }

      try {
        const freightCommodity = getFreightCommodityKey(selectedCommodity);
        const query = new URLSearchParams({
          commodity: freightCommodity,
          search: selectedLocation,
          limit: "1000",
        });

        const res = await axiosInstance.get(`/freight?${query.toString()}`);
        const freights = res.data?.freights || [];

        const nextMap = {};
        const destKey = selectedLocation.toLowerCase().trim();

        freights.forEach((f) => {
          const loc = String(f.location || "").toLowerCase().trim();
          const delivery = String(f.deliveryLocation || "")
            .toLowerCase()
            .trim();
          if (!loc || delivery !== destKey) return;

          const key = `${loc}|${destKey}`;
          const existing = nextMap[key];
          if (
            !existing ||
            new Date(f.createdAt) > new Date(existing.createdAt)
          ) {
            nextMap[key] = f;
          }
        });

        setFreightMap(nextMap);
      } catch (error) {
        console.error("Error fetching freight rates:", error);
        setFreightMap({});
      }
    };

    fetchFreightRates();
  }, [selectedCommodity, selectedLocation]);

  useEffect(() => {
    const fetchSpecificHistory = async () => {
      if (!selectedCompany || !selectedCommodity || !selectedLocation) {
        setHistory([]);
        return;
      }

      try {
        setHistoryLoading(true);
        const company = companies.find((c) => c.name === selectedCompany);
        if (!company) return;

        const res = await axiosInstance.get(
          `/ratehistory/${company._id}?fullHistory=true`
        );
        const allData = res.data || [];

        const match = allData.find(
          (d) =>
            d.location === selectedLocation &&
            d.commodity
              .toLowerCase()
              .includes(selectedCommodity.toLowerCase())
        );

        if (match && match.history) {
          const sortedHistory = [...match.history].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );
          setHistory(sortedHistory);
        } else {
          setHistory([]);
        }
      } catch (error) {
        console.error("Error fetching specific history:", error);
        setHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchSpecificHistory();
  }, [selectedCompany, selectedCommodity, selectedLocation, companies]);

  useEffect(() => {
    setSelectedCompany("");
    setSelectedCommodity("");
    setSelectedLocation("");

    if (!selectedCategory) {
      setCompanies([]);
      return;
    }

    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosInstance.get(
          `/managecompany?category=${encodeURIComponent(
            selectedCategory
          )}&limit=100`
        );
        setCompanies(res.data?.companies || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
        setError("Failed to fetch companies. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [selectedCategory]);

  useEffect(() => {
    setSelectedCommodity("");
    setSelectedLocation("");
  }, [selectedCompany]);

  useEffect(() => {
    setSelectedLocation("");
  }, [selectedCommodity]);

  const categoryOptions = useMemo(() => {
    return categories.map((cat) => ({ label: cat.name, value: cat.name }));
  }, [categories]);

  const companyOptions = useMemo(() => {
    return companies
      .filter((company) => {
        if (!company.commodities || !Array.isArray(company.commodities))
          return false;
        return company.commodities.some((comm) =>
          VALID_COMMODITIES.some((v) =>
            comm.toLowerCase().includes(v)
          )
        );
      })
      .map((c) => ({ label: c.name, value: c.name }));
  }, [companies]);

  const commodityOptions = useMemo(() => {
    if (!selectedCompany) return [];
    const company = companies.find((c) => c.name === selectedCompany);
    if (!company || !Array.isArray(company.commodities)) return [];

    return company.commodities
      .filter((comm) => {
        const c = comm.toLowerCase();
        if (c.includes("sbm")) return true;
        return VALID_COMMODITIES.some((v) => c.includes(v));
      })
      .map((name) => ({ label: name, value: name }));
  }, [selectedCompany, companies]);

  const locationOptions = useMemo(() => {
    if (!selectedCompany) return [];
    const company = companies.find((c) => c.name === selectedCompany);
    if (!company || !company.location) return [];

    return company.location.map((loc) => ({ label: loc, value: loc }));
  }, [selectedCompany, companies]);

  const isSelectionComplete =
    selectedCompany && selectedCommodity && selectedLocation;

  const tableRows = useMemo(
    () =>
      rates.map((r, index) => {
        const baseRate = Number(r.newRate) || Number(r.oldRate) || 0;

        const destKey = (selectedLocation || r.destinationLocation || "")
          .toLowerCase()
          .trim();

        let freight = 0;
        if (destKey && r.location) {
          const key = `${String(r.location).toLowerCase().trim()}|${destKey}`;
          const freightDoc = freightMap[key];
          if (freightDoc) {
            freight = Number(freightDoc.freightRate) || 0;
          }
        }

        const landed = baseRate + freight;
        const destination = selectedLocation || r.destinationLocation || "";

        return {
          slno: index + 1,
          companyName: r.companyName,
          location: r.location,
          commodity: r.commodity,
          destination,
          baseRate,
          freight,
          landed,
          date: r.date,
        };
      }),
    [rates, selectedLocation, freightMap]
  );

  return {
    companies,
    loading,
    error,
    selectedCategory,
    setSelectedCategory,
    selectedCompany,
    setSelectedCompany,
    selectedCommodity,
    setSelectedCommodity,
    selectedLocation,
    setSelectedLocation,
    rates,
    ratesLoading,
    history,
    historyLoading,
    categoryOptions,
    companyOptions,
    commodityOptions,
    locationOptions,
    isSelectionComplete,
    tableRows,
  };
}

