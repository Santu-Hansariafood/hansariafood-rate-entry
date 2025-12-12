"use client";

import React, { Suspense } from "react";
import { Database } from "lucide-react";

const Table = ({ data, columns }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
      <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
        <thead className="bg-gradient-to-r from-green-600 to-green-500 text-white sticky top-0 shadow-sm">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className="px-6 py-3 text-sm font-semibold tracking-wide whitespace-nowrap border-b border-green-400/40"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`transition-all duration-200 ${
                  rowIndex % 2 === 0
                    ? "bg-green-50 dark:bg-gray-800"
                    : "bg-green-100 dark:bg-gray-700"
                } hover:bg-green-200/70 dark:hover:bg-green-800/60 hover:shadow-sm`}
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap border-t border-green-200 dark:border-gray-700 text-sm"
                  >
                    {row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-10 text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center gap-2"
              >
                <Database size={32} className="opacity-50" />
                <span>No data available</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
