import { useState } from "react";

export const useChartFilters = () => {
  const current = new Date();
  const [selectedMonth, setSelectedMonth] = useState(current.getMonth());
  const [selectedYear, setSelectedYear] = useState(current.getFullYear());
  const [chartType, setChartType] = useState("bar");

  return {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    chartType,
    setChartType,
  };
};
