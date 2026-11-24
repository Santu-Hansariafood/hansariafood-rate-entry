"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, RefreshCw, RotateCcw } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";

const PAGE_SIZE = 100;

const getDateKey = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

export default function RateTakenSection() {
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

      setCompanies(allCompanies.filter((company) => company?._id && company.name));
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
          (category) => category?._id && category.name
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

  const toggleTaken = async (companyId) => {
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
  };

  const takenIds = new Set(tracker.takenIds);
  const filteredCompanies = selectedCategory
    ? companies.filter(
        (company) =>
          company.category?.trim().toLowerCase() ===
          selectedCategory.trim().toLowerCase()
      )
    : companies;
  const takenCompanies = filteredCompanies.filter((company) =>
    takenIds.has(company._id)
  );
  const pendingCompanies = filteredCompanies.filter(
    (company) => !takenIds.has(company._id)
  );

  return (
    <section className="rounded-2xl border border-white/20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Rate Taken
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {tracker.date
              ? new Date(`${tracker.date}T00:00:00.000Z`).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    timeZone: "UTC",
                  }
                )
              : ""}
          </span>
          <button
            type="button"
            onClick={fetchCompanies}
            disabled={loadingCompanies}
            aria-label="Refresh companies"
            className="rounded-lg border border-gray-300 dark:border-gray-700 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loadingCompanies ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      {companiesError ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-red-600 dark:text-red-400">
          <p>{companiesError}</p>
          <button
            type="button"
            onClick={fetchCompanies}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      ) : loadingCompanies || loadingTaken ? (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Loading rate-taken data...
        </p>
      ) : (
        <>
          {statusError && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-red-600 dark:text-red-400">
              <p>{statusError}</p>
              <button
                type="button"
                onClick={() => setStatusReload((value) => value + 1)}
                className="font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full sm:max-w-xs">
              <label
                htmlFor="rate-taken-category"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Category
              </label>
              <select
                id="rate-taken-category"
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                disabled={loadingCategories}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-wait disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">
                  {loadingCategories ? "Loading categories..." : "All categories"}
                </option>
                {categories.map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            {categoriesError && (
              <div className="flex items-center gap-3 text-sm text-red-600 dark:text-red-400">
                <p>{categoriesError}</p>
                <button
                  type="button"
                  onClick={fetchCategories}
                  className="font-semibold underline"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                Rates to Take ({pendingCompanies.length})
              </h3>
              {pendingCompanies.length ? (
                <div className="flex flex-wrap gap-2">
                  {pendingCompanies.map((company) => (
                    <button
                      key={company._id}
                      type="button"
                      onClick={() => toggleTaken(company._id)}
                      disabled={
                        savingIds.length > 0 ||
                        savingIds.includes(company._id) ||
                        !!statusError
                      }
                      className="rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800 transition hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200 dark:hover:bg-blue-900/60 disabled:opacity-50"
                    >
                      {company.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  All companies are marked as taken.
                </p>
              )}
            </div>

            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                <CheckCircle2 size={17} className="text-green-600" />
                Rate Taken ({takenCompanies.length})
              </h3>
              {takenCompanies.length ? (
                <div className="flex flex-wrap gap-2">
                  {takenCompanies.map((company) => (
                    <button
                      key={company._id}
                      type="button"
                      onClick={() => toggleTaken(company._id)}
                      disabled={
                        savingIds.length > 0 ||
                        savingIds.includes(company._id) ||
                        !!statusError
                      }
                      title="Click to move this company back to Rates to Take"
                      className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-800 transition hover:bg-green-100 dark:border-green-900 dark:bg-green-950/50 dark:text-green-200 dark:hover:bg-green-900/60 disabled:opacity-50"
                    >
                      {company.name}
                      <RotateCcw size={14} />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No companies marked yet.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
