"use client";

import { useMemo, useRef, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import useRateGroups from "@/hooks/Rate/useRateGroups";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
);

const normalize = (value) => String(value ?? "").trim().toLocaleLowerCase();
const rateKey = (company, location, commodity) =>
  [company, location, commodity].map(normalize).join("|||");

const TargetAchievementChart = ({ rates, saudas, date, today }) => {
  const [chartType, setChartType] = useState("bar");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const chartRef = useRef(null);
  const { groups, loading, error } = useRateGroups();

  const handleDownloadPdf = async () => {
    const canvas = chartRef.current?.querySelector("canvas");
    if (!canvas) {
      toast.error("The chart is not ready to export");
      return;
    }

    setIsExportingPdf(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const pdf = new jsPDF("landscape", "mm", "a4");
      const margin = 10;
      const headingHeight = 24;
      const imageData = canvas.toDataURL("image/png");
      const image = pdf.getImageProperties(imageData);
      const maxWidth = pdf.internal.pageSize.getWidth() - margin * 2;
      const maxHeight =
        pdf.internal.pageSize.getHeight() - headingHeight - margin;
      const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
      const imageWidth = image.width * scale;
      const imageHeight = image.height * scale;
      const imageX = (pdf.internal.pageSize.getWidth() - imageWidth) / 2;

      pdf.setFontSize(16);
      pdf.text("Group-wise Target vs Achieved Sauda Quantity", margin, 11);
      pdf.setFontSize(10);
      pdf.text(`Date: ${date}`, margin, 18);
      pdf.addImage(
        imageData,
        "PNG",
        imageX,
        headingHeight,
        imageWidth,
        imageHeight,
      );
      pdf.save(`Group_Target_Achieved_Sauda_${date}.pdf`);
    } catch (exportError) {
      console.error("Failed to export Sauda quantity graph:", exportError);
      toast.error("Failed to download the graph PDF");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const quantityByTarget = useMemo(() => {
    const dataByKey = new Map();

    (Array.isArray(rates) ? rates : []).forEach((rate) => {
      const company = String(rate.company || "").trim();
      const location = String(rate.location || "").trim();
      const commodity = String(rate.commodity || "").trim();
      const target = Number(rate.quantity);
      if (
        !company ||
        !location ||
        !commodity ||
        !Number.isFinite(target) ||
        target <= 0
      ) {
        return;
      }

      const key = rateKey(company, location, commodity);
      if (!dataByKey.has(key)) {
        dataByKey.set(key, {
          company,
          location,
          commodity,
          target,
          achieved: 0,
        });
      }
    });

    (Array.isArray(saudas) ? saudas : []).forEach((sauda) => {
      const company = String(sauda.company || "").trim();
      const location = String(sauda.unit || "").trim();
      const commodity = String(sauda.commodity || "").trim();
      const achieved = Number(sauda.tons);
      if (
        !company ||
        !location ||
        !commodity ||
        !Number.isFinite(achieved) ||
        achieved <= 0
      ) {
        return;
      }

      const key = rateKey(company, location, commodity);
      if (!dataByKey.has(key)) {
        dataByKey.set(key, {
          company,
          location,
          commodity,
          target: 0,
          achieved: 0,
        });
      }
      dataByKey.get(key).achieved += achieved;
    });

    return [...dataByKey.values()].sort((a, b) =>
      `${a.company} ${a.location} ${a.commodity}`.localeCompare(
        `${b.company} ${b.location} ${b.commodity}`,
      ),
    );
  }, [rates, saudas]);

  const groupWiseData = useMemo(() => {
    const groupNamesByCompany = new Map();
    (Array.isArray(groups) ? groups : []).forEach((group) => {
      (group.companies || []).forEach((company) => {
        const companyName = normalize(company?.name || company);
        if (!companyName) return;
        const names = groupNamesByCompany.get(companyName) || new Set();
        names.add(group.name);
        groupNamesByCompany.set(companyName, names);
      });
    });

    const dataByGroup = new Map();
    quantityByTarget.forEach((item) => {
      const companyGroups = groupNamesByCompany.get(normalize(item.company));
      const names = companyGroups?.size ? [...companyGroups] : ["Ungrouped"];

      names.forEach((name) => {
        const groupData = dataByGroup.get(name) || {
          name,
          target: 0,
          achieved: 0,
        };
        groupData.target += item.target;
        groupData.achieved += item.achieved;
        dataByGroup.set(name, groupData);
      });
    });

    return [...dataByGroup.values()].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [groups, quantityByTarget]);

  const chartRows = groupWiseData;
  const chartData = {
    labels: chartRows.map((item) => item.name),
    datasets: [
      {
        label: "Target quantity",
        data: chartRows.map((item) => item.target),
        backgroundColor: "rgba(14, 165, 233, 0.78)",
        borderColor: "#0ea5e9",
        pointBackgroundColor: "#0ea5e9",
        borderWidth: 3,
        borderRadius: 6,
        tension: 0.35,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 7,
      },
      {
        label: "Achieved Sauda quantity",
        data: chartRows.map((item) => item.achieved),
        backgroundColor: chartRows.map((item) =>
          item.achieved > item.target
            ? "rgba(239, 68, 68, 0.82)"
            : "rgba(16, 185, 129, 0.82)",
        ),
        borderColor: "#10b981",
        pointBackgroundColor: chartRows.map((item) =>
          item.achieved > item.target ? "#ef4444" : "#10b981",
        ),
        pointBorderColor: chartRows.map((item) =>
          item.achieved > item.target ? "#ef4444" : "#10b981",
        ),
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 7,
        borderRadius: 6,
        tension: 0.35,
        fill: false,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 900, easing: "easeOutQuart" },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${Number(context.parsed.y).toLocaleString(
              undefined,
              { maximumFractionDigits: 2 },
            )} tons`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Quantity (tons)" },
        ticks: {
          callback: (value) =>
            Number(value).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            }),
        },
      },
    },
  };

  return (
    <motion.section
      role="region"
      aria-label="Target and achieved Sauda quantity"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 max-w-7xl mx-auto mt-6 rounded-3xl border border-white/20 bg-white/70 p-6 shadow-2xl backdrop-blur-xl dark:bg-gray-900/70 md:p-8"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            className="bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text
                       text-xl font-extrabold text-transparent md:text-2xl"
          >
            Group-wise Target vs Achieved Sauda Quantity
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Compare target and achieved quantities in tons.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            className="rounded-full border border-gray-200 bg-white/80 px-4 py-2
                       text-sm shadow-sm backdrop-blur dark:border-gray-700
                       dark:bg-gray-800/80"
            value={chartType}
            onChange={(event) => setChartType(event.target.value)}
            aria-label="Chart type"
          >
            <option value="bar">Vertical bars</option>
            <option value="line">Line graph</option>
          </select>
          {date === today && chartRows.length > 0 && !loading && !error && (
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm
                         font-semibold text-white shadow-sm transition
                         hover:bg-emerald-700 disabled:cursor-wait
                         disabled:opacity-60"
            >
              {isExportingPdf ? "Preparing PDF..." : "Download PDF"}
            </button>
          )}
        </div>
      </div>

      {date !== today ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          Target quantities are available for today only. Select today to view
          the comparison chart.
        </p>
      ) : loading ? (
        <p className="py-12 text-center text-gray-500 dark:text-gray-400">
          Loading group data...
        </p>
      ) : error ? (
        <p
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
        >
          Failed to load group data: {error}
        </p>
      ) : chartRows.length === 0 ? (
        <p className="py-12 text-center text-gray-500 dark:text-gray-400">
          No target or achieved Sauda quantities found for today.
        </p>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="w-full overflow-x-auto rounded-2xl border border-white/20
                     bg-white/80 p-4 shadow-xl dark:bg-gray-900/60 md:p-6"
        >
          <div
            ref={chartRef}
            className="h-[420px] md:h-[520px]"
            style={{ minWidth: `${Math.max(700, chartRows.length * 110)}px` }}
          >
            {chartType === "bar" ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <Line data={chartData} options={chartOptions} />
            )}
          </div>
        </motion.div>
      )}
    </motion.section>
  );
};

export default TargetAchievementChart;
