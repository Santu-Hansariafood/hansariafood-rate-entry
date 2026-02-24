"use client";

import { useState, useMemo, Suspense } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import Loading from "../Loading/Loading";
import { motion } from "framer-motion";
import { Calendar, TrendingUp } from "lucide-react";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartDataLabels
);

export default function RateGraph({ rateData, company, location }) {
  const [timeRange, setTimeRange] = useState("weekly");

  const filteredData = useMemo(
    () =>
      rateData.find(
        (item) => item.company === company && item.location === location
      ),
    [rateData, company, location]
  );

  if (!filteredData) return null;

  const processedRates = useMemo(() => {
    const ratesArray = [];

    if (Array.isArray(filteredData.oldRates)) {
      filteredData.oldRates.forEach((rateStr) => {
        const match = rateStr.match(/(.+)\s\((\d{2}\/\d{2}\/\d{4})\)/);
        if (match) {
          const [_, rate, date] = match;
          ratesArray.push({
            date,
            value: parseFloat(rate),
          });
        }
      });
    }

    if (filteredData.newRate && filteredData.lastUpdated) {
      const newDate = new Date(filteredData.lastUpdated).toLocaleDateString(
        "en-GB"
      );
      ratesArray.push({
        date: newDate,
        value: parseFloat(filteredData.newRate),
      });
    }

    return ratesArray.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      const da = new Date(a.date.split("/").reverse().join("-"));
      const db = new Date(b.date.split("/").reverse().join("-"));
      return da - db;
    });
  }, [filteredData]);

  const displayedRates = useMemo(() => {
    const length = timeRange === "weekly" ? 7 : 30;
    const padded = [...processedRates.slice(-length)];
    while (padded.length < length) {
      padded.unshift({ date: "", value: 0 });
    }
    return padded;
  }, [processedRates, timeRange]);

  const dateRangeLabel = useMemo(() => {
    if (displayedRates.length === 0) return "";
    const first = displayedRates[0].date;
    const last = displayedRates[displayedRates.length - 1].date;
    return `${first} → ${last}`;
  }, [displayedRates]);

  const labels = displayedRates.map((r) => r.date);
  const rates = displayedRates.map((r) => r.value);

  const colors = rates.map((rate, i) =>
    i === 0
      ? "rgba(46, 204, 113, 1)"
      : rate >= rates[i - 1]
      ? "rgba(46, 204, 113, 1)"
      : "rgba(241, 196, 15, 1)"
  );

  const shadowColors = rates.map((rate, i) =>
    i === 0
      ? "rgba(39, 174, 96, 0.6)"
      : rate >= rates[i - 1]
      ? "rgba(39, 174, 96, 0.6)"
      : "rgba(243, 156, 18, 0.6)"
  );

  const validRates = rates.filter((r) => r > 0);
  const minRate = validRates.length > 0 ? Math.min(...validRates) : 0;
  const baseY = minRate > 0 ? Math.floor(minRate - 5) : 0;

  const data = {
    labels,
    datasets: [
      {
        label: "Rate",
        data: rates,
        backgroundColor: colors,
        borderColor: shadowColors,
        borderWidth: 2,
        borderRadius: 10,
        borderSkipped: false,
        barThickness: 14,
        hoverBackgroundColor: "rgba(241, 196, 15, 0.8)",
        hoverBorderColor: "#f39c12",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        anchor: "end",
        align: "end",
        color: "#2d3436",
        font: {
          weight: "bold",
          size: 10,
        },
        formatter: (value) => (value > 0 ? `₹${value}` : ""),
      },
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `₹${ctx.raw} on ${ctx.label}`,
        },
        backgroundColor: "#000",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 12,
        borderColor: "#f1c40f",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: baseY > 0 ? baseY : 0,
        title: {
          display: true,
          text: "Rate",
          color: "#2d3436",
          font: { size: 14, weight: "bold" },
        },
        ticks: { font: { size: 12 }, padding: 8 },
        grid: { color: "rgba(0, 0, 0, 0.05)", drawBorder: false },
      },
      x: {
        title: {
          display: true,
          text: "Date",
          color: "#2d3436",
          font: { size: 14, weight: "bold" },
        },
        ticks: { font: { size: 12 }, padding: 8 },
        grid: { display: false },
      },
    },
  };

  return (
    <Suspense fallback={<Loading />}>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 shadow-inner">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Rate Trends</h3>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="weekly">Weekly View</option>
              <option value="monthly">Monthly View</option>
            </select>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-2 text-center">
          Showing data from <strong>{dateRangeLabel}</strong>
        </p>

        <div className="w-full overflow-x-auto bg-white rounded-xl p-4 shadow-[0_20px_30px_rgba(0,128,0,0.15)] min-h-[250px] md:min-h-[300px] lg:min-h-[400px]">
          <Bar data={data} options={options} />
        </div>
      </motion.div>
    </Suspense>
  );
}
