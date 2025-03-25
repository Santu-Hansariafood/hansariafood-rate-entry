"use client";

import { useState, useMemo, Suspense } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import Loading from "../Loading/Loading";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function RateGraph({ rateData, company, location }) {
  const [timeRange, setTimeRange] = useState("weekly");

  const filteredData = useMemo(
    () =>
      rateData.find(
        (item) => item.company === company && item.location === location
      ),
    [rateData, company, location]
  );

  if (!filteredData) return null;

  const oldRatesFiltered = useMemo(() => {
    let oldRates = filteredData.oldRates;
    return timeRange === "weekly"
      ? oldRates.slice(-7)
      : oldRates.filter((_, index) => index % 4 === 0);
  }, [filteredData, timeRange]);

  const { labels, rates, colors } = useMemo(() => {
    const labels = oldRatesFiltered.map((rate) =>
      rate.split(" ")[1].replace(/[()]/g, "")
    );
    if (filteredData.newRate)
      labels.push(filteredData.newRate.split(" ")[1].replace(/[()]/g, ""));

    const rates = [
      ...oldRatesFiltered.map((rate) => parseInt(rate.split(" ")[0], 10)),
      filteredData.newRate
        ? parseInt(filteredData.newRate.split(" ")[0], 10)
        : null,
    ].filter(Boolean);

    const colors = rates.map((rate, index) =>
      index === 0
        ? "rgba(54, 162, 235, 0.9)"
        : rate >= rates[index - 1]
        ? "rgba(46, 204, 113, 0.9)"
        : "rgba(231, 76, 60, 0.9)"
    );

    return { labels, rates, colors };
  }, [oldRatesFiltered, filteredData]);

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: "Rates",
          data: rates,
          backgroundColor: colors,
          borderColor: "rgba(0, 0, 0, 0.1)",
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: colors.map((color) =>
            color.replace("0.9", "1")
          ),
          hoverBorderWidth: 3,
        },
      ],
    }),
    [labels, rates, colors]
  );

  const options = useMemo(
    () => ({
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
    }),
    []
  );

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full min-w-0 p-3">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-700">
            {location} Rate Trends
          </h2>
          <select
            className="p-2 border rounded"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className="h-72 min-w-0 bg-white p-3 rounded-lg shadow-lg">
          <Bar data={data} options={options} />
        </div>
      </div>
    </Suspense>
  );
}
