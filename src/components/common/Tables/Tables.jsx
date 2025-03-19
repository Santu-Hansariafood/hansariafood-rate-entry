"use client";
import React from "react";

const Table = ({ data, columns }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-green-500 text-green-900">
        <thead>
          <tr className="bg-green-600 text-white">
            {columns.map((col, index) => (
              <th
                key={index}
                className="px-4 py-2 border border-green-500 text-left"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`${
                rowIndex % 2 === 0 ? "bg-green-100" : "bg-green-200"
              } hover:bg-green-300 transition-all`}
            >
              {columns.map((col, colIndex) => (
                <td
                  key={colIndex}
                  className="px-4 py-2 border border-green-500"
                >
                  {row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
