"use client";

import React, { Suspense } from "react";
import Loading from "@/components/common/Loading/Loading";
import dynamic from "next/dynamic";

const normalize = (s) => s?.trim().toLowerCase() || "";
const Dropdown = dynamic(() => import("@/components/common/Dropdown/Dropdown"));
export default function SaudaTable({
  company,
  rateMap,
  entries,
  totalTons,
  handleChange,
  handleUnitSave,
  addRow,
  removeRow,
  saveStatus,
  sellers,
}) {
  let sl = 0;

  return (
    <Suspense fallback={<Loading />}>
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
                    <td className="px-3 py-2 dark:text-gray-300">
                      {commodity}
                    </td>
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
                          e?.tons &&
                          e?.finalRate &&
                          e?.sellerName &&
                          e?.sellerCompany;
                        const entryId = `${key}-${idx}`;

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
                                value={e.finalRate || ""}
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
                            <input
                              type="number"
                              placeholder="Tons"
                              className="w-20 rounded border border-gray-300 dark:border-gray-700 
                              bg-white dark:bg-gray-800 
                              text-gray-800 dark:text-gray-200 
                              px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
                              value={e.tons || ""}
                              onChange={(ev) =>
                                handleChange(key, idx, "tons", ev.target.value)
                              }
                            />
                            <div className="flex flex-col sm:flex-row gap-3 flex-grow">
                              <Dropdown
                                label="Seller"
                                options={sellers.map((s) => ({
                                  label: s.sellerName,
                                  value: s.sellerName,
                                }))}
                                value={e.sellerName || ""}
                                onChange={(val) => {
                                  handleChange(key, idx, "sellerName", val);
                                  handleChange(key, idx, "sellerCompany", "");
                                }}
                                placeholder="Select Seller..."
                              />

                              <Dropdown
                                label="Company"
                                options={
                                  sellers
                                    .find((s) => s.sellerName === e.sellerName)
                                    ?.companies?.map((companyName) => ({
                                      label: companyName,
                                      value: companyName,
                                    })) || []
                                }
                                value={e.sellerCompany || ""}
                                onChange={(val) =>
                                  handleChange(key, idx, "sellerCompany", val)
                                }
                                placeholder="Select Company..."
                              />
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
                            <input
                              type="text"
                              placeholder="Sauda No"
                              className="w-24 rounded border border-orange-400 dark:border-orange-600 
                            bg-gray-100 dark:bg-gray-700 
                            text-gray-500 dark:text-gray-400 
                              px-2 py-1 text-sm cursor-not-allowed"
                              value={e.saudaNo || ""}
                              disabled
                            />

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleUnitSave(key, idx)}
                                className="rounded bg-green-600 dark:bg-green-500 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => removeRow(key, idx)}
                                className="rounded bg-red-600 dark:bg-red-500 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                            {saveStatus[entryId] === "saving" && (
                              <span className="text-blue-500 text-xs">
                                Saving...
                              </span>
                            )}
                            {saveStatus[entryId] === "success" && (
                              <span className="text-green-500 text-xs">
                                ✔ Saved
                              </span>
                            )}
                            {saveStatus[entryId] === "error" && (
                              <span className="text-red-500 text-xs">
                                ✘ Error
                              </span>
                            )}
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
    </Suspense>
  );
}
