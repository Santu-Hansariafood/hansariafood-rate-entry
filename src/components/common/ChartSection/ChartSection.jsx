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
          {title}
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
          {!isDataAvailable ? (
            <motion.p
              className="text-center text-gray-600 mt-10"
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
