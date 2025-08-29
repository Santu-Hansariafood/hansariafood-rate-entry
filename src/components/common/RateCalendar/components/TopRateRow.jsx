"use client";

import { Building2 } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import Loading from "../../Loading/Loading";
const StatusArrow = dynamic(() => import("./StatusArrow"));
const BadgePill = dynamic(() => import("./BadgePill"));

export default function TopRateRow({
  company,
  commodity,
  latestRate,
  freshnessDays,
  changeAbs,
  changePct,
}) {
  const changeText =
    typeof changeAbs === "number"
      ? `${changeAbs >= 0 ? "+" : ""}${changeAbs.toFixed(0)}${
          typeof changePct === "number" ? ` (${changePct.toFixed(1)}%)` : ""
        }`
      : "-";
  const changeIntent =
    typeof changeAbs === "number"
      ? changeAbs >= 0
        ? "success"
        : "danger"
      : "default";
  return (
    <Suspense fallback={<Loading />}>
      <div className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg group">
        <div className="flex items-center gap-3 min-w-0">
          <Building2 className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
          <div className="truncate">
            <div className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
              {company}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {commodity}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 relative">
          <StatusArrow freshnessDays={freshnessDays} />
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {latestRate != null ? `₹${latestRate}` : "-"}
          </div>
          {changeText !== "-" && (
            <div className="absolute right-0 -top-8 hidden group-hover:block">
              <div className="px-2 py-1 rounded-md text-xs whitespace-nowrap shadow border bg-white text-slate-800 border-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700">
                <span className="mr-1 text-slate-500 dark:text-slate-400">
                  Change:
                </span>
                <BadgePill intent={changeIntent}>{changeText}</BadgePill>
              </div>
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
}
