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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full rounded-3xl border border-white/20
                   bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl
                   shadow-2xl p-6 md:p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <h2
            className="text-2xl md:text-3xl font-extrabold
                         bg-gradient-to-r from-blue-500 to-teal-400
                         bg-clip-text text-transparent"
          >
            {title}
          </h2>

          <div className="flex flex-wrap gap-3">
            <select
              className="px-4 py-2 rounded-full text-sm
                         bg-white/80 dark:bg-gray-800/80
                         border border-gray-200 dark:border-gray-700
                         shadow-sm backdrop-blur
                         focus:outline-none focus:ring-2 focus:ring-blue-400"
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
              className="px-4 py-2 rounded-full text-sm w-28
                         bg-white/80 dark:bg-gray-800/80
                         border border-gray-200 dark:border-gray-700
                         shadow-sm backdrop-blur
                         focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            />
            <select
              className="px-4 py-2 rounded-full text-sm
                         bg-white/80 dark:bg-gray-800/80
                         border border-gray-200 dark:border-gray-700
                         shadow-sm backdrop-blur
                         focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="bar">Bar</option>
              <option value="line">Line</option>
            </select>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="w-full h-[420px] md:h-[520px]
                     rounded-2xl border border-white/20
                     bg-white/80 dark:bg-gray-900/60 backdrop-blur-lg
                     shadow-xl p-4 md:p-6"
        >
          {!isDataAvailable ? (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              {noDataMessage}
            </div>
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
