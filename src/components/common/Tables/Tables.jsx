"use client";

import React from "react";

const Table = ({ data, columns }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-gray-900">
      <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
        <thead className="bg-green-600 text-white">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className="px-6 py-3 text-sm font-semibold tracking-wider whitespace-nowrap"
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
                className={`transition-all ${
                  rowIndex % 2 === 0
                    ? "bg-green-50 dark:bg-gray-800"
                    : "bg-green-100 dark:bg-gray-700"
                } hover:bg-green-200 dark:hover:bg-green-800`}
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap border-t border-green-200 dark:border-gray-700"
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
                className="text-center py-6 text-gray-500 dark:text-gray-400"
              >
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
