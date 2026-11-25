"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const PAGE_SIZE = 100;

// Categories hidden from the Rate Taken filter and company list
const EXCLUDED_CATEGORIES = ["financer", "traders"];

const getDateKey = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

export default function useRateTaken() {
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [tracker, setTracker] = useState({ date: "", takenIds: [] });
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingTaken, setLoadingTaken] = useState(false);
  const [savingIds, setSavingIds] = useState([]);
  const [companiesError, setCompaniesError] = useState("");
  const [categoriesError, setCategoriesError] = useState("");
  const [statusError, setStatusError] = useState("");
  const [statusReload, setStatusReload] = useState(0);
  const lastTodayRef = useRef("");

  const fetchCompanies = useCallback(async () => {
    setLoadingCompanies(true);
    setCompaniesError("");

    try {
      const allCompanies = [];
      let page = 1;
      let total = 0;

      do {
        const { data } = await axiosInstance.get("/managecompany", {
          params: { type: "buyer", page, limit: PAGE_SIZE },
        });
        const pageCompanies = Array.isArray(data?.companies)
          ? data.companies
          : [];

        if (pageCompanies.length === 0) break;
        allCompanies.push(...pageCompanies);
        total = Number(data?.total) || 0;
        page += 1;
      } while (allCompanies.length < total);

      setCompanies(
        allCompanies.filter((company) => company?._id && company.name)
      );
    } catch (fetchError) {
      console.error("Failed to fetch companies for rate tracking:", fetchError);
      setCompaniesError("Could not load companies. Please try again.");
    } finally {
      setLoadingCompanies(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoadingCategories(true);
    setCategoriesError("");

    try {
      const { data } = await axiosInstance.get("/categories", {
        params: { limit: 1000 },
      });
      setCategories(
        (Array.isArray(data?.categories) ? data.categories : []).filter(
          (category) =>
            category?._id &&
            category.name &&
            !EXCLUDED_CATEGORIES.includes(category.name.trim().toLowerCase())
        )
      );
    } catch (fetchError) {
      console.error("Failed to fetch categories for rate tracking:", fetchError);
      setCategoriesError("Could not load categories. Please try again.");
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    const today = getDateKey();
    lastTodayRef.current = today;
    setTracker({ date: today, takenIds: [] });
    fetchCompanies();
    fetchCategories();
  }, [fetchCategories, fetchCompanies]);

  useEffect(() => {
    if (!tracker.date) return undefined;

    let active = true;
    const fetchTakenCompanies = async () => {
      setLoadingTaken(true);
      setStatusError("");

      try {
        const { data } = await axiosInstance.get("/rate-taken", {
          params: { date: tracker.date },
        });
        if (active && data?.date === tracker.date) {
          setTracker((current) =>
            current.date === tracker.date
              ? { ...current, takenIds: data.companyIds || [] }
              : current
          );
        }
      } catch (fetchError) {
        console.error("Failed to fetch rate-taken status:", fetchError);
        if (active) {
          setStatusError("Could not load the taken list. Please retry.");
        }
      } finally {
        if (active) setLoadingTaken(false);
      }
    };

    fetchTakenCompanies();
    return () => {
      active = false;
    };
  }, [tracker.date, statusReload]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const today = getDateKey();
      if (today !== lastTodayRef.current) {
        lastTodayRef.current = today;
        setLoadingTaken(true);
        setTracker({ date: today, takenIds: [] });
      }
    }, 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const toggleTaken = useCallback(
    async (companyId) => {
      if (
        !tracker.date ||
        loadingTaken ||
        savingIds.length > 0 ||
        statusError
      ) {
        return;
      }

      const taken = !tracker.takenIds.includes(companyId);
      const date = tracker.date;
      setSavingIds((current) => [...current, companyId]);
      setStatusError("");

      try {
        const { data } = await axiosInstance.post("/rate-taken", {
          date,
          companyId,
          taken,
        });
        setTracker((current) =>
          current.date === date
            ? { ...current, takenIds: data.companyIds || [] }
            : current
        );
      } catch (saveError) {
        console.error("Failed to update rate-taken status:", saveError);
        setStatusError("Could not save this change. Please try again.");
      } finally {
        setSavingIds((current) => current.filter((id) => id !== companyId));
      }
    },
    [tracker, loadingTaken, savingIds, statusError]
  );

  const reloadStatus = useCallback(() => {
    setStatusReload((value) => value + 1);
  }, []);

  const takenIds = useMemo(() => new Set(tracker.takenIds), [tracker.takenIds]);

  const visibleCompanies = useMemo(
    () =>
      companies.filter(
        (company) =>
          !EXCLUDED_CATEGORIES.includes(company.category?.trim().toLowerCase())
      ),
    [companies]
  );

  const filteredCompanies = useMemo(
    () =>
      selectedCategory
        ? visibleCompanies.filter(
            (company) =>
              company.category?.trim().toLowerCase() ===
              selectedCategory.trim().toLowerCase()
          )
        : visibleCompanies,
    [visibleCompanies, selectedCategory]
  );

  const takenCompanies = useMemo(
    () => filteredCompanies.filter((company) => takenIds.has(company._id)),
    [filteredCompanies, takenIds]
  );

  const pendingCompanies = useMemo(
    () => filteredCompanies.filter((company) => !takenIds.has(company._id)),
    [filteredCompanies, takenIds]
  );

  const totalCompanies = filteredCompanies.length;
  const takenCount = takenCompanies.length;
  const pendingCount = pendingCompanies.length;
  const progress = totalCompanies
    ? Math.round((takenCount / totalCompanies) * 100)
    : 0;
  const isBusy = savingIds.length > 0;
  const actionsDisabled = isBusy || Boolean(statusError);

  return {
    companies,
    visibleCompanies,
    categories,
    selectedCategory,
    setSelectedCategory,
    tracker,
    takenIds,
    takenCompanies,
    pendingCompanies,
    totalCompanies,
    takenCount,
    pendingCount,
    progress,
    loadingCompanies,
    loadingCategories,
    loadingTaken,
    savingIds,
    companiesError,
    categoriesError,
    statusError,
    isBusy,
    actionsDisabled,
    fetchCompanies,
    fetchCategories,
    reloadStatus,
    toggleTaken,
  };
}
