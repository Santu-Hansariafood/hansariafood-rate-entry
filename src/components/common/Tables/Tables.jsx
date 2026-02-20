"use client";

import React from "react";
import { Database } from "lucide-react";

const Table = ({ data = [], columns = [] }) => {
  return (
    <div className="relative w-full rounded-3xl border border-emerald-100/70 dark:border-emerald-500/20 bg-white/90 dark:bg-slate-950/80 shadow-md shadow-emerald-500/10 backdrop-blur-sm overflow-hidden">
      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-emerald-500/50 scrollbar-track-transparent">
        <table className="min-w-full text-sm text-left border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white backdrop-blur-sm">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="px-4 sm:px-6 py-3 text-[11px] sm:text-xs font-semibold tracking-[0.12em] uppercase whitespace-nowrap border-b border-white/20 first:pl-5 last:pr-5"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 dark:divide-slate-800/80 bg-gradient-to-b from-slate-50/40 via-background to-background dark:from-slate-900/60 dark:via-slate-950">
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="
                    transition-all duration-200
                    hover:bg-emerald-50/80 dark:hover:bg-emerald-900/40
                    even:bg-muted/30 dark:even:bg-slate-900/40
                    group
                  "
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="
                        px-4 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm
                        text-foreground/90
                        group-hover:text-foreground
                      "
                    >
                      {typeof col.cell === "function"
                        ? col.cell(row)
                        : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shadow-inner shadow-emerald-500/10">
                      <Database size={28} className="opacity-70" />
                    </div>
                    <p className="text-sm font-medium text-foreground/80">
                      No data available
                    </p>
                    <p className="text-xs text-muted-foreground/80">
                      Try changing filters or date range to see results
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
