"use client";

import React from "react";

const normalize = (s) => s?.trim().toLowerCase() || "";

export default function SaudaTable({
  company,
  rateMap,
  entries,
  totalTons,
  handleChange,
  handleUnitSave,
  addRow,
  descKey,
  descSuggestions,
  fetchDescriptionSuggestions,
  setDescSuggestions,
}) {
  let sl = 0;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700 text-sm md:text-base shadow-sm">
        <thead>
          <tr className="bg-green-600 dark:bg-green-700 text-white text-left">
            <th className="px-4 py-3">Sl.</th>
            <th className="px-4 py-3">Unit</th>
            <th className="px-4 py-3">Commodity</th>
            <th className="px-4 py-3">Target Quantity</th>
            <th className="px-4 py-3">Rate</th>
            <th className="px-4 py-3"></th>
            <th className="px-4 py-3">Sauda Details</th>
            <th className="px-4 py-3">Total Tons</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {company.location.flatMap((unit) =>
            company.commodities.map((commodity) => {
              const keyNorm = `${normalize(unit)}-${normalize(commodity)}`;
              const rateObj = rateMap[keyNorm] || {};
              const newRate = rateObj.newRate || 0;
              const quantityNum = Number.isFinite(rateObj.quantity)
                ? rateObj.quantity
                : null;
              const key = `${unit}-${commodity}`;
              const list = entries[key] || [];
              const enteredTons = totalTons(key);
              const remaining =
                quantityNum != null ? quantityNum - enteredTons : "-";

              if (newRate === 0) return null;
              sl += 1;

              return (
                <tr
                  key={key}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-3 py-2">{sl}</td>
                  <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-200">
                    {unit}
                  </td>
                  <td className="px-3 py-2 dark:text-gray-300">{commodity}</td>
                  <td className="px-3 py-2 dark:text-gray-300">
                    {quantityNum != null
                      ? `${quantityNum} - ${enteredTons} = ${remaining}`
                      : "-"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-semibold text-blue-700 dark:text-blue-400">
                    ₹ {newRate}
                  </td>
                  <td colSpan={2} className="space-y-1 px-3 py-2">
                    {list.map((e, idx) => {
                      const isFilled =
                        e?.tons && e?.finalRate && e?.description;
                      const isCurrent = descKey === `${key}-${idx}`;

                      return (
                        <div
                          key={idx}
                          className={`
                            flex flex-col sm:flex-row flex-wrap gap-3 p-4 rounded-xl shadow-md transition-colors
                            border
                            ${
                              isFilled
                                ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                                : "border-red-300 bg-red-50 dark:bg-red-900/20"
                            }
                          `}
                        >
                          <span className="text-base font-semibold text-gray-600 dark:text-gray-300">
                            {String.fromCharCode(97 + idx)}.
                          </span>

                          {/* Rate */}
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              ₹
                            </span>
                            <input
                              type="number"
                              placeholder="Rate"
                              className="w-20 rounded border border-gray-300 dark:border-gray-700 
                                bg-white dark:bg-gray-800 
                                text-gray-800 dark:text-gray-200 
                                px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
                              value={e.finalRate}
                              onChange={(ev) =>
                                handleChange(
                                  key,
                                  idx,
                                  "finalRate",
                                  ev.target.value
                                )
                              }
                            />
                          </div>

                          {/* Tons */}
                          <input
                            type="number"
                            placeholder="Tons"
                            className="w-20 rounded border border-gray-300 dark:border-gray-700 
                              bg-white dark:bg-gray-800 
                              text-gray-800 dark:text-gray-200 
                              px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
                            value={e.tons}
                            onChange={(ev) =>
                              handleChange(key, idx, "tons", ev.target.value)
                            }
                          />

                          {/* Description + suggestions */}
                          <div className="relative flex-grow">
                            <input
                              type="text"
                              placeholder="Description"
                              className="w-full rounded border border-gray-300 dark:border-gray-700 
                                bg-white dark:bg-gray-800 
                                text-gray-800 dark:text-gray-200 
                                px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
                              value={e.description}
                              onChange={(ev) => {
                                const val = ev.target.value;
                                handleChange(key, idx, "description", val);
                                fetchDescriptionSuggestions(val, key, idx);
                              }}
                            />
                            {descSuggestions.length > 0 && isCurrent && (
                              <ul
                                className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto 
                                  border border-gray-300 dark:border-gray-700 
                                  bg-white dark:bg-gray-800 
                                  rounded shadow-lg"
                              >
                                {descSuggestions.map((s, i) => (
                                  <li
                                    key={i}
                                    className="cursor-pointer px-4 py-2 text-sm 
                                      hover:bg-blue-100 dark:hover:bg-blue-900/40 
                                      text-gray-700 dark:text-gray-200"
                                    onClick={() => {
                                      handleChange(key, idx, "description", s);
                                      setDescSuggestions([]);
                                    }}
                                  >
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>

                          {e.showOthers || e.others !== "" ? (
                            <input
                              type="text"
                              placeholder="Others"
                              className="w-full rounded border border-yellow-300 dark:border-yellow-600 
      bg-white dark:bg-gray-800 
      text-gray-800 dark:text-gray-200 
      px-3 py-2 text-sm focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500"
                              value={e.others || ""}
                              onChange={(ev) =>
                                handleChange(
                                  key,
                                  idx,
                                  "others",
                                  ev.target.value
                                )
                              }
                            />
                          ) : (
                            <button
                              type="button"
                              className="text-xs text-blue-600 dark:text-blue-400 underline"
                              onClick={() =>
                                handleChange(key, idx, "showOthers", true)
                              }
                            >
                              + notes
                            </button>
                          )}

                          {/* Sauda No */}
                          <input
                            type="number"
                            placeholder="Sauda No"
                            className="w-24 rounded border border-orange-400 dark:border-orange-600 
                              bg-white dark:bg-gray-800 
                              text-gray-800 dark:text-gray-200 
                              px-2 py-1 text-sm focus:ring-2 focus:ring-orange-500"
                            value={e.saudaNo}
                            onChange={(ev) =>
                              handleChange(key, idx, "saudaNo", ev.target.value)
                            }
                          />

                          {/* Save button */}
                          <button
                            type="button"
                            onClick={() => handleUnitSave(key, idx)}
                            className="ml-2 rounded bg-green-600 dark:bg-green-500 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      );
                    })}
                    <div className="flex items-center gap-4 mt-1">
                      <button
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        onClick={() => addRow(key, newRate)}
                      >
                        + Add Sauda
                      </button>
                      {quantityNum != null && (
                        <div className="text-xs text-red-600 dark:text-red-400">
                          Balance: {remaining}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-bold text-green-700 dark:text-green-400">
                    {enteredTons} Tons
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
