"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { motion } from "framer-motion";
import { CalendarDays, TrendingUp } from "lucide-react";
import { toast } from "@/utils/toast/toast";
import Loading from "@/components/common/Loading/Loading";
import useRateGroups from "@/hooks/Rate/useRateGroups";
import useRateAnalysisData from "@/hooks/RateCalendar/useRateAnalysisData";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
);

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
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [chartType, setChartType] = useState("bar");
  const chartRef = useRef(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    const canvas = chartRef.current?.querySelector("canvas");
    if (!canvas) {
      toast.error("The rate graph is not ready to export");
      return;
    }

    setIsExportingPdf(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF("landscape", "mm", "a4");
      const margin = 10;
      const chartTop = 26;
      const imageData = canvas.toDataURL("image/png");
      const image = pdf.getImageProperties(imageData);
      const maxWidth = pdf.internal.pageSize.getWidth() - margin * 2;
      const maxHeight =
        pdf.internal.pageSize.getHeight() - chartTop - margin;
      const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
      const imageWidth = image.width * scale;
      const imageHeight = image.height * scale;
      const imageX = (pdf.internal.pageSize.getWidth() - imageWidth) / 2;

      pdf.setFontSize(16);
      pdf.text("Monthly Rate Analysis by Location", margin, 11);
      pdf.setFontSize(10);
      pdf.text(
        `${selectedGroup?.name || ""} | ${selectedCompany} | ${selectedCommodity} | ${currentLocation === "all" ? "All locations" : currentLocation} | ${monthNames[selectedMonth]} ${selectedYear}`,
        margin,
        18,
      );
      pdf.addImage(
        imageData,
        "PNG",
        imageX,
        chartTop,
        imageWidth,
        imageHeight,
      );
      pdf.save(
        `Rate_Analysis_${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}.pdf`,
      );
      toast.success("Rate graph downloaded as PDF");
    } catch (exportError) {
      console.error("Failed to export rate analysis graph:", exportError);
      toast.error("Failed to download the rate graph PDF");
    } finally {
      setIsExportingPdf(false);
    }
  };

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
          dailyRates: row.rates,
        };
      })
      .sort((a, b) => {
        const companySort = a.company.localeCompare(b.company);
        if (companySort) return companySort;
        const commoditySort = a.commodity.localeCompare(b.commodity);
        return commoditySort || a.location.localeCompare(b.location);
      });
  }, [allRates, selectedGroup, selectedMonth, selectedYear]);

  const companyOptions = useMemo(
    () => [...new Set(monthlyRows.map((row) => row.company))].sort(),
    [monthlyRows],
  );
  const currentCompany = companyOptions.includes(selectedCompany)
    ? selectedCompany
    : companyOptions[0] || "";
  const commodityOptions = useMemo(
    () =>
      [
        ...new Set(
          monthlyRows
            .filter((row) => row.company === currentCompany)
            .map((row) => row.commodity),
        ),
      ].sort(),
    [currentCompany, monthlyRows],
  );
  const currentCommodity = commodityOptions.includes(selectedCommodity)
    ? selectedCommodity
    : commodityOptions[0] || "";
  const locationRows = useMemo(
    () =>
      monthlyRows.filter(
        (row) =>
          row.company === currentCompany && row.commodity === currentCommodity,
      ),
    [currentCompany, currentCommodity, monthlyRows],
  );
  const locationOptions = useMemo(
    () => [...new Set(locationRows.map((row) => row.location))].sort(),
    [locationRows],
  );
  const currentLocation = locationOptions.includes(selectedLocation)
    ? selectedLocation
    : "all";
  const chartRows =
    currentLocation === "all"
      ? locationRows
      : locationRows.filter((row) => row.location === currentLocation);
  const chartLabels = useMemo(() => {
    const days = new Set(
      chartRows.flatMap((row) =>
        row.dailyRates.map((point) => point.date.getDate()),
      ),
    );
    return [...days]
      .sort((a, b) => a - b)
      .map((day) =>
        new Date(selectedYear, selectedMonth, day).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        }),
      );
  }, [chartRows, selectedMonth, selectedYear]);
  const chartData = useMemo(() => {
    const colors = [
      "#2563eb",
      "#059669",
      "#d97706",
      "#7c3aed",
      "#db2777",
      "#0891b2",
      "#65a30d",
      "#dc2626",
    ];
    const dayNumbers = chartLabels.map((label) => Number.parseInt(label, 10));

    return {
      labels: chartLabels,
      datasets: chartRows.map((row, index) => {
        const totalsByDay = new Map();
        row.dailyRates.forEach((point) => {
          const day = point.date.getDate();
          const current = totalsByDay.get(day) || { total: 0, count: 0 };
          current.total += point.rate;
          current.count += 1;
          totalsByDay.set(day, current);
        });
        const color = colors[index % colors.length];

        const dataset = {
          label: row.location,
          data: dayNumbers.map((day) => {
            const values = totalsByDay.get(day);
            return values ? values.total / values.count : null;
          }),
        };

        if (chartType === "line") {
          return {
            ...dataset,
            borderColor: color,
            backgroundColor: color,
            pointBackgroundColor: color,
            pointBorderColor: color,
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 6,
            tension: 0.3,
            spanGaps: false,
          };
        }

        return {
          ...dataset,
          backgroundColor: color,
          borderRadius: 4,
          maxBarThickness: 24,
        };
      }),
    };
  }, [chartLabels, chartRows, chartType]);
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 750, easing: "easeOutQuart" },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        labels: { usePointStyle: chartType === "line" },
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ₹${Number(context.parsed.y).toLocaleString(
              undefined,
              { maximumFractionDigits: 2 },
            )}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: chartType === "bar",
        title: { display: true, text: "Rate (₹)" },
        ticks: {
          callback: (value) =>
            `₹${Number(value).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}`,
        },
      },
      x: { title: { display: true, text: "Date" } },
    },
  };

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
          <>
            <div className="mb-6 rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 md:p-6">
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Monthly Rate by Location
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Daily rates by location for {monthNames[selectedMonth]}{" "}
                    {selectedYear}.
                  </p>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Company
                    <select
                      value={currentCompany}
                      onChange={(event) => {
                        setSelectedCompany(event.target.value);
                        setSelectedCommodity("");
                        setSelectedLocation("all");
                      }}
                      className="mt-1 block min-w-48 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
                    >
                      {companyOptions.map((company) => (
                        <option key={company} value={company}>
                          {company}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Commodity
                    <select
                      value={currentCommodity}
                      onChange={(event) => {
                        setSelectedCommodity(event.target.value);
                        setSelectedLocation("all");
                      }}
                      className="mt-1 block min-w-40 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
                    >
                      {commodityOptions.map((commodity) => (
                        <option key={commodity} value={commodity}>
                          {commodity}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Location
                    <select
                      value={currentLocation}
                      onChange={(event) =>
                        setSelectedLocation(event.target.value)
                      }
                      className="mt-1 block min-w-40 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800"
                    >
                      <option value="all">All locations</option>
                      {locationOptions.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div
                    className="flex rounded-lg border border-slate-200 bg-slate-100 p-1 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                    role="group"
                    aria-label="Chart type"
                  >
                    {[
                      ["bar", "Bars"],
                      ["line", "Line"],
                    ].map(([type, label]) => (
                      <button
                        key={type}
                        type="button"
                        aria-pressed={chartType === type}
                        onClick={() => setChartType(type)}
                        className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                          chartType === type
                            ? "bg-white text-blue-700 shadow dark:bg-slate-700 dark:text-blue-300"
                            : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {chartLabels.length > 0 && chartRows.length > 0 && (
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      disabled={isExportingPdf}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
                    >
                      {isExportingPdf ? "Preparing PDF..." : "Download PDF"}
                    </button>
                  )}
                </div>
              </div>
              {chartRows.length ? (
                <div className="overflow-x-auto rounded-xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-3 shadow-inner dark:border-slate-800 dark:from-slate-950/30 dark:to-slate-900/60 md:p-5">
                  <div
                    ref={chartRef}
                    className="h-[380px] md:h-[460px]"
                    style={{
                      minWidth: `${Math.max(720, chartLabels.length * 38)}px`,
                    }}
                  >
                    {chartType === "line" ? (
                      <Line data={chartData} options={chartOptions} />
                    ) : (
                      <Bar data={chartData} options={chartOptions} />
                    )}
                  </div>
                </div>
              ) : (
                <p className="py-10 text-center text-slate-500 dark:text-slate-400">
                  No location rates for this company and commodity in the
                  selected month.
                </p>
              )}
            </div>

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
          </>
        )}
      </motion.div>
    </section>
  );
}
