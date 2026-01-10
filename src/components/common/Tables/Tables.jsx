"use client";

import React from "react";
import { Database } from "lucide-react";

const Table = ({ data = [], columns = [] }) => {
  return (
    <div className="relative w-full rounded-2xl border border-border bg-background shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="sticky top-0 z-10 bg-gradient-to-r from-emerald-600 to-green-500 text-white backdrop-blur">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap border-b border-white/20"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="
                    transition-all duration-200
                    hover:bg-emerald-50 dark:hover:bg-emerald-900/30
                    even:bg-muted/40
                  "
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className="
                        px-4 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm
                        text-foreground
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
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Database size={36} className="opacity-40" />
                    <p className="text-sm">No data available</p>
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
