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
import Loading from "../Loading/Loading";
import { motion } from "framer-motion";
import { Calendar, TrendingUp } from "lucide-react";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

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

  const oldRatesFiltered = useMemo(() => {
    let oldRates = filteredData.oldRates;
    return timeRange === "weekly"
      ? oldRates.slice(-7)
      : oldRates.filter((_, index) => index % 4 === 0);
  }, [filteredData, timeRange]);

  const { labels, rates, colors } = useMemo(() => {
    const labels = oldRatesFiltered.map((rate) =>
      rate.split(" ")[1].replace(/[()]/g, "")
    );
    if (filteredData.newRate)
      labels.push(filteredData.newRate.split(" ")[1].replace(/[()]/g, ""));

    const rates = [
      ...oldRatesFiltered.map((rate) => parseInt(rate.split(" ")[0], 10)),
      filteredData.newRate
        ? parseInt(filteredData.newRate.split(" ")[0], 10)
        : null,
    ].filter(Boolean);

    const colors = rates.map((rate, index) =>
      index === 0
        ? "rgba(54, 162, 235, 0.9)"
        : rate >= rates[index - 1]
        ? "rgba(46, 204, 113, 0.9)"
        : "rgba(231, 76, 60, 0.9)"
    );

    return { labels, rates, colors };
  }, [oldRatesFiltered, filteredData]);

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Rates",
          data: rates,
          backgroundColor: colors,
          borderColor: "rgba(0, 0, 0, 0.1)",
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: colors.map((color) =>
            color.replace("0.9", "1")
          ),
          hoverBorderWidth: 3,
        },
      ],
    }),
    [labels, rates, colors]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#fff",
          bodyColor: "#fff",
          borderWidth: 1,
          borderColor: "#fff",
          padding: 12,
          titleFont: {
            size: 14,
            weight: "bold",
          },
          bodyFont: {
            size: 13,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
          suggestedMin: Math.max(0, Math.min(...rates) * 0.8),
          suggestedMax: Math.max(...rates) * 1.2,
          title: {
            display: true,
            text: "Rate",
            color: "#333",
            font: { size: 14, weight: "bold" },
            padding: { top: 10, bottom: 10 },
          },
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
            drawBorder: false,
          },
          ticks: {
            font: { size: 12 },
            padding: 8,
          },
        },
        x: {
          title: {
            display: true,
            text: "Date",
            color: "#333",
            font: { size: 14, weight: "bold" },
            padding: { top: 10, bottom: 10 },
          },
          grid: { display: false },
          ticks: {
            font: { size: 12 },
            padding: 8,
          },
        },
      },
    }),
    [rates]
  );

  return (
    <Suspense fallback={<Loading />}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full min-w-0"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Rate Trends</h3>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="weekly">Weekly View</option>
              <option value="monthly">Monthly View</option>
            </select>
          </div>
        </div>
        <div className="w-full overflow-x-auto bg-white rounded-xl p-4 min-h-[250px] md:min-h-[300px] lg:min-h-[400px]">
          <Bar data={data} options={options} />
        </div>
      </motion.div>
    </Suspense>
  );
}
