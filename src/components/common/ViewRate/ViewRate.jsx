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
import Loading from "../Loading/Loading";

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
      <motion.div
        className="p-4 max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          className="text-2xl font-semibold mb-4 text-center sm:text-left"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Rate Statistics
        </motion.h2>

        <motion.div
          className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6 justify-center sm:justify-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <select
            className="border px-3 py-2 rounded shadow w-full sm:w-auto"
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
            className="border px-3 py-2 rounded shadow w-full sm:w-auto"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          />

          <select
            className="border px-3 py-2 rounded shadow w-full sm:w-auto"
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
          </select>
        </motion.div>

        <motion.div
          className="w-full h-[400px] sm:h-[500px]"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {filteredRates.length === 0 ? (
            <motion.p
              className="text-center text-gray-600 mt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              No data for selected month
            </motion.p>
          ) : chartType === "bar" ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </motion.div>
      </motion.div>
    </Suspense>
  );
};

export default ViewRate;
