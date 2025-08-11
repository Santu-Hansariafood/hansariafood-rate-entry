"use client";

import React, { Suspense } from "react";
import { Bar, Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import Loading from "../Loading/Loading";

export const ChartSection = ({
  title,
  monthNames,
  selectedMonth,
  selectedYear,
  chartType,
  setSelectedMonth,
  setSelectedYear,
  setChartType,
  chartData,
  chartOptions,
  noDataMessage = "No data for selected month",
}) => {
  const isDataAvailable = chartData?.labels?.length > 0;

  return (
    <Suspense fallback={<Loading />}>
      <motion.div
        className="p-6 w-full rounded-2xl shadow-xl 
                   bg-white/80 dark:bg-gray-900/70 
                   backdrop-blur-lg border border-green-500/20"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Title */}
        <motion.h2
          className="text-3xl font-extrabold mb-6 text-center sm:text-left 
                     bg-gradient-to-r from-green-500 to-green-700 
                     bg-clip-text text-transparent drop-shadow-sm"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {title}
        </motion.h2>

        {/* Controls */}
        <motion.div
          className="flex flex-col sm:flex-row flex-wrap gap-4 mb-8 
                     justify-center sm:justify-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <select
            className="border border-green-500/40 dark:border-green-400/30 
                       bg-white/70 dark:bg-gray-800/70 
                       px-4 py-2 rounded-xl shadow-sm text-gray-800 dark:text-gray-100
                       focus:ring-2 focus:ring-green-500 outline-none
                       backdrop-blur-sm transition-all"
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
            className="border border-green-500/40 dark:border-green-400/30 
                       bg-white/70 dark:bg-gray-800/70 
                       px-4 py-2 rounded-xl shadow-sm text-gray-800 dark:text-gray-100
                       focus:ring-2 focus:ring-green-500 outline-none
                       backdrop-blur-sm transition-all"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          />

          <select
            className="border border-green-500/40 dark:border-green-400/30 
                       bg-white/70 dark:bg-gray-800/70 
                       px-4 py-2 rounded-xl shadow-sm text-gray-800 dark:text-gray-100
                       focus:ring-2 focus:ring-green-500 outline-none
                       backdrop-blur-sm transition-all"
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
          </select>
        </motion.div>
        <motion.div
          className="w-full aspect-[2/1] max-h-[600px] 
                     bg-white/70 dark:bg-gray-800/70 
                     rounded-2xl p-4 shadow-lg backdrop-blur-md"
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {!isDataAvailable ? (
            <motion.p
              className="text-center text-gray-600 dark:text-gray-300 mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {noDataMessage}
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
