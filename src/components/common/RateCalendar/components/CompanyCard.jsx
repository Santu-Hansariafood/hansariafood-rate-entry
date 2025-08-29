"use client";

import { motion } from "framer-motion";
import { MapPin, Package, Clock } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import Loading from "../../Loading/Loading";
const StatusArrow = dynamic(() => import("./StatusArrow"));
const BadgePill = dynamic(() => import("./BadgePill"));

export default function CompanyCard({
  company,
  selected,
  onClick,
  freshnessDays,
  latestRate,
}) {
  return (
    <Suspense fallback={<Loading />}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
          selected
            ? "bg-blue-100 border-blue-300 shadow-md dark:bg-blue-900/30 dark:border-blue-700"
            : "bg-white/60 hover:bg-white/80 border-slate-200 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 dark:border-slate-700"
        }`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate">
            {company.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <StatusArrow freshnessDays={freshnessDays} />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {latestRate != null ? `₹${latestRate}` : "-"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 mb-2 dark:text-slate-400">
          {(company.type || []).map((t) => (
            <BadgePill key={t} intent="default">
              {t}
            </BadgePill>
          ))}
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {company.location?.length || 0}
          </span>
          <span className="flex items-center gap-1">
            <Package className="w-4 h-4" />
            {company.commodities?.length || 0}
          </span>
          {freshnessDays != null && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {freshnessDays}d
            </span>
          )}
        </div>
      </motion.div>
    </Suspense>
  );
}
