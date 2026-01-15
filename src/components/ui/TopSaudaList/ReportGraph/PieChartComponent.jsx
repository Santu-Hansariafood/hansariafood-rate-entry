"use client";

import React, { useEffect, useRef } from "react";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

Chart.register(ArcElement, Tooltip, Legend);

const PieChartComponent = ({ data }) => {
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
            No Commodity Data
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No commodity distribution data available for the selected period.
          </p>
        </div>
      </div>
    );
  }

  // Filter out invalid data
  const validData = data.filter(
    (item) =>
      item &&
      item.name &&
      typeof item.value === "number" &&
      !isNaN(item.value) &&
      item.value >= 0
  );

  if (validData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Valid Data
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No valid commodity data available.
          </p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: validData.map((item) => `${item.name} (${item.percentage || 0}%)`),
    datasets: [
      {
        data: validData.map((item) => item.value),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#FF6384",
          "#C9CBCF",
          "#4BC0C0",
          "#FF6384",
        ],
        borderColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#FF6384",
          "#C9CBCF",
          "#4BC0C0",
          "#FF6384",
        ],
        borderWidth: 3,
        hoverBorderWidth: 6,
        hoverBorderColor: "#fff",
        hoverOffset: 15,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      },
    },
    plugins: {
      legend: {
        position: "right",
        align: "center",
        labels: {
          padding: 25,
          usePointStyle: true,
          font: {
            size: 12,
            weight: "600",
          },
          color: "rgb(75, 85, 99)",
          generateLabels: function (chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const percentage = data[i]?.percentage || 0;
                return {
                  text: `${label} - ${value.toFixed(2)} tons`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor[i],
                  lineWidth: 2,
                  pointStyle: "circle",
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
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
            const label = context[0].label.split(" (")[0];
            return `📊 ${label}`;
          },
          label: function (context) {
            try {
              const label = context.label || "";
              const value = context.parsed || 0;
              const dataIndex = context.dataIndex || 0;
              const percentage = validData[dataIndex]?.percentage || 0;
              return [
                `📦 Commodity: ${label.split(" (")[0]}`,
                `⚖️  Tons: ${Number(value).toFixed(2)}`,
                `📈 Percentage: ${percentage}%`,
                `💰 Value: ₹${(Number(value) * 1000).toLocaleString()} (estimated)`,
              ];
            } catch (err) {
              return ["Error displaying data"];
            }
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 2500,
      easing: "easeInOutQuart",
      onProgress: function (animation) {
        const chart = animation.chart;
        const ctx = chart.ctx;
        const dataset = chart.data.datasets[0];
        const meta = chart.getDatasetMeta(0);

        if (meta.data.length > 0) {
          meta.data.forEach((arc, index) => {
            const value = dataset.data[index];
            const total = dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);

            if (arc.hover) {
              arc._model.outerRadius += 5;
              arc._model.innerRadius = Math.max(0, arc._model.innerRadius - 2);
            }
          });
        }
      },
    },
    elements: {
      arc: {
        borderWidth: 3,
        borderColor: "#fff",
      },
    },
  };

  useEffect(() => {
    if (chartRef.current) {
      const chart = chartRef.current;
      chart.update("active");
    }
  }, [data]);


  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 h-96 relative bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <Pie
              ref={chartRef}
              data={chartData}
              options={options}
              className="max-w-full max-h-full"
            />
          </div>
        </div>
        <div className="lg:w-80 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📊 Commodity Summary
            </h3>
            <div className="space-y-3">
              {validData.slice(0, 5).map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-600 shadow-sm"
                      style={{
                        backgroundColor:
                          chartData.datasets[0].backgroundColor[index],
                      }}
                    />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-32">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.percentage}% of total
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {item.value.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      tons
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
            <h4 className="text-sm font-medium opacity-90 mb-2">
              📈 Total Commodities
            </h4>
            <p className="text-2xl font-bold">
              {validData.reduce((sum, item) => sum + (item.value || 0), 0).toFixed(2)} tons
            </p>
            <p className="text-sm opacity-75 mt-1">
              Across {validData.length} commodities
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              💡 Chart Instructions
            </h4>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Hover over segments to see detailed values</li>
              <li>• Click legend items to show/hide segments</li>
              <li>• Values show tons and percentages</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PieChartComponent;
