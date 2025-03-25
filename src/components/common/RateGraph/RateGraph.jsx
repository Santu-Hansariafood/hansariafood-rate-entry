"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function RateGraph({ rateData, company, location }) {
  const filteredData = rateData.find(
    (item) => item.company === company && item.location === location
  );

  if (!filteredData) return null;

  const labels = [
    ...filteredData.oldRates.map((rate) =>
      rate.split(" ")[1].replace(/[()]/g, "")
    ),
  ];
  if (filteredData.newRate) {
    labels.push(filteredData.newRate.split(" ")[1].replace(/[()]/g, ""));
  }

  const rates = [
    ...filteredData.oldRates.map((rate) => parseInt(rate.split(" ")[0], 10)),
    filteredData.newRate
      ? parseInt(filteredData.newRate.split(" ")[0], 10)
      : null,
  ].filter(Boolean);

  const colors = rates.map((rate, index) => {
    if (index === 0) return "rgba(54, 162, 235, 0.9)";
    return rate >= rates[index - 1]
      ? "rgba(46, 204, 113, 0.9)"
      : "rgba(231, 76, 60, 0.9)";
  });

  const data = {
    labels,
    datasets: [
      {
        label: "Rates",
        data: rates,
        backgroundColor: colors,
        borderColor: "rgba(0, 0, 0, 0.1)",
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: colors.map((color) => color.replace("0.9", "1")),
        hoverBorderWidth: 3,
      },
    ],
  };

  const options = {
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
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: "Rate",
          color: "#333",
          font: { size: 14, weight: "bold" },
        },
        grid: { color: "rgba(0, 0, 0, 0.1)" },
      },
      x: {
        title: {
          display: true,
          text: "Date",
          color: "#333",
          font: { size: 14, weight: "bold" },
        },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="w-full min-w-0 p-3">
      <h2 className="text-center text-lg font-semibold mb-3 text-gray-700">
        {location} Rate Trends
      </h2>
      <div className="h-72 min-w-0 bg-white p-3 rounded-lg shadow-lg">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
