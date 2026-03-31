"use client";

import { ChartSection } from "@/components/common/ChartSection/ChartSection";
import { useSaudaTonsData } from "@/hooks/ChartSection/useSaudaTonsData";
import { useChartFilters } from "@/hooks/ChartSection/useChartFilters";
import { Suspense } from "react";
import Loading from "../Loading/Loading";
import dynamic from "next/dynamic";
const Title = dynamic(() => import("@/components/common/Title/Title"));

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

const SaudaTonsChart = () => {
  const {
    selectedMonth,
    selectedYear,
    chartType,
    setSelectedMonth,
    setSelectedYear,
    setChartType,
  } = useChartFilters();
  const data = useSaudaTonsData();

  const filtered = (data || [])
    .filter(
      (d) =>
        d && d.date &&
        d.date.getMonth() === selectedMonth &&
        d.date.getFullYear() === selectedYear
    )
    .sort((a, b) => a.date - b.date);

  const total = filtered.reduce((sum, d) => sum + d.totalTons, 0);

  const chartData = {
    labels: filtered.map((d) => d.label),
    datasets: [
      {
        label: "Total Tons",
        data: filtered.map((d) => d.totalTons),
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
    plugins: {
      title: {
        display: true,
        text: `Total Sauda Tons - ${monthNames[selectedMonth]} ${selectedYear}`,
        font: { size: 18 },
      },
      legend: { position: "top" },
    },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <Suspense fallback={<Loading />}>
      <Title text={`Total Sauda in This Month = ${total} Tons`} />
      <ChartSection
        title="Sauda Tons Statistics"
        monthNames={monthNames}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        chartType={chartType}
        setChartType={setChartType}
        chartData={chartData}
        chartOptions={chartOptions}
        noDataMessage="No sauda data for selected month"
      />
    </Suspense>
  );
};

export default SaudaTonsChart;
