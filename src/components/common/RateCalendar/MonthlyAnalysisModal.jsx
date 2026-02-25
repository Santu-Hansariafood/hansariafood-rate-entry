"use client";

import { useState, useEffect, useMemo } from "react";
import Modal from "../Modal/Modal";
import useMonthlyAnalysis from "@/hooks/RateCalendar/useMonthlyAnalysis";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Calendar, Package, ArrowUp, ArrowDown, Hash, TrendingUp, Info, Clock } from "lucide-react";
import Loading from "../Loading/Loading";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function MonthlyAnalysisModal({ isOpen, onClose, commodities }) {
  const [commodity, setCommodity] = useState(commodities[0] || "");
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const { data, loading, fetchMonthlyAnalysis } = useMonthlyAnalysis();

  useEffect(() => {
    if (isOpen && commodity) {
      fetchMonthlyAnalysis(commodity, new Date(startDate), new Date(endDate));
    }
  }, [isOpen, commodity, startDate, endDate, fetchMonthlyAnalysis]);

  useEffect(() => {
    if (commodities.length > 0 && !commodity) {
      setCommodity(commodities[0]);
    }
  }, [commodities, commodity]);

  const chartData = useMemo(() => {
    if (!data?.monthlyData || data.monthlyData.length === 0) return null;
    return {
      labels: data.monthlyData.map((m) => m.month),
      datasets: [
        {
          label: "Average Rate (₹)",
          data: data.monthlyData.map((m) => m.avg),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.5)",
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }, [data]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: { callback: (val) => `₹${val}` },
      },
    },
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} className="max-w-6xl h-[90vh] flex flex-col">
      <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-slate-900 rounded-2xl">
        <div className="flex flex-col gap-6">
          {/* Header & Selectors */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <TrendingUp className="w-6 h-6 text-green-600" />
              Monthly Analysis Report
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all"
                >
                  {commodities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 shadow-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-sm outline-none border-none p-0 focus:ring-0 w-32 dark:text-slate-200"
                />
                <span className="text-slate-300">|</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-sm outline-none border-none p-0 focus:ring-0 w-32 dark:text-slate-200"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loading />
            </div>
          ) : data && data.summary ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Summary Cards */}
              <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryCard
                  label="Average Rate"
                  value={`₹${data.summary.avgRate}`}
                  icon={<Hash className="w-5 h-5 text-blue-500" />}
                />
                <SummaryCard
                  label="Maximum Rate"
                  value={`₹${data.summary.maxRate}`}
                  icon={<ArrowUp className="w-5 h-5 text-green-500" />}
                />
                <SummaryCard
                  label="Minimum Rate"
                  value={`₹${data.summary.minRate}`}
                  icon={<ArrowDown className="w-5 h-5 text-red-500" />}
                />
                <SummaryCard
                  label="Total Updates"
                  value={data.summary.totalUpdates}
                  icon={<Info className="w-5 h-5 text-slate-500" />}
                />
              </div>

              {/* Monthly Trend Chart */}
              <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm min-h-[300px]">
                <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Monthly Price Trend</h3>
                <div className="h-[250px]">
                  {chartData ? <Line data={chartData} options={chartOptions} /> : <div className="flex items-center justify-center h-full text-slate-400">Not enough data for trend chart</div>}
                </div>
              </div>

              {/* Monthly Aggregation Table */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Monthly Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500">
                        <th className="text-left pb-2">Month</th>
                        <th className="text-right pb-2">Avg (₹)</th>
                        <th className="text-right pb-2">Max (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.monthlyData.map((m) => (
                        <tr key={m.month} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                          <td className="py-2 text-slate-700 dark:text-slate-300 font-medium">{m.month}</td>
                          <td className="py-2 text-right font-bold text-green-600">₹{m.avg}</td>
                          <td className="py-2 text-right text-slate-600 dark:text-slate-400">₹{m.max}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Company Wise Analysis */}
              <div className="lg:col-span-12 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Company Performance (Avg Price)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.companyWise.map((c) => (
                    <div key={c.company} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{c.company}</div>
                        <div className="text-xs text-slate-500">{c.count} updates in period</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-base font-bold text-green-600">₹{c.avg}</div>
                        <div className="text-[10px] text-slate-400">Avg</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Recent Points */}
              <div className="lg:col-span-12 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Recent Rate Updates (Last 50)
                </h3>
                <div className="overflow-x-auto max-h-80">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white dark:bg-slate-900 shadow-sm">
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500">
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Company</th>
                        <th className="text-left py-3 px-4">Location</th>
                        <th className="text-right py-3 px-4">Rate (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {data.allDataPoints.slice().reverse().map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                            {new Date(p.date).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{p.company}</td>
                          <td className="py-3 px-4 text-slate-500">{p.location}</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-slate-100">₹{p.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Package className="w-12 h-12 opacity-20" />
              <p>No data available for the selected criteria</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function SummaryCard({ label, value, icon }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">{icon}</div>
      <div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{label}</div>
        <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{value}</div>
      </div>
    </div>
  );
}
