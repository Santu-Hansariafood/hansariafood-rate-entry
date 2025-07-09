"use client";

import React, { useEffect, useState, Suspense } from "react";
import axiosInstance from "@/lib/axiosInstance/axiosInstance";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

const SaudaTonsChart = () => {
  const [saudaData, setSaudaData] = useState([]);
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
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get("/save-sauda/sauda-total-by-date");
        const result = res.data;

        const parsed = result
          .map(({ date, totalTons }) => {
            const [day, month, year] = date.split("-").map(Number);
            const dateObj = new Date(year, month - 1, day);

            return {
              date: dateObj,
              label: dateObj.toLocaleDateString("en-GB"),
              totalTons,
            };
          })
          .filter((item) => !isNaN(item.date));

        setSaudaData(parsed);
      } catch (err) {
        console.error("Error fetching sauda data:", err);
        toast.error("Failed to load sauda tons data");
      }
    };

    fetchData();
  }, []);

  const filteredData = saudaData
    .filter(
      (d) =>
        d.date.getMonth() === selectedMonth &&
        d.date.getFullYear() === selectedYear
    )
    .sort((a, b) => a.date - b.date);

  const totalForMonth = filteredData.reduce(
    (sum, item) => sum + item.totalTons,
    0
  );

  const chartData = {
    labels: filteredData.map((d) => d.label),
    datasets: [
      {
        label: "Total Tons",
        data: filteredData.map((d) => d.totalTons),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "#ff6384",
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
        text: `Total Sauda Tons - ${monthNames[selectedMonth]} ${selectedYear}`,
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
          Sauda Tons Statistics
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
          {filteredData.length === 0 ? (
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

        <motion.div
          className="mt-6 text-center text-lg font-semibold text-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          This month total sauda: {totalForMonth.toLocaleString()} tons
        </motion.div>
      </motion.div>
    </Suspense>
  );
};

export default SaudaTonsChart;
