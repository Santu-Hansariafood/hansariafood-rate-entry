"use client";

import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { motion } from "framer-motion";
import useRateGroups from "@/hooks/Rate/useRateGroups";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const normalize = (value) => String(value ?? "").trim().toLocaleLowerCase();
const rateKey = (company, location, commodity) =>
  [company, location, commodity].map(normalize).join("|||");

const TargetAchievementChart = ({ rates, saudas, date, today }) => {
  const { groups, loading, error } = useRateGroups();

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

    const dataByGroup = new Map(
      (Array.isArray(groups) ? groups : []).map((group) => [
        group.name,
        { name: group.name, target: 0, achieved: 0 },
      ]),
    );
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
        borderRadius: 6,
      },
      {
        label: "Achieved Sauda quantity",
        data: chartRows.map((item) => item.achieved),
        backgroundColor: chartRows.map((item) =>
          item.achieved > item.target
            ? "rgba(239, 68, 68, 0.82)"
            : "rgba(16, 185, 129, 0.82)",
        ),
        borderRadius: 6,
      },
    ],
  };
  const chartOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 900, easing: "easeOutQuart" },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${Number(context.parsed.x).toLocaleString(
              undefined,
              { maximumFractionDigits: 2 },
            )} tons`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: "Quantity (tons)" },
      },
      y: { ticks: { autoSkip: false } },
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 md:text-2xl">
            Group-wise Target vs Achieved Sauda Quantity
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Compare target and achieved quantities in tons.
          </p>
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
          className="max-h-[640px] overflow-auto rounded-2xl border border-gray-200 bg-white/80 p-4 dark:border-gray-700 dark:bg-gray-900/60 md:p-6"
        >
          <div
            style={{ height: `${Math.max(360, chartRows.length * 42)}px` }}
          >
            <Bar data={chartData} options={chartOptions} />
          </div>
        </motion.div>
      )}
    </motion.section>
  );
};

export default TargetAchievementChart;
