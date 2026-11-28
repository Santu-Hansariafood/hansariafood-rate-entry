"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, TrendingUp } from "lucide-react";
import Loading from "@/components/common/Loading/Loading";
import useRateGroups from "@/hooks/Rate/useRateGroups";
import useRateAnalysisData from "@/hooks/RateCalendar/useRateAnalysisData";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const normalize = (value) => String(value ?? "").trim().toLocaleLowerCase();

const parseOldRate = (value) => {
  const match = String(value ?? "").match(
    /^([^(]+?)\s*\((\d{1,2})\/(\d{1,2})\/(\d{4})\)$/,
  );
  if (!match) return null;

  const rate = Number(match[1].replace(/,/g, "").trim());
  const day = Number(match[2]);
  const month = Number(match[3]);
  const year = Number(match[4]);
  const date = new Date(year, month - 1, day);
  if (
    !Number.isFinite(rate) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return { rate, date };
};

const getRatePoints = (rate) => {
  const points = (rate.oldRates || [])
    .map(parseOldRate)
    .filter(Boolean);

  const currentRate = Number(rate.newRate);
  if (rate.hasNewRateToday && rate.newRate !== "" && Number.isFinite(currentRate)) {
    const date = rate.lastUpdated ? new Date(rate.lastUpdated) : new Date();
    if (!Number.isNaN(date.getTime())) points.push({ rate: currentRate, date });
  }

  return points;
};

export default function RateCalendar() {
  const {
    groups,
    loading: groupsLoading,
    loaded: groupsLoaded,
    error: groupsError,
  } = useRateGroups();
  const {
    allRates,
    loading: ratesLoading,
    error: ratesError,
  } = useRateAnalysisData();
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!selectedGroupId && groups.length) {
      setSelectedGroupId(groups[0]._id);
    }
  }, [groups, selectedGroupId]);

  const years = useMemo(() => {
    const availableYears = new Set([new Date().getFullYear()]);
    (Array.isArray(allRates) ? allRates : []).forEach((rate) => {
      (rate.oldRates || []).forEach((oldRate) => {
        const point = parseOldRate(oldRate);
        if (point) availableYears.add(point.date.getFullYear());
      });
      if (rate.lastUpdated) {
        const date = new Date(rate.lastUpdated);
        if (!Number.isNaN(date.getTime())) {
          availableYears.add(date.getFullYear());
        }
      }
    });
    return [...availableYears].sort((a, b) => b - a);
  }, [allRates]);

  const selectedGroup = groups.find((group) => group._id === selectedGroupId);
  const monthlyRows = useMemo(() => {
    if (!selectedGroup) return [];

    const companyNames = new Set(
      (selectedGroup.companies || [])
        .map((company) => normalize(company?.name || company))
        .filter(Boolean),
    );
    const rowsByRate = new Map();

    (Array.isArray(allRates) ? allRates : [])
      .filter((rate) => companyNames.has(normalize(rate.company)))
      .forEach((rate) => {
        const rowKey = [
          rate.company,
          rate.commodity,
          rate.location,
        ].map(normalize).join("|||");
        const points = getRatePoints(rate).filter(
          ({ date }) =>
            date.getFullYear() === selectedYear &&
            date.getMonth() === selectedMonth,
        );
        if (!points.length) return;

        const row = rowsByRate.get(rowKey) || {
          company: rate.company,
          commodity: rate.commodity,
          location: rate.location,
          rates: [],
        };
        row.rates.push(...points);
        rowsByRate.set(rowKey, row);
      });

    return [...rowsByRate.values()]
      .map((row) => {
        const values = row.rates.map((point) => point.rate);
        const latest = row.rates.reduce((current, point) =>
          point.date > current.date ? point : current,
        );
        return {
          company: row.company,
          commodity: row.commodity,
          location: row.location,
          averageRate:
            values.reduce((total, value) => total + value, 0) / values.length,
          minRate: Math.min(...values),
          maxRate: Math.max(...values),
          latestRate: latest.rate,
          updates: values.length,
        };
      })
      .sort((a, b) => {
        const companySort = a.company.localeCompare(b.company);
        if (companySort) return companySort;
        const commoditySort = a.commodity.localeCompare(b.commodity);
        return commoditySort || a.location.localeCompare(b.location);
      });
  }, [allRates, selectedGroup, selectedMonth, selectedYear]);

  const isLoading = groupsLoading || ratesLoading || !groupsLoaded;
  const error = groupsError || ratesError;

  return (
    <section className="min-h-[60vh] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-7xl rounded-2xl border border-white/30 bg-white/80 p-5 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70 md:p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-blue-600 p-3 text-white">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Rate Analysis
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Monthly rates by company, commodity, and location.
            </p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Group
            <select
              value={selectedGroupId}
              onChange={(event) => setSelectedGroupId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              disabled={groupsLoading}
            >
              <option value="">Select group</option>
              {groups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Month
            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(Number(event.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            >
              {monthNames.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Year
            <span className="relative mt-1 block">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedYear}
                onChange={(event) => setSelectedYear(Number(event.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </span>
          </label>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loading />
          </div>
        ) : error ? (
          <p
            role="alert"
            className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
          >
            Failed to load rate analysis: {error}
          </p>
        ) : !selectedGroup ? (
          <p className="py-12 text-center text-slate-500 dark:text-slate-400">
            No groups available.
          </p>
        ) : monthlyRows.length === 0 ? (
          <p className="py-12 text-center text-slate-500 dark:text-slate-400">
            No rate updates for {monthNames[selectedMonth]} {selectedYear} in{" "}
            {selectedGroup.name}.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/70">
                <tr>
                  {[
                    "Company",
                    "Commodity",
                    "Location",
                    "Average Rate",
                    "Latest Rate",
                    "Lowest",
                    "Highest",
                    "Updates",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {monthlyRows.map((row) => (
                  <tr
                    key={`${row.company}-${row.commodity}-${row.location}`}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {row.company}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300">
                      {row.commodity}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300">
                      {row.location}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300">
                      ₹{row.averageRate.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-400">
                      ₹{row.latestRate}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300">
                      ₹{row.minRate}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300">
                      ₹{row.maxRate}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {row.updates}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </section>
  );
}
