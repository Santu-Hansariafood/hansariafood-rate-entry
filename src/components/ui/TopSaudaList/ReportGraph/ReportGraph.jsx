"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Download,
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Filter,
  FileText,
} from "lucide-react";
import Loading from "@/components/common/Loading/Loading";

const PieChartComponent = dynamic(() => import("./PieChartComponent"), {
  loading: () => <Loading />,
  ssr: false,
});
const BarChartComponent = dynamic(() => import("./BarChartComponent"), {
  loading: () => <Loading />,
  ssr: false,
});
const LineChartComponent = dynamic(() => import("./LineChartComponent"), {
  loading: () => <Loading />,
  ssr: false,
});

const ReportGraph = ({ saudaDetails, selectedSeller }) => {
  const [activeTab, setActiveTab] = useState("pie");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [selectedCommodity, setSelectedCommodity] = useState("all");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const processedData = useMemo(() => {
    if (!saudaDetails?.length)
      return { pieData: [], barData: [], lineData: [] };

    const allCommodities = new Set();
    const allLocations = new Set();
    const commodityStats = {};
    const locationStats = {};
    const dailyStats = {};
    const isWithinPeriod = (dateStr) => {
      if (selectedPeriod === "all") return true;

      const now = new Date();
      const filterDate = new Date();

      switch (selectedPeriod) {
        case "7d":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "30d":
          filterDate.setDate(now.getDate() - 30);
          break;
        case "90d":
          filterDate.setDate(now.getDate() - 90);
          break;
        default:
          return true;
      }

      const [dd, mm, yyyy] = dateStr.split("-");
      const entryDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      return entryDate >= filterDate;
    };

    const matchesCommodityFilter = (commodityName) => {
      if (selectedCommodity === "all") return true;
      return commodityName === selectedCommodity;
    };

    saudaDetails.forEach((company) => {
      company.days.forEach((day) => {
        const date = day.date;
        if (isWithinPeriod(date)) {
          if (!dailyStats[date]) {
            dailyStats[date] = { totalTons: 0, totalValue: 0, count: 0 };
          }

          day.units.forEach((unit) => {
            const location = unit.unit;
            allLocations.add(location);

            if (!locationStats[location]) {
              locationStats[location] = { totalTons: 0, totalValue: 0 };
            }

            unit.commodities.forEach((commodity) => {
              const commodityName = commodity.commodity;
              if (matchesCommodityFilter(commodityName)) {
                allCommodities.add(commodityName);

                if (!commodityStats[commodityName]) {
                  commodityStats[commodityName] = {
                    totalTons: 0,
                    totalValue: 0,
                  };
                }

                const tons = commodity.totalTons || 0;
                const value = commodity.saudas.reduce(
                  (sum, sauda) => sum + sauda.tons * sauda.finalRate,
                  0
                );

                commodityStats[commodityName].totalTons += tons;
                commodityStats[commodityName].totalValue += value;
                locationStats[location].totalTons += tons;
                locationStats[location].totalValue += value;
                dailyStats[date].totalTons += tons;
                dailyStats[date].totalValue += value;
                dailyStats[date].count += commodity.saudas.length;
              }
            });
          });
        }
      });
    });

    const pieData = Object.entries(commodityStats).map(([name, stats]) => ({
      name,
      value: stats.totalTons,
      percentage: 0,
    }));
    const totalTons = pieData.reduce((sum, item) => sum + item.value, 0);
    pieData.forEach((item) => {
      item.percentage =
        totalTons > 0 ? ((item.value / totalTons) * 100).toFixed(1) : 0;
    });

    const barData = Object.entries(locationStats).map(([location, stats]) => ({
      location,
      tons: stats.totalTons,
      value: stats.totalValue,
    }));

    const lineData = Object.entries(dailyStats)
      .sort(([a], [b]) => {
        const [da, ma, ya] = a.split("-");
        const [db, mb, yb] = b.split("-");
        return (
          new Date(Number(ya), Number(ma) - 1, Number(da)) -
          new Date(Number(yb), Number(mb) - 1, Number(db))
        );
      })
      .map(([date, stats]) => ({
        date,
        tons: stats.totalTons,
        value: stats.totalValue,
        count: stats.count,
      }));

    return {
      pieData,
      barData,
      lineData,
      allCommodities: Array.from(allCommodities),
    };
  }, [saudaDetails, selectedPeriod, selectedCommodity]);

  const generatePDFReport = async () => {
    setIsGeneratingReport(true);

    try {
      const jsPDF = (await import("jspdf")).default;
      const doc = new jsPDF("p", "mm", "a4");
      doc.setFont("helvetica");
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, 210, 40, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.text("SAUDA ANALYTICS REPORT", 105, 20, { align: "center" });

      doc.setFontSize(16);
      doc.text(`Seller: ${selectedSeller}`, 105, 30, { align: "center" });
      doc.setFillColor(248, 250, 252);
      doc.rect(20, 50, 170, 30, "F");
      doc.setDrawColor(203, 213, 225);
      doc.rect(20, 50, 170, 30, "S");

      doc.setTextColor(75, 85, 99);
      doc.setFontSize(12);
      doc.text(
        `Period: ${selectedPeriod === "all" ? "All Time" : selectedPeriod}`,
        30,
        60
      );
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 30, 67);
      doc.text(
        `Commodity Filter: ${
          selectedCommodity === "all" ? "All Commodities" : selectedCommodity
        }`,
        30,
        74
      );
      const totalTons = processedData.pieData.reduce(
        (sum, item) => sum + item.value,
        0
      );
      const totalValue = processedData.barData.reduce(
        (sum, item) => sum + item.value,
        0
      );
      const totalLocations = processedData.barData.length;
      const totalDays = processedData.lineData.length;
      const summaryCards = [
        {
          title: "Total Tons",
          value: totalTons.toFixed(2),
          color: [59, 130, 246],
        },
        {
          title: "Total Value",
          value: `Rs. ${totalValue.toLocaleString()}`,
          color: [34, 197, 94],
        },
        {
          title: "Active Locations",
          value: totalLocations.toString(),
          color: [168, 85, 247],
        },
        {
          title: "Days Tracked",
          value: totalDays.toString(),
          color: [251, 146, 60],
        },
      ];

      summaryCards.forEach((card, index) => {
        const x = 20 + (index % 2) * 95;
        const y = 90 + Math.floor(index / 2) * 25;

        doc.setFillColor(...card.color);
        doc.rect(x, y, 85, 20, "F");
        doc.setDrawColor(203, 213, 225);
        doc.rect(x, y, 85, 20, "S");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text(card.title, x + 5, y + 8);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(card.value, x + 5, y + 16);
        doc.setFont("helvetica", "normal");
      });
      doc.addPage();
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, 210, 15, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("1. COMMODITY DISTRIBUTION", 105, 10, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFillColor(248, 250, 252);
      doc.rect(20, 25, 80, 80, "F");
      doc.setDrawColor(203, 213, 225);
      doc.rect(20, 25, 80, 80, "S");

      doc.setTextColor(75, 85, 99);
      doc.setFontSize(12);
      doc.text("Pie Chart", 60, 45, { align: "center" });
      doc.setFontSize(10);
      doc.text("(Interactive chart available", 60, 55, { align: "center" });
      doc.text("in online dashboard)", 60, 62, { align: "center" });
      doc.setFillColor(248, 250, 252);
      doc.rect(110, 25, 80, 80, "F");
      doc.setDrawColor(203, 213, 225);
      doc.rect(110, 25, 80, 80, "S");

      doc.setTextColor(75, 85, 99);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Commodity Details:", 115, 35);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      let yPos = 45;
      processedData.pieData.forEach((item, index) => {
        if (yPos < 95) {
          doc.text(`${index + 1}. ${item.name}`, 115, yPos);
          doc.text(
            `${item.value.toFixed(2)} tons (${item.percentage}%)`,
            115,
            yPos + 5
          );
          yPos += 12;
        }
      });

      doc.addPage();
      doc.setFillColor(34, 197, 94);
      doc.rect(0, 0, 210, 15, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("2. LOCATION PERFORMANCE", 105, 10, { align: "center" });
      doc.setFont("helvetica", "normal");

      doc.setFillColor(248, 250, 252);
      doc.rect(20, 25, 170, 60, "F");
      doc.setDrawColor(203, 213, 225);
      doc.rect(20, 25, 170, 60, "S");

      doc.setTextColor(75, 85, 99);
      doc.setFontSize(12);
      doc.text("Bar Chart - Location Performance", 105, 45, {
        align: "center",
      });
      doc.setFontSize(10);
      doc.text("(available in https://hansariafood.site)", 105, 55, {
        align: "center",
      });

      doc.setFillColor(248, 250, 252);
      doc.rect(20, 95, 170, 80, "F");
      doc.setDrawColor(203, 213, 225);
      doc.rect(20, 95, 170, 80, "S");

      doc.setTextColor(75, 85, 99);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Location Details:", 25, 105);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      doc.setFillColor(59, 130, 246);
      doc.rect(25, 110, 40, 8, "F");
      doc.rect(70, 110, 30, 8, "F");
      doc.rect(105, 110, 40, 8, "F");
      doc.rect(150, 110, 30, 8, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Location", 27, 116);
      doc.text("Tons", 72, 116);
      doc.text("Value (Rs.)", 107, 116);
      doc.text("Perf.%", 152, 116);
      doc.setFont("helvetica", "normal");

      yPos = 125;
      processedData.barData.forEach((item, index) => {
        if (yPos < 165) {
          doc.setTextColor(75, 85, 99);
          doc.text(item.location.substring(0, 15), 27, yPos);
          doc.text(item.tons.toFixed(2), 72, yPos);
          doc.text(`Rs. ${item.value.toLocaleString()}`, 107, yPos);
          const perf = ((item.tons / totalTons) * 100).toFixed(1);
          doc.text(`${perf}%`, 152, yPos);
          yPos += 8;
        }
      });

      doc.addPage();
      doc.setFillColor(168, 85, 247);
      doc.rect(0, 0, 210, 15, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("3. DAILY PERFORMANCE TRENDS", 105, 10, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFillColor(248, 250, 252);
      doc.rect(20, 25, 170, 60, "F");
      doc.setDrawColor(203, 213, 225);
      doc.rect(20, 25, 170, 60, "S");

      doc.setTextColor(75, 85, 99);
      doc.setFontSize(12);
      doc.text("Line Chart - Daily Trends", 105, 45, { align: "center" });
      doc.setFontSize(10);
      doc.text("available in https://hansariafood.site", 105, 55, {
        align: "center",
      });
      doc.setFillColor(248, 250, 252);
      doc.rect(20, 95, 170, 80, "F");
      doc.setDrawColor(203, 213, 225);
      doc.rect(20, 95, 170, 80, "S");

      doc.setTextColor(75, 85, 99);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Daily Performance Details:", 25, 105);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setFillColor(168, 85, 247);
      doc.rect(25, 110, 25, 8, "F");
      doc.rect(55, 110, 25, 8, "F");
      doc.rect(85, 110, 35, 8, "F");
      doc.rect(125, 110, 25, 8, "F");
      doc.rect(155, 110, 30, 8, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Date", 27, 116);
      doc.text("Tons", 57, 116);
      doc.text("Value (Rs.)", 87, 116);
      doc.text("Count", 127, 116);
      doc.text("Perf.%", 157, 116);
      doc.setFont("helvetica", "normal");

      const avgTonsPerDay = totalTons / totalDays;
      yPos = 125;
      processedData.lineData.slice(0, 10).forEach((item, index) => {
        if (yPos < 165) {
          doc.setTextColor(75, 85, 99);
          doc.text(item.date, 27, yPos);
          doc.text(item.tons.toFixed(2), 57, yPos);
          doc.text(`Rs. ${item.value.toLocaleString()}`, 87, yPos);
          doc.text(item.count.toString(), 127, yPos);
          const perf = ((item.tons / avgTonsPerDay) * 100).toFixed(1);
          doc.text(`${perf}%`, 157, yPos);
          yPos += 8;
        }
      });
      doc.addPage();
      doc.setFillColor(251, 146, 60);
      doc.rect(0, 0, 210, 15, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("CHART DESCRIPTIONS & INSTRUCTIONS", 105, 10, {
        align: "center",
      });
      doc.setFont("helvetica", "normal");

      const descriptions = [
        {
          title: "Pie Chart - Commodity Distribution",
          description:
            "Shows the distribution of different commodities with percentages and tons. \n Each segment represents a commodity with its contribution to total volume.",
          features: [
            "Hover for detailed values",
            "Click legend to show/hide",
            "Shows tons and percentages",
          ],
        },
        {
          title: "Bar Chart - Location Performance",
          description:
            "Displays performance across different locations with tons and values. \n Blue bars show tons, red bars show value in thousands.",
          features: [
            "Dual-axis chart",
            "Performance indicators",
            "Detailed tooltips",
          ],
        },
        {
          title: "Line Chart - Daily Trends",
          description:
            "Tracks daily performance trends with tons, values, and sauda counts over time. \nShows patterns and peak performance days.",
          features: [
            "Multi-line visualization",
            "Trend analysis",
            "Peak day identification",
          ],
        },
      ];

      let descY = 25;
      descriptions.forEach((desc, index) => {
        doc.setFillColor(248, 250, 252);
        doc.rect(20, descY, 170, 50, "F");
        doc.setDrawColor(203, 213, 225);
        doc.rect(20, descY, 170, 50, "S");

        doc.setTextColor(75, 85, 99);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(desc.title, 25, descY + 8);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(desc.description, 25, descY + 18);

        doc.setFontSize(9);
        desc.features.forEach((feature, fIndex) => {
          doc.text(`• ${feature}`, 25, descY + 28 + fIndex * 5);
        });

        descY += 60;
      });
      doc.setFillColor(75, 85, 99);
      doc.rect(0, 280, 210, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text("Generated by Hansaria Food Sauda Team", 105, 285, {
        align: "center",
      });
      doc.save(
        `${selectedSeller}_Sauda_Report_${
          new Date().toISOString().split("T")[0]
        }.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF report. Please try again.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (!selectedSeller || !saudaDetails?.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <BarChart3 className="mx-auto h-16 w-16" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Data Available
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Select a seller with sauda data to view reports and charts.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            📊 {selectedSeller} - Analytics Report
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive analysis of sauda performance and trends
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={generatePDFReport}
            disabled={isGeneratingReport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 hover:scale-105 disabled:cursor-not-allowed"
          >
            {isGeneratingReport ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <FileText size={18} />
                Download PDF Report
              </>
            )}
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-600 dark:text-gray-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          {selectedPeriod !== "all" && (
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
              Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-600 dark:text-gray-400" />
          <select
            value={selectedCommodity}
            onChange={(e) => setSelectedCommodity(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Commodities</option>
            {processedData.allCommodities.map((commodity) => (
              <option key={commodity} value={commodity}>
                {commodity}
              </option>
            ))}
          </select>
          {selectedCommodity !== "all" && (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
              Active
            </span>
          )}
        </div>
        {(selectedPeriod !== "all" || selectedCommodity !== "all") && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>📊 Showing filtered data:</span>
            {selectedPeriod !== "all" && (
              <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                {selectedPeriod}
              </span>
            )}
            {selectedCommodity !== "all" && (
              <span className="px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                {selectedCommodity}
              </span>
            )}
            <button
              onClick={() => {
                setSelectedPeriod("all");
                setSelectedCommodity("all");
              }}
              className="px-2 py-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTab("pie")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            activeTab === "pie"
              ? "bg-blue-600 text-white shadow-lg scale-105"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          <PieChart size={18} />
          Commodity Distribution
        </button>

        <button
          onClick={() => setActiveTab("bar")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            activeTab === "bar"
              ? "bg-blue-600 text-white shadow-lg scale-105"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          <BarChart3 size={18} />
          Location Performance
        </button>

        <button
          onClick={() => setActiveTab("line")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            activeTab === "line"
              ? "bg-blue-600 text-white shadow-lg scale-105"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          <TrendingUp size={18} />
          Daily Trends
        </button>
      </div>
      <div className="min-h-[400px] bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        {activeTab === "pie" && (
          <PieChartComponent data={processedData.pieData} />
        )}

        {activeTab === "bar" && (
          <BarChartComponent data={processedData.barData} />
        )}

        {activeTab === "line" && (
          <LineChartComponent data={processedData.lineData} />
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <h3 className="text-sm font-medium opacity-90">Total Tons</h3>
          <p className="text-2xl font-bold">
            {processedData.pieData
              .reduce((sum, item) => sum + item.value, 0)
              .toFixed(2)}
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
          <h3 className="text-sm font-medium opacity-90">Total Value</h3>
          <p className="text-2xl font-bold">
            Rs.{" "}
            {processedData.barData
              .reduce((sum, item) => sum + item.value, 0)
              .toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
          <h3 className="text-sm font-medium opacity-90">Active Locations</h3>
          <p className="text-2xl font-bold">{processedData.barData.length}</p>
        </div>
      </div>
    </div>
  );
};

export default ReportGraph;
