"use client";

import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

export function getGroupRateProgress(group, notifications) {
  const normalize = (value) => String(value ?? "").trim().toLocaleLowerCase();
  const expectedLocations = new Set();

  (group.companies || []).forEach((company) => {
    const companyName = normalize(company?.name);
    (company?.locations || []).forEach((location) => {
      const locationName = normalize(location);
      if (companyName && locationName) {
        expectedLocations.add(`${companyName}|||${locationName}`);
      }
    });
  });

  const updatedLocations = new Set(
    (Array.isArray(notifications) ? notifications : [])
      .filter((rate) => rate.newRateDate || rate.lastUpdated)
      .map(
        (rate) =>
          `${normalize(rate.company || rate.companyName)}|||${normalize(rate.location)}`,
      ),
  );
  const completed = [...expectedLocations].filter((location) =>
    updatedLocations.has(location),
  ).length;
  const total = expectedLocations.size;

  return {
    completed,
    total,
    percentage: total ? Math.round((completed / total) * 100) : 0,
  };
}

const normalize = (value) => String(value ?? "").trim().toLocaleLowerCase();

export function getGroupSaudaProgress(group, notifications, saudaTonsByRateKey) {
  const companyNames = new Set(
    (group.companies || [])
      .map((company) => normalize(company?.name))
      .filter(Boolean),
  );
  const targetQuantities = new Map();

  (Array.isArray(notifications) ? notifications : []).forEach((rate) => {
    const company = normalize(rate.company || rate.companyName);
    const location = normalize(rate.location);
    const commodity = normalize(rate.commodity);
    const quantity = Number(rate.quantity);
    if (
      !companyNames.has(company) ||
      !location ||
      !commodity ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      !(rate.newRateDate || rate.lastUpdated)
    ) {
      return;
    }

    const key = `${company}|||${location}|||${commodity}`;
    if (!targetQuantities.has(key)) {
      targetQuantities.set(key, quantity);
    }
  });

  let total = 0;
  let completed = 0;
  targetQuantities.forEach((quantity, key) => {
    total += quantity;
    completed += Math.min(Number(saudaTonsByRateKey?.[key]) || 0, quantity);
  });

  return {
    completed,
    total,
    percentage: total
      ? Math.min(100, Math.round((completed / total) * 100))
      : 0,
    unit: "tons",
  };
}

export default function RateGroupCard({
  group,
  notifications,
  onClick,
  progressMode = "rate",
  saudaTonsByRateKey,
}) {
  const progress =
    progressMode === "sauda"
      ? getGroupSaudaProgress(group, notifications, saudaTonsByRateKey)
      : getGroupRateProgress(group, notifications);
  const progressTitle =
    progressMode === "sauda"
      ? `${progress.percentage}% of target sauda quantity entered`
      : `${progress.percentage}% of locations have a rate today`;
  const progressValues =
    progressMode === "sauda"
      ? `${progress.completed.toFixed(2)}/${progress.total.toFixed(2)}`
      : `${progress.completed}/${progress.total}`;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-left transition-colors hover:border-emerald-400 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-emerald-100 p-2 group-hover:bg-emerald-200 dark:bg-emerald-900/50 dark:group-hover:bg-emerald-800">
          <Building2 className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="block truncate font-medium text-emerald-900 dark:text-emerald-100">
            {group.name}
          </span>
          <span className="mt-1 block text-sm text-emerald-700 dark:text-emerald-300">
            {(group.companies || []).filter(Boolean).length} companies
          </span>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300">
          <span>
            {progressValues} {progress.unit || "locations"}
          </span>
          <span className="font-semibold opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            {progress.percentage}%
          </span>
        </div>
        <div
          role="progressbar"
          aria-label={`${group.name} ${
            progressMode === "sauda" ? "sauda quantity" : "rate"
          } progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress.percentage}
          title={progressTitle}
          className="h-1.5 overflow-hidden rounded-full bg-emerald-200 dark:bg-emerald-900/70"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-lime-300 via-green-500 to-emerald-700 transition-[width] duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>
    </motion.button>
  );
}
