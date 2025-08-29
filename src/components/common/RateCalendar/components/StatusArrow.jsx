"use client";

import { ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react";

export default function StatusArrow({ freshnessDays }) {
  if (freshnessDays == null) return null;
  if (freshnessDays <= 3)
    return (
      <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
    );
  if (freshnessDays > 7)
    return (
      <ArrowDownRight className="w-4 h-4 text-rose-600 dark:text-rose-400" />
    );
  return <ArrowRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
}
