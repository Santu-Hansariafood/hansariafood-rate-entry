"use client";

import React, { useEffect, useRef } from "react";
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChartComponent = ({ data }) => {
  const chartRef = useRef(null);

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Trend Data
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No daily trend data available for the selected period.
          </p>
        </div>
      </div>
    );
  }

  // Filter out invalid data
  const validData = data.filter(
    (item) =>
      item &&
      item.date &&
      typeof item.tons === "number" &&
      !isNaN(item.tons) &&
      typeof item.value === "number" &&
      !isNaN(item.value) &&
      typeof item.count === "number" &&
      !isNaN(item.count)
  );

  if (validData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Valid Data
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No valid trend data available.
          </p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: validData.map((item) => item.date),
    datasets: [
      {
        label: "Tons",
        data: validData.map((item) => item.tons),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: "rgb(59, 130, 246)",
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 3,
        yAxisID: "y",
      },
      {
        label: "Value (₹ thousands)",
        data: validData.map((item) => item.value / 1000),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: "rgb(239, 68, 68)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: "rgb(239, 68, 68)",
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 3,
        yAxisID: "y1",
      },
      {
        label: "Sauda Count",
        data: validData.map((item) => item.count),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: "rgb(34, 197, 94)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "rgb(34, 197, 94)",
        pointHoverBorderColor: "#fff",
        pointHoverBorderWidth: 3,
        yAxisID: "y2",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: "600",
          },
          color: "rgb(75, 85, 99)",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 2,
        cornerRadius: 10,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 12,
        },
        callbacks: {
          title: function (context) {
            return `📅 ${context[0].label}`;
          },
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.parsed.y;

            try {
              if (context.datasetIndex === 0) {
                const maxTons = Math.max(...validData.map((d) => d.tons || 0), 1);
                const performance = maxTons > 0 ? ((value / maxTons) * 100).toFixed(1) : 0;
                return [
                  `⚖️ ${label}: ${Number(value).toFixed(2)} tons`,
                  `📊 Daily Performance: ${performance}%`,
                ];
              } else if (context.datasetIndex === 1) {
                return [
                  `💰 ${label}: ₹${(Number(value) * 1000).toLocaleString()}`,
                  `📈 Value: ${Number(value).toFixed(1)}K (thousands)`,
                ];
              } else {
                return [`📋 ${label}: ${Number(value)} saudas`, `📊 Transaction Count`];
              }
            } catch (err) {
              return ["Error displaying data"];
            }
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "📅 Date",
          font: {
            size: 14,
            weight: "bold",
          },
          color: "rgb(75, 85, 99)",
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          color: "rgb(75, 85, 99)",
          font: {
            size: 11,
            weight: "500",
          },
        },
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
        },
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "⚖️ Tons",
          font: {
            size: 14,
            weight: "bold",
          },
          color: "rgb(75, 85, 99)",
        },
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
          drawOnChartArea: true,
        },
        ticks: {
          color: "rgb(75, 85, 99)",
          font: {
            size: 11,
            weight: "500",
          },
          callback: function (value) {
            return value.toFixed(1) + "t";
          },
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "💰 Value (₹ thousands)",
          font: {
            size: 14,
            weight: "bold",
          },
          color: "rgb(75, 85, 99)",
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: "rgb(75, 85, 99)",
          font: {
            size: 11,
            weight: "500",
          },
          callback: function (value) {
            return value.toFixed(0) + "K";
          },
        },
      },
      y2: {
        type: "linear",
        display: false,
        position: "right",
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    animation: {
      duration: 2500,
      easing: "easeInOutQuart",
      onProgress: function (animation) {
        const chart = animation.chart;
        const ctx = chart.ctx;
        const dataset = chart.data.datasets[0];
        const meta = chart.getDatasetMeta(0);

        if (meta.data.length > 0) {
          meta.data.forEach((point, index) => {
            if (point.hover) {
              point._model.radius = 8;
              point._model.borderWidth = 4;
            }
          });
        }
      },
    },
  };

  useEffect(() => {
    if (chartRef.current) {
      const chart = chartRef.current;
      chart.update("active");
    }
  }, [data]);

  const totalTons = validData.reduce((sum, item) => sum + (item.tons || 0), 0);
  const totalValue = validData.reduce((sum, item) => sum + (item.value || 0), 0);
  const totalSaudas = validData.reduce((sum, item) => sum + (item.count || 0), 0);
  const avgTonsPerDay = validData.length > 0 ? totalTons / validData.length : 0;
  const avgValuePerDay = validData.length > 0 ? totalValue / validData.length : 0;
  const avgSaudasPerDay = validData.length > 0 ? totalSaudas / validData.length : 0;
  const peakDay = validData.length > 0
    ? validData.reduce(
        (max, item) => ((item.tons || 0) > (max.tons || 0) ? item : max),
        validData[0]
      )
    : null;

  return (
    <div className="w-full">
      <div className="h-96 mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <Line
          ref={chartRef}
          data={chartData}
          options={options}
          className="max-w-full max-h-full"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <h4 className="text-sm font-medium opacity-90">📅 Total Period</h4>
          <p className="text-2xl font-bold">{validData.length}</p>
          <p className="text-sm opacity-75">Days tracked</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <h4 className="text-sm font-medium opacity-90">⚖️ Avg Tons/Day</h4>
          <p className="text-2xl font-bold">{avgTonsPerDay.toFixed(2)}</p>
          <p className="text-sm opacity-75">Daily average</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <h4 className="text-sm font-medium opacity-90">💰 Avg Value/Day</h4>
          <p className="text-2xl font-bold">
            ₹{(avgValuePerDay / 1000).toFixed(1)}K
          </p>
          <p className="text-sm opacity-75">Daily revenue</p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <h4 className="text-sm font-medium opacity-90">📋 Avg Saudas/Day</h4>
          <p className="text-2xl font-bold">{avgSaudasPerDay.toFixed(1)}</p>
          <p className="text-sm opacity-75">Daily transactions</p>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <h4 className="text-sm font-medium opacity-90">🏆 Peak Day</h4>
          <p className="text-lg font-bold">{peakDay?.date}</p>
          <p className="text-sm opacity-75">{peakDay?.tons.toFixed(2)} tons</p>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            📅 Daily Performance Details
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  📅 Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ⚖️ Tons
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  💰 Value (₹)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  📋 Sauda Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  📊 Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {validData.map((item, index) => {
                const performance = avgTonsPerDay > 0
                  ? ((item.tons / avgTonsPerDay) * 100).toFixed(1)
                  : 0;
                const isAboveAverage = item.tons > avgTonsPerDay;

                return (
                  <tr
                    key={item.date}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item.tons.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ₹{item.value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ease-out ${
                              isAboveAverage ? "bg-green-500" : "bg-red-500"
                            }`}
                            style={{ width: `${Math.min(performance, 200)}%` }}
                          />
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            isAboveAverage
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {performance}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          💡 Chart Instructions
        </h4>
        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          <li>
            • Hover over points to see detailed daily values and performance
            metrics
          </li>
          <li>
            • Blue line shows tons, red line shows value, green line shows sauda
            count
          </li>
          <li>• Performance bars show daily performance vs average</li>
          <li>• Values are clearly labeled on both axes with units</li>
        </ul>
      </div>
    </div>
  );
};

export default LineChartComponent;
