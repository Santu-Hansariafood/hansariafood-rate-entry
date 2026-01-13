"use client";

import React, { Suspense, useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import {
  Chart as ChartJS,
  BarElement,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import Loading from "@/components/common/Loading/Loading";

ChartJS.register(
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
);

const ViewRate = () => {
  const [rateData, setRateData] = useState([]);
  const [chartType, setChartType] = useState("bar");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await axiosInstance.get("/rate");
        const data = res.data;

        const allRates = [];

        data.forEach((item) => {
          item.oldRates.forEach((entry) => {
            const [rateStr, dateStr] = entry.split(" (");
            const date = dateStr?.replace(")", "").trim();
            allRates.push({ date, rate: parseFloat(rateStr) });
          });

          if (item.hasNewRateToday && item.newRate !== "") {
            const today = new Date(item.lastUpdated).toLocaleDateString(
              "en-GB"
            );
            allRates.push({ date: today, rate: parseFloat(item.newRate) });
          }
        });

        const groupedByDate = {};
        allRates.forEach(({ date }) => {
          if (!groupedByDate[date]) groupedByDate[date] = 0;
          groupedByDate[date]++;
        });

        const parsedData = Object.entries(groupedByDate).map(
          ([dateStr, count]) => {
            const [day, month, year] = dateStr.split("/").map(Number);
            return {
              date: new Date(year, month - 1, day),
              count,
              label: dateStr,
            };
          }
        );

        setRateData(parsedData);
      } catch (err) {
        toast.error("Failed to load rate data.");
        console.error("Fetch error:", err);
      }
    };

    fetchRates();
  }, []);

  const filteredRates = rateData
    .filter(
      (item) =>
        item.date.getMonth() === selectedMonth &&
        item.date.getFullYear() === selectedYear
    )
    .sort((a, b) => a.date - b.date);

  const chartData = {
    labels: filteredRates.map((d) => d.label),
    datasets: [
      {
        label: "Rate Entries",
        data: filteredRates.map((d) => d.count),
        backgroundColor: "rgba(0, 112, 243, 0.6)",
        borderColor: "#0070f3",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `Rate Count - ${monthNames[selectedMonth]} ${selectedYear}`,
        font: { size: 18 },
      },
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="relative min-h-screen p-6 bg-gray-100 dark:bg-gray-950 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-teal-400/30 rounded-full blur-3xl" />

        <motion.div
          className="relative z-10 max-w-7xl mx-auto rounded-3xl border border-white/20
                   bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl
                   shadow-2xl p-6 md:p-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          >
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
              Rate Statistics 📊
            </h2>
            <div className="flex flex-wrap gap-3">
              <select
                className="px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80
                         border border-gray-200 dark:border-gray-700
                         shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {monthNames.map((name, i) => (
                  <option key={i} value={i}>
                    {name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                className="px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80
                         border border-gray-200 dark:border-gray-700
                         shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400
                         w-28"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              />

              <select
                className="px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80
                         border border-gray-200 dark:border-gray-700
                         shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
              >
                <option value="bar">Bar</option>
                <option value="line">Line</option>
              </select>
            </div>
          </motion.div>

          <motion.div
            className="rounded-2xl border border-white/20
                     bg-white/80 dark:bg-gray-900/60 backdrop-blur-lg
                     shadow-xl p-4 md:p-6 h-[420px] md:h-[520px]"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {filteredRates.length === 0 ? (
              <motion.div
                className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                No data for selected month 📭
              </motion.div>
            ) : chartType === "bar" ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <Line data={chartData} options={chartOptions} />
            )}
          </motion.div>
        </motion.div>
      </div>
    </Suspense>
  );
};

export default ViewRate;
