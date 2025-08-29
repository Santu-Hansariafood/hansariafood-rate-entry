"use client";

import React, { Suspense, useEffect, useRef } from "react";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChartComponent = ({ data }) => {
  const chartRef = useRef(null);

  const chartData = {
    labels: data.map((item) => item.location),
    datasets: [
      {
        label: "Tons",
        data: data.map((item) => item.tons),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: "rgba(59, 130, 246, 1)",
        hoverBorderColor: "rgba(59, 130, 246, 1)",
        yAxisID: "y",
      },
      {
        label: "Value (₹)",
        data: data.map((item) => item.value / 1000),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: "rgba(239, 68, 68, 1)",
        hoverBorderColor: "rgba(239, 68, 68, 1)",
        yAxisID: "y1",
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
            return `📍 ${context[0].label}`;
          },
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.parsed.y;

            if (context.datasetIndex === 0) {
              return [
                `📦 ${label}: ${value.toFixed(2)} tons`,
                `📊 Performance: ${(
                  (value / Math.max(...data.map((d) => d.tons))) *
                  100
                ).toFixed(1)}%`,
              ];
            } else {
              return [
                `💰 ${label}: ₹${(value * 1000).toLocaleString()}`,
                `📈 Value: ${value.toFixed(1)}K (thousands)`,
              ];
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
          text: "📍 Locations",
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
          meta.data.forEach((bar, index) => {
            if (bar.hover) {
              bar._model.borderWidth = 4;
              bar._model.borderRadius = 12;
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

  if (!data || data.length === 0) {
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
            No Location Data
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No location performance data available for the selected period.
          </p>
        </div>
      </div>
    );
  }

  const totalTons = data.reduce((sum, item) => sum + item.tons, 0);
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const avgTonsPerLocation = totalTons / data.length;
  const topLocation = data.reduce(
    (max, item) => (item.tons > max.tons ? item : max),
    data[0]
  );

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full">
        <div className="h-96 mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <Bar
            ref={chartRef}
            data={chartData}
            options={options}
            className="max-w-full max-h-full"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <h4 className="text-sm font-medium opacity-90">⚖️ Total Tons</h4>
            <p className="text-2xl font-bold">{totalTons.toFixed(2)}</p>
            <p className="text-sm opacity-75">Across all locations</p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <h4 className="text-sm font-medium opacity-90">💰 Total Value</h4>
            <p className="text-2xl font-bold">₹{totalValue.toLocaleString()}</p>
            <p className="text-sm opacity-75">Combined revenue</p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <h4 className="text-sm font-medium opacity-90">
              📊 Avg per Location
            </h4>
            <p className="text-2xl font-bold">
              {avgTonsPerLocation.toFixed(2)}
            </p>
            <p className="text-sm opacity-75">Tons average</p>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <h4 className="text-sm font-medium opacity-90">🏆 Top Location</h4>
            <p className="text-lg font-bold truncate">
              {topLocation?.location}
            </p>
            <p className="text-sm opacity-75">
              {topLocation?.tons.toFixed(2)} tons
            </p>
          </div>
        </div>
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              📍 Location Performance Details
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    📍 Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ⚖️ Tons
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    💰 Value (₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    📊 Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((item, index) => {
                  const performance = ((item.tons / totalTons) * 100).toFixed(
                    1
                  );
                  return (
                    <tr
                      key={item.location}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {item.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.tons.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ₹{item.value.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                              style={{
                                width: `${Math.min(performance, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white font-medium">
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
              • Hover over bars to see detailed values and performance metrics
            </li>
            <li>• Blue bars show tons, red bars show value in thousands</li>
            <li>• Performance bars show relative contribution to total</li>
            <li>• Values are clearly labeled on both axes</li>
          </ul>
        </div>
      </div>
    </Suspense>
  );
};

export default BarChartComponent;
